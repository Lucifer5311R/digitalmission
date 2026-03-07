import { AuditLog, User } from '../models';
import { Op } from 'sequelize';

export class AuditLogService {
  async findAll(filters: {
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (filters.entity_type) where.entity_type = filters.entity_type;
    if (filters.entity_id) where.entity_id = filters.entity_id;
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.action) where.action = filters.action;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export default new AuditLogService();
