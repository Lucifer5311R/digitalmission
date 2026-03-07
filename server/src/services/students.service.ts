import { Op } from 'sequelize';
import fs from 'fs';
import { Student, StudentAttendance, Class } from '../models';
import { StudentStatus } from '../models/Student';
import { AttendanceStatus } from '../models/StudentAttendance';
import { AppError } from '../middleware/errorHandler';
import { parseStudentList } from '../utils/excelParser';

export class StudentsService {
  async findAll(filters: { class_id?: string; status?: string; page?: number; limit?: number }) {
    const { class_id, status = 'active', page = 1, limit = 200 } = filters;
    const where: any = {};
    if (class_id) where.class_id = class_id;
    if (status !== 'all') where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Student.findAndCountAll({
      where,
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      students: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async findById(id: string) {
    const student = await Student.findByPk(id, {
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }],
    });

    if (!student) throw new AppError('Student not found', 404);

    const total = await StudentAttendance.count({ where: { student_id: id } });
    const present = await StudentAttendance.count({ where: { student_id: id, status: AttendanceStatus.PRESENT } });
    const absent = await StudentAttendance.count({ where: { student_id: id, status: AttendanceStatus.ABSENT } });
    const late = await StudentAttendance.count({ where: { student_id: id, status: AttendanceStatus.LATE } });
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100 * 100) / 100 : 0;

    return {
      student,
      attendanceSummary: { total, present, absent, late, percentage },
    };
  }

  async create(data: { register_no: string; name: string; email?: string; phone?: string; class_id: string }) {
    const cls = await Class.findByPk(data.class_id);
    if (!cls) throw new AppError('Class not found', 404);

    return Student.create(data);
  }

  async update(id: string, data: Partial<{ register_no: string; name: string; email: string; phone: string; class_id: string; status: StudentStatus }>) {
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('Student not found', 404);
    await student.update(data);
    return student;
  }

  async delete(id: string) {
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('Student not found', 404);
    await student.update({ status: StudentStatus.INACTIVE });
    return { message: 'Student deactivated successfully' };
  }

  async bulkCreate(classId: string, students: { register_no: string; name: string; email?: string; phone?: string }[]) {
    const cls = await Class.findByPk(classId);
    if (!cls) throw new AppError('Class not found', 404);

    const existing = await Student.findAll({
      where: { class_id: classId, register_no: { [Op.in]: students.map(s => s.register_no) } },
      attributes: ['register_no'],
    });
    const existingSet = new Set(existing.map(s => s.register_no));

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of students) {
      if (existingSet.has(s.register_no)) {
        skipped++;
        continue;
      }
      try {
        await Student.create({ ...s, class_id: classId });
        created++;
      } catch (err: any) {
        errors.push(`Failed to create student ${s.register_no}: ${err.message}`);
      }
    }

    return { created, skipped, errors };
  }

  async uploadStudents(classId: string, filePath: string) {
    try {
      const students = parseStudentList(filePath);
      return await this.bulkCreate(classId, students);
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
}

export default new StudentsService();
