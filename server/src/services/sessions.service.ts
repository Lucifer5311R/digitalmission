import { Op } from 'sequelize';
import { Session, ClassAssignment, User, Class, SessionNote } from '../models';
import { SessionStatus } from '../models/Session';
import { AppError } from '../middleware/errorHandler';

export class SessionsService {
  async checkin(trainerId: string, classId: string) {
    // Verify assignment
    const assignment = await ClassAssignment.findOne({
      where: { trainer_id: trainerId, class_id: classId, is_active: true },
    });
    if (!assignment) {
      throw new AppError('You are not assigned to this class', 403);
    }

    // Check for active session
    const activeSession = await Session.findOne({
      where: { trainer_id: trainerId, status: SessionStatus.ACTIVE },
    });
    if (activeSession) {
      throw new AppError('You already have an active session. Please check out first.', 409);
    }

    return Session.create({
      trainer_id: trainerId,
      class_id: classId,
      check_in_time: new Date(),
      status: SessionStatus.ACTIVE,
    });
  }

  async checkout(sessionId: string, trainerId: string) {
    const session = await Session.findOne({
      where: { id: sessionId, trainer_id: trainerId, status: SessionStatus.ACTIVE },
    });
    if (!session) {
      throw new AppError('Active session not found', 404);
    }

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(session.check_in_time).getTime();

    if (durationMs < 0) {
      throw new AppError('Checkout time cannot be before check-in time', 400);
    }

    const durationMinutes = Math.round((durationMs / 60000) * 100) / 100;

    await session.update({
      check_out_time: checkOutTime,
      duration_minutes: durationMinutes,
      status: SessionStatus.COMPLETED,
    });

    return session;
  }

  async findMySessions(trainerId: string, filters: { startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { startDate, endDate, page = 1, limit = 20 } = filters;
    const where: any = { trainer_id: trainerId };

    if (startDate || endDate) {
      where.check_in_time = {};
      if (startDate) where.check_in_time[Op.gte] = new Date(startDate);
      if (endDate) where.check_in_time[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Session.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'location'] },
        { model: SessionNote, as: 'notes' },
      ],
      order: [['check_in_time', 'DESC']],
      limit,
      offset,
    });

    return {
      sessions: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async findAll(filters: { startDate?: string; endDate?: string; trainer_id?: string; class_id?: string; page?: number; limit?: number }) {
    const { startDate, endDate, trainer_id, class_id, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (trainer_id) where.trainer_id = trainer_id;
    if (class_id) where.class_id = class_id;
    if (startDate || endDate) {
      where.check_in_time = {};
      if (startDate) where.check_in_time[Op.gte] = new Date(startDate);
      if (endDate) where.check_in_time[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Session.findAndCountAll({
      where,
      include: [
        { model: User, as: 'trainer', attributes: ['id', 'name', 'email'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'location'] },
        { model: SessionNote, as: 'notes' },
      ],
      order: [['check_in_time', 'DESC']],
      limit,
      offset,
    });

    return {
      sessions: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async getActiveSession(trainerId: string) {
    return Session.findOne({
      where: { trainer_id: trainerId, status: SessionStatus.ACTIVE },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'location'] },
        { model: SessionNote, as: 'notes' },
      ],
    });
  }
}

export default new SessionsService();
