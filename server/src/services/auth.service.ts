import { User } from '../models';
import { UserStatus } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthUser } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; refreshToken: string; user: AuthUser }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is inactive', 403);
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    // Store refresh token
    await user.update({ refresh_token: refreshToken });

    return { token, refreshToken, user: authUser };
  }

  async logout(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (user) {
      await user.update({ refresh_token: null });
    }
  }

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    let decoded: { id: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is inactive', 403);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newToken = generateAccessToken(authUser);
    const newRefreshToken = generateRefreshToken(authUser);

    await user.update({ refresh_token: newRefreshToken });

    return { token: newToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}

export default new AuthService();
