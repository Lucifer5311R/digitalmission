import { Response, NextFunction } from 'express';
import syncService from '../services/sync.service';
import { AuthRequest, ApiResponse } from '../types';

export class SyncController {
  async sync(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { changes } = req.body;
      if (!Array.isArray(changes)) {
        res.status(400).json({ success: false, error: 'Changes must be an array' });
        return;
      }

      const result = await syncService.processSyncBatch(req.user!.id, changes);
      const response: ApiResponse = { success: true, data: result };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await syncService.getSyncStatus(req.user!.id);
      const response: ApiResponse = { success: true, data: status };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new SyncController();
