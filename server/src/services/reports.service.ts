import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Session, User, Class, TrainerRating } from '../models';
import { jsonToCsv } from '../utils/csvExport';
import { AppError } from '../middleware/errorHandler';

export class ReportsService {
  async getAttendanceReport(filters: { startDate?: string; endDate?: string; format?: string }) {
    const { startDate, endDate, format = 'json' } = filters;
    const where: any = {};

    if (startDate || endDate) {
      where.check_in_time = {};
      if (startDate) where.check_in_time[Op.gte] = new Date(startDate);
      if (endDate) where.check_in_time[Op.lte] = new Date(endDate);
    }

    const sessions = await Session.findAll({
      where,
      include: [
        { model: User, as: 'trainer', attributes: ['id', 'name', 'email'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'location'] },
      ],
      order: [['check_in_time', 'DESC']],
      raw: true,
      nest: true,
    });

    if (format === 'csv') {
      const csvData = sessions.map((s: any) => ({
        'Trainer Name': s.trainer?.name || '',
        'Trainer Email': s.trainer?.email || '',
        'Class Name': s.class?.name || '',
        'Location': s.class?.location || '',
        'Check In': s.check_in_time,
        'Check Out': s.check_out_time || '',
        'Duration (min)': s.duration_minutes || '',
        'Status': s.status,
      }));
      return { csv: jsonToCsv(csvData), type: 'csv' };
    }

    return { data: sessions, type: 'json' };
  }

  async getTrainerReport(trainerId: string) {
    const trainer = await User.findByPk(trainerId, {
      attributes: ['id', 'name', 'email', 'status'],
    });
    if (!trainer) throw new AppError('Trainer not found', 404);

    const [sessions, ratingStats, recentSessions] = await Promise.all([
      Session.findAll({
        where: { trainer_id: trainerId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
          [sequelize.fn('SUM', sequelize.col('duration_minutes')), 'totalMinutes'],
          [sequelize.fn('AVG', sequelize.col('duration_minutes')), 'avgDuration'],
        ],
        raw: true,
      }),
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
        include: [
          { model: Class, as: 'class', attributes: ['id', 'name'] },
        ],
        order: [['check_in_time', 'DESC']],
        limit: 10,
      }),
    ]);

    return {
      trainer,
      summary: {
        totalSessions: parseInt((sessions[0] as any)?.totalSessions || '0'),
        totalHours: Math.round((parseFloat((sessions[0] as any)?.totalMinutes || '0') / 60) * 100) / 100,
        avgSessionDuration: Math.round(parseFloat((sessions[0] as any)?.avgDuration || '0') * 100) / 100,
        averageRating: (ratingStats[0] as any)?.averageRating
          ? Math.round(parseFloat((ratingStats[0] as any).averageRating) * 100) / 100
          : null,
        totalRatings: parseInt((ratingStats[0] as any)?.totalRatings || '0'),
      },
      recentSessions,
    };
  }

  async getClassReport(classId: string) {
    const cls = await Class.findByPk(classId, {
      attributes: ['id', 'name', 'description', 'location', 'capacity', 'status'],
    });
    if (!cls) throw new AppError('Class not found', 404);

    const [sessionStats, recentSessions] = await Promise.all([
      Session.findAll({
        where: { class_id: classId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
          [sequelize.fn('SUM', sequelize.col('duration_minutes')), 'totalMinutes'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('trainer_id'))), 'uniqueTrainers'],
        ],
        raw: true,
      }),
      Session.findAll({
        where: { class_id: classId },
        include: [
          { model: User, as: 'trainer', attributes: ['id', 'name'] },
        ],
        order: [['check_in_time', 'DESC']],
        limit: 10,
      }),
    ]);

    return {
      class: cls,
      summary: {
        totalSessions: parseInt((sessionStats[0] as any)?.totalSessions || '0'),
        totalHours: Math.round((parseFloat((sessionStats[0] as any)?.totalMinutes || '0') / 60) * 100) / 100,
        uniqueTrainers: parseInt((sessionStats[0] as any)?.uniqueTrainers || '0'),
      },
      recentSessions,
    };
  }
}

export default new ReportsService();
