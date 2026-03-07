import { ClassAssignment, User, Class } from '../models';
import { UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class AssignmentsService {
  async findAll(userId: string, role: string) {
    const where: any = { is_active: true };
    if (role === UserRole.TRAINER) {
      where.trainer_id = userId;
    }

    return ClassAssignment.findAll({
      where,
      include: [
        { model: User, as: 'trainer', attributes: ['id', 'name', 'email'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'description', 'scheduled_time', 'location', 'status'] },
        { model: User, as: 'assignedByUser', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByTrainerId(trainerId: string) {
    return ClassAssignment.findAll({
      where: { trainer_id: trainerId, is_active: true },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'description', 'scheduled_time', 'location', 'capacity', 'status'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async create(data: { trainer_id: string; class_id: string; assigned_by: string }) {
    // Verify trainer exists and is a trainer
    const trainer = await User.findByPk(data.trainer_id);
    if (!trainer || trainer.role !== UserRole.TRAINER) {
      throw new AppError('Trainer not found', 404);
    }

    // Verify class exists
    const cls = await Class.findByPk(data.class_id);
    if (!cls) {
      throw new AppError('Class not found', 404);
    }

    // Check for duplicate active assignment
    const existing = await ClassAssignment.findOne({
      where: { trainer_id: data.trainer_id, class_id: data.class_id, is_active: true },
    });
    if (existing) {
      throw new AppError('Trainer is already assigned to this class', 409);
    }

    return ClassAssignment.create(data);
  }

  async delete(id: string) {
    const assignment = await ClassAssignment.findByPk(id);
    if (!assignment) throw new AppError('Assignment not found', 404);
    await assignment.update({ is_active: false });
    return { message: 'Assignment removed successfully' };
  }
}

export default new AssignmentsService();
