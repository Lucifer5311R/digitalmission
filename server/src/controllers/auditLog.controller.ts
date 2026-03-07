import { Response, NextFunction } from 'express';
import auditLogService from '../services/auditLog.service';
import { AuthRequest, ApiResponse } from '../types';

export class AuditLogController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        entity_type: req.query.entity_type as string,
        entity_id: req.query.entity_id as string,
        user_id: req.query.user_id as string,
        action: req.query.action as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      const result = await auditLogService.findAll(filters);
      const response: ApiResponse = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuditLogController();
