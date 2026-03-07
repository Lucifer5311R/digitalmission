process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

import { AuthService } from '@/services/auth.service';
import { UserRole, UserStatus } from '@/models/User';

// Mock the models
jest.mock('@/models', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };
  return { User: mockUser };
});

// Mock password utils
jest.mock('@/utils/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
  comparePassword: jest.fn(),
}));

// Mock jwt utils
jest.mock('@/utils/jwt', () => ({
  generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: jest.fn(),
}));

import { User } from '@/models';
import { comparePassword } from '@/utils/password';
import { verifyRefreshToken } from '@/utils/jwt';

const mockUserModel = User as jest.Mocked<typeof User>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockVerifyRefreshToken = verifyRefreshToken as jest.MockedFunction<typeof verifyRefreshToken>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Trainer',
      email: 'trainer@test.com',
      password_hash: 'hashed_password',
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      refresh_token: null,
      update: jest.fn().mockResolvedValue(undefined),
    };

    it('should login successfully with valid credentials', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(validUser);
      mockComparePassword.mockResolvedValue(true);

      const result = await authService.login('trainer@test.com', 'password123');

      expect(result.token).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe('trainer@test.com');
      expect(validUser.update).toHaveBeenCalledWith({ refresh_token: 'mock-refresh-token' });
    });

    it('should throw for non-existent user', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('nobody@test.com', 'password'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw for inactive user', async () => {
      const inactiveUser = { ...validUser, status: UserStatus.INACTIVE };
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(inactiveUser);

      await expect(authService.login('trainer@test.com', 'password'))
        .rejects.toThrow('Account is inactive');
    });

    it('should throw for wrong password', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(validUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.login('trainer@test.com', 'wrong'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue({ update: mockUpdate });

      await authService.logout('user-id');

      expect(mockUpdate).toHaveBeenCalledWith({ refresh_token: null });
    });

    it('should not throw if user not found', async () => {
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(authService.logout('nonexistent-id')).resolves.toBeUndefined();
    });
  });

  describe('refresh', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Trainer',
      email: 'trainer@test.com',
      role: UserRole.TRAINER,
      status: UserStatus.ACTIVE,
      refresh_token: 'valid-refresh-token',
      update: jest.fn().mockResolvedValue(undefined),
    };

    it('should refresh tokens successfully', async () => {
      mockVerifyRefreshToken.mockReturnValue({ id: validUser.id });
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(validUser);

      const result = await authService.refresh('valid-refresh-token');

      expect(result.token).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should throw for invalid refresh token', async () => {
      mockVerifyRefreshToken.mockImplementation(() => { throw new Error('invalid'); });

      await expect(authService.refresh('bad-token'))
        .rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw if user not found', async () => {
      mockVerifyRefreshToken.mockReturnValue({ id: 'nonexistent' });
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(authService.refresh('some-token'))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw if stored token does not match', async () => {
      mockVerifyRefreshToken.mockReturnValue({ id: validUser.id });
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue({
        ...validUser,
        refresh_token: 'different-stored-token',
      });

      await expect(authService.refresh('some-other-token'))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw for inactive user during refresh', async () => {
      const inactiveUser = { ...validUser, status: UserStatus.INACTIVE, refresh_token: 'valid-refresh-token' };
      mockVerifyRefreshToken.mockReturnValue({ id: inactiveUser.id });
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(inactiveUser);

      await expect(authService.refresh('valid-refresh-token'))
        .rejects.toThrow('Account is inactive');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: UserRole.TRAINER,
      };
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(user);

      const result = await authService.getProfile('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('should throw if user not found', async () => {
      (mockUserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent'))
        .rejects.toThrow('User not found');
    });
  });
});
