import { Op } from 'sequelize';
import sequelize from '../config/database';
import { TrainerRating, User, Session } from '../models';
import { UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class RatingsService {
  async create(data: { trainer_id: string; rated_by: string; rating: number; feedback_text?: string }) {
    // Verify trainer exists
    const trainer = await User.findByPk(data.trainer_id);
    if (!trainer || trainer.role !== UserRole.TRAINER) {
      throw new AppError('Trainer not found', 404);
    }

    return TrainerRating.create(data);
  }

  async findByTrainerId(trainerId: string) {
    return TrainerRating.findAll({
      where: { trainer_id: trainerId },
      include: [
        { model: User, as: 'rater', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async getTrainerStats(trainerId: string) {
    const trainer = await User.findByPk(trainerId, {
      attributes: ['id', 'name', 'email', 'status', 'created_at'],
    });
    if (!trainer) throw new AppError('Trainer not found', 404);

    const [ratingStats, sessionStats] = await Promise.all([
      TrainerRating.findAll({
        where: { trainer_id: trainerId },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
        ],
        raw: true,
      }),
      Session.findAll({
        where: { trainer_id: trainerId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
          [sequelize.fn('SUM', sequelize.col('duration_minutes')), 'totalMinutes'],
        ],
        raw: true,
      }),
    ]);

    const avgRating = (ratingStats[0] as any)?.averageRating;
    const totalRatings = parseInt((ratingStats[0] as any)?.totalRatings || '0');
    const totalSessions = parseInt((sessionStats[0] as any)?.totalSessions || '0');
    const totalMinutes = parseFloat((sessionStats[0] as any)?.totalMinutes || '0');

    return {
      trainer: trainer,
      stats: {
        averageRating: avgRating ? Math.round(parseFloat(avgRating) * 100) / 100 : null,
        totalRatings,
        totalSessions,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      },
    };
  }
}

export default new RatingsService();
