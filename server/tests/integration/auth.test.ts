import request from 'supertest';
import {
  getTestApp,
  syncDatabase,
  closeDatabase,
  seedTestData,
  TestData,
  UserModel,
} from './helpers';

let app: ReturnType<typeof getTestApp>;
let data: TestData;

beforeAll(async () => {
  await syncDatabase();
  data = await seedTestData();
  app = getTestApp();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Auth Integration Tests', () => {
  /* ------------------------------------------------------------ */
  /*  POST /api/auth/login                                         */
  /* ------------------------------------------------------------ */
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'supervisor@test.com', password: 'Test@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('supervisor@test.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'supervisor@test.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'anything' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing fields (validation)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'something' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  /* ------------------------------------------------------------ */
  /*  POST /api/auth/refresh                                       */
  /* ------------------------------------------------------------ */
  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with a valid refresh token', async () => {
      // First login to get a refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'trainer@test.com', password: 'Test@1234' });

      const { refreshToken } = loginRes.body.data;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject an invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/auth/me                                             */
  /* ------------------------------------------------------------ */
  describe('GET /api/auth/me', () => {
    it('should return the current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('supervisor@test.com');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-jwt-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
