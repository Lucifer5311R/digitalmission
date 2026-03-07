import { Op } from 'sequelize';
import fs from 'fs';
import { sequelize, Student, StudentAttendance, Class } from '../models';
import { AttendanceStatus } from '../models/StudentAttendance';
import { AppError } from '../middleware/errorHandler';
import { parseAttendanceSheet } from '../utils/excelParser';

export class AttendanceService {
  async markAttendance(data: {
    class_id: string;
    date: string;
    records: { student_id: string; status: 'present' | 'absent' | 'late' }[];
    marked_by: string;
    session_id?: string;
  }) {
    const { class_id, date, records, marked_by, session_id } = data;

    const cls = await Class.findByPk(class_id);
    if (!cls) throw new AppError('Class not found', 404);

    const transaction = await sequelize.transaction();
    try {
      const results = [];
      for (const record of records) {
        const existing = await StudentAttendance.findOne({
          where: { student_id: record.student_id, class_id, date },
          transaction,
        });

        if (existing) {
          await existing.update({ status: record.status as AttendanceStatus, marked_by, session_id: session_id || null }, { transaction });
          results.push(existing);
        } else {
          const created = await StudentAttendance.create(
            { student_id: record.student_id, class_id, date, status: record.status as AttendanceStatus, marked_by, session_id: session_id || null },
            { transaction },
          );
          results.push(created);
        }
      }
      await transaction.commit();
      return { marked: results.length, records: results };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getByClassAndDate(classId: string, date: string) {
    return StudentAttendance.findAll({
      where: { class_id: classId, date },
      include: [{ model: Student, as: 'student', attributes: ['id', 'register_no', 'name'] }],
      order: [['created_at', 'ASC']],
    });
  }

  async getByStudent(studentId: string, filters?: { startDate?: string; endDate?: string }) {
    const where: any = { student_id: studentId };
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date[Op.gte] = filters.startDate;
      if (filters.endDate) where.date[Op.lte] = filters.endDate;
    }

    return StudentAttendance.findAll({
      where,
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }],
      order: [['date', 'DESC']],
    });
  }

  async getSummary(classId: string) {
    const students = await Student.findAll({
      where: { class_id: classId, status: 'active' },
      attributes: ['id', 'name', 'register_no'],
      order: [['name', 'ASC']],
    });

    const totalDates = await StudentAttendance.count({
      where: { class_id: classId },
      distinct: true,
      col: 'date',
    });

    const summary = [];
    for (const student of students) {
      const present = await StudentAttendance.count({ where: { student_id: student.id, class_id: classId, status: AttendanceStatus.PRESENT } });
      const absent = await StudentAttendance.count({ where: { student_id: student.id, class_id: classId, status: AttendanceStatus.ABSENT } });
      const late = await StudentAttendance.count({ where: { student_id: student.id, class_id: classId, status: AttendanceStatus.LATE } });
      const total = present + absent + late;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100 * 100) / 100 : 0;

      summary.push({
        student_id: student.id,
        student_name: student.name,
        register_no: student.register_no,
        total_classes: total,
        present,
        absent,
        late,
        percentage,
      });
    }

    return summary;
  }

  async uploadAttendance(classId: string, filePath: string, markedBy: string) {
    try {
      const rows = parseAttendanceSheet(filePath);
      if (!rows.length) throw new AppError('No valid attendance data found in file', 400);

      const students = await Student.findAll({
        where: { class_id: classId },
        attributes: ['id', 'register_no'],
      });
      const regMap = new Map(students.map(s => [s.register_no, s.id]));

      const date = rows[0].date || new Date().toISOString().split('T')[0];
      const records: { student_id: string; status: 'present' | 'absent' | 'late' }[] = [];
      const errors: string[] = [];

      for (const row of rows) {
        const studentId = regMap.get(row.register_no);
        if (!studentId) {
          errors.push(`Student not found: ${row.register_no}`);
          continue;
        }
        if (!['present', 'absent', 'late'].includes(row.status)) {
          errors.push(`Invalid status for ${row.register_no}: ${row.status}`);
          continue;
        }
        records.push({ student_id: studentId, status: row.status as 'present' | 'absent' | 'late' });
      }

      let result = null;
      if (records.length > 0) {
        result = await this.markAttendance({ class_id: classId, date, records, marked_by: markedBy });
      }

      return { marked: result?.marked || 0, errors };
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
}

export default new AttendanceService();
