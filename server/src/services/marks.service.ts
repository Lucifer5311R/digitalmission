import { Assessment, AssessmentMark, Student, Class, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';

export class MarksService {
  async getByAssessment(assessmentId: string) {
    const assessment = await Assessment.findByPk(assessmentId);
    if (!assessment) throw new AppError('Assessment not found', 404);

    const marks = await AssessmentMark.findAll({
      where: { assessment_id: assessmentId },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'register_no', 'name'] },
      ],
      order: [[{ model: Student, as: 'student' }, 'name', 'ASC']],
    });

    return marks;
  }

  async getByStudent(studentId: string) {
    const student = await Student.findByPk(studentId);
    if (!student) throw new AppError('Student not found', 404);

    const marks = await AssessmentMark.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Assessment,
          as: 'assessment',
          attributes: ['id', 'name', 'max_marks'],
          include: [
            { model: Class, as: 'class', attributes: ['id', 'name'] },
          ],
        },
      ],
    });

    return marks;
  }

  async bulkUpsert(data: {
    assessment_id: string;
    marks: { student_id: string; marks_obtained: number; remarks?: string }[];
    updated_by: string;
  }) {
    const assessment = await Assessment.findByPk(data.assessment_id);
    if (!assessment) throw new AppError('Assessment not found', 404);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    const t = await sequelize.transaction();
    try {
      for (const mark of data.marks) {
        if (mark.marks_obtained > assessment.max_marks) {
          errors.push(`Student ${mark.student_id}: marks_obtained (${mark.marks_obtained}) exceeds max_marks (${assessment.max_marks})`);
          continue;
        }

        const existing = await AssessmentMark.findOne({
          where: { assessment_id: data.assessment_id, student_id: mark.student_id },
          transaction: t,
        });

        if (existing) {
          await existing.update(
            { marks_obtained: mark.marks_obtained, remarks: mark.remarks ?? existing.remarks, updated_by: data.updated_by },
            { transaction: t }
          );
          updated++;
        } else {
          await AssessmentMark.create(
            { assessment_id: data.assessment_id, student_id: mark.student_id, marks_obtained: mark.marks_obtained, remarks: mark.remarks ?? null, updated_by: data.updated_by },
            { transaction: t }
          );
          created++;
        }
      }

      await t.commit();
      return { updated, created, errors };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateMark(id: string, data: { marks_obtained: number; remarks?: string; updated_by: string }) {
    const mark = await AssessmentMark.findByPk(id, {
      include: [{ model: Assessment, as: 'assessment' }],
    });
    if (!mark) throw new AppError('Mark not found', 404);

    const assessment = (mark as any).assessment as Assessment;
    if (data.marks_obtained > assessment.max_marks) {
      throw new AppError(`marks_obtained (${data.marks_obtained}) exceeds max_marks (${assessment.max_marks})`, 400);
    }

    await mark.update({
      marks_obtained: data.marks_obtained,
      remarks: data.remarks !== undefined ? data.remarks : mark.remarks,
      updated_by: data.updated_by,
    });

    return mark;
  }
}

export default new MarksService();
