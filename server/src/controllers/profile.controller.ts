import { Response, NextFunction } from 'express';
import profileService from '../services/profile.service';
import { AuthRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.getProfile(req.user!.id);
      const response: ApiResponse = { success: true, data: profile };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.updateProfile(req.user!.id, req.body);
      const response: ApiResponse = { success: true, data: profile, message: 'Profile updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No photo file uploaded', 400);
      }
      const photoPath = `/uploads/photos/${req.file.filename}`;
      const profile = await profileService.updatePhoto(req.user!.id, photoPath);
      const response: ApiResponse = { success: true, data: profile, message: 'Profile photo updated successfully' };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfileController();
