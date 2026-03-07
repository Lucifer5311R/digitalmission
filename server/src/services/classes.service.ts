import { Op } from 'sequelize';
import { Class, User, ClassAssignment, Session } from '../models';
import { ClassStatus } from '../models/Class';
import { AppError } from '../middleware/errorHandler';

export class ClassesService {
  async findAll(filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Class.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      classes: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async findById(id: string) {
    const cls = await Class.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        {
          model: ClassAssignment,
          as: 'assignments',
          where: { is_active: true },
          required: false,
          include: [{ model: User, as: 'trainer', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!cls) throw new AppError('Class not found', 404);
    return cls;
  }

  async create(data: { name: string; description?: string; scheduled_time?: object; location?: string; capacity?: number; created_by: string; teacher_name?: string; teacher_contact?: string; cr_name?: string; cr_contact?: string }) {
    return Class.create(data);
  }

  async update(id: string, data: Partial<{ name: string; description: string; scheduled_time: object; location: string; capacity: number; status: ClassStatus; teacher_name: string; teacher_contact: string; cr_name: string; cr_contact: string }>) {
    const cls = await Class.findByPk(id);
    if (!cls) throw new AppError('Class not found', 404);
    await cls.update(data);
    return cls;
  }

  async delete(id: string) {
    const cls = await Class.findByPk(id);
    if (!cls) throw new AppError('Class not found', 404);
    await cls.update({ status: ClassStatus.ARCHIVED });
    return { message: 'Class archived successfully' };
  }

  async getStats(id: string) {
    const cls = await Class.findByPk(id);
    if (!cls) throw new AppError('Class not found', 404);

    const [assignmentCount, sessionCount, totalHours] = await Promise.all([
      ClassAssignment.count({ where: { class_id: id, is_active: true } }),
      Session.count({ where: { class_id: id } }),
      Session.sum('duration_minutes', { where: { class_id: id } }),
    ]);

    return {
      classId: id,
      className: cls.name,
      activeTrainers: assignmentCount,
      totalSessions: sessionCount,
      totalHours: Math.round((totalHours || 0) / 60 * 100) / 100,
    };
  }
}

export default new ClassesService();
