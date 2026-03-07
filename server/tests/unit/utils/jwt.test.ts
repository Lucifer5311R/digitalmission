import jwt from 'jsonwebtoken';

// Must set env vars before importing jwt utils
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt';
import { UserRole } from '@/models/User';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'trainer@test.com',
  role: UserRole.TRAINER,
  name: 'Test Trainer',
};

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should embed user data in the token payload', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.name).toBe(mockUser.name);
    });

    it('should include an expiration claim', () => {
      const token = generateAccessToken(mockUser);
      const decoded = jwt.decode(token) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should only include user id in payload', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBeUndefined();
      expect(decoded.role).toBeUndefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token and return user data', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.name).toBe(mockUser.name);
    });

    it('should throw on an invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('should throw on a token signed with wrong secret', () => {
      const badToken = jwt.sign({ id: mockUser.id }, 'wrong-secret', { expiresIn: '15m' });
      expect(() => verifyAccessToken(badToken)).toThrow();
    });

    it('should throw on an expired token', () => {
      const expiredToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role, name: mockUser.name },
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );
      // Small delay to ensure it's expired
      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(mockUser.id);
    });

    it('should throw on an invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad.token.data')).toThrow();
    });

    it('should throw on a token signed with the access secret instead of refresh', () => {
      const wrongToken = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      expect(() => verifyRefreshToken(wrongToken)).toThrow();
    });
  });
});
