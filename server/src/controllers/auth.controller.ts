import { Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest, ApiResponse } from '../types';

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
