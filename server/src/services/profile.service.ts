import fs from 'fs';
import path from 'path';
import { User } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from '../middleware/errorHandler';

const SENSITIVE_FIELDS = ['password_hash', 'refresh_token'] as const;

export class ProfileService {
  async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: [...SENSITIVE_FIELDS] },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string; password?: string; current_password?: string }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const existing = await User.findOne({ where: { email: data.email } });
      if (existing) {
        throw new AppError('Email already in use', 409);
      }
    }

    // Verify current password before allowing password change
    if (data.password) {
      if (!data.current_password) {
        throw new AppError('Current password is required to set a new password', 400);
      }
      const isValid = await comparePassword(data.current_password, user.password_hash);
      if (!isValid) {
        throw new AppError('Current password is incorrect', 401);
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password) updateData.password_hash = await hashPassword(data.password);

    await user.update(updateData);

    return User.findByPk(userId, {
      attributes: { exclude: [...SENSITIVE_FIELDS] },
    });
  }

  async updatePhoto(userId: string, photoPath: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old photo file if it exists
    if (user.profile_photo) {
      const oldPhotoPath = path.resolve(__dirname, '../../../data', user.profile_photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    await user.update({ profile_photo: photoPath });

    return User.findByPk(userId, {
      attributes: { exclude: [...SENSITIVE_FIELDS] },
    });
  }
}

export default new ProfileService();
