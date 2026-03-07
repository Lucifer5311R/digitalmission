import { hashPassword, comparePassword } from '@/utils/password';

describe('Password Utilities', () => {
  const plainPassword = 'SecureP@ss123';

  describe('hashPassword', () => {
    it('should return a hashed string different from the original', async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(plainPassword);
    });

    it('should produce a bcrypt hash (starts with $2a$ or $2b$)', async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should generate different hashes for the same password (different salts)', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for a matching password', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword(plainPassword, hash);
      expect(result).toBe(true);
    });

    it('should return false for a wrong password', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword('WrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for an empty password', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword('', hash);
      expect(result).toBe(false);
    });
  });
});
