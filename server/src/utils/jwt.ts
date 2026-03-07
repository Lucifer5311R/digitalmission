import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types';

export function generateAccessToken(user: AuthUser): string {
  const options: SignOptions = { expiresIn: env.jwt.expiry as any };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwt.secret,
    options
  );
}

export function generateRefreshToken(user: AuthUser): string {
  const options: SignOptions = { expiresIn: env.jwt.refreshExpiry as any };
  return jwt.sign(
    { id: user.id },
    env.jwt.refreshSecret,
    options
  );
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, env.jwt.secret) as AuthUser;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { id: string };
}
