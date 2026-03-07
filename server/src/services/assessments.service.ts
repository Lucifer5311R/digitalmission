import { Assessment, AssessmentMark, Class, User, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';

export class AssessmentsService {
  async findAll(classId: string) {
    const assessments = await Assessment.findAll({
      where: { class_id: classId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'ASC']],
    });

    const result = await Promise.all(
      assessments.map(async (a) => {
        const marksCount = await AssessmentMark.count({ where: { assessment_id: a.id } });
        return { ...a.toJSON(), marks_count: marksCount };
      })
    );

    return result;
  }

  async findById(id: string) {
    const assessment = await Assessment.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        {
          model: AssessmentMark,
          as: 'marks',
          include: [
            { model: User, as: 'updater', attributes: ['id', 'name'] },
          ],
        },
      ],
    });

    if (!assessment) throw new AppError('Assessment not found', 404);
    return assessment;
  }

  async create(data: { class_id: string; name: string; max_marks: number; weightage?: number; created_by: string }) {
    const cls = await Class.findByPk(data.class_id);
    if (!cls) throw new AppError('Class not found', 404);
    return Assessment.create(data);
  }

  async update(id: string, data: Partial<{ name: string; max_marks: number; weightage: number }>) {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new AppError('Assessment not found', 404);
    await assessment.update(data);
    return assessment;
  }

  async delete(id: string) {
    const assessment = await Assessment.findByPk(id);
    if (!assessment) throw new AppError('Assessment not found', 404);

    const t = await sequelize.transaction();
    try {
      await AssessmentMark.destroy({ where: { assessment_id: id }, transaction: t });
      await assessment.destroy({ transaction: t });
      await t.commit();
      return { message: 'Assessment deleted successfully' };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new AssessmentsService();
