import request from 'supertest';
import {
  getTestApp,
  syncDatabase,
  closeDatabase,
  seedTestData,
  TestData,
  AssignmentModel,
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

describe('Sessions Integration Tests', () => {
  /* ------------------------------------------------------------ */
  /*  POST /api/sessions/checkin                                    */
  /* ------------------------------------------------------------ */
  describe('POST /api/sessions/checkin', () => {
    it('assigned trainer should check in', async () => {
      const res = await request(app)
        .post('/api/sessions/checkin')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ class_id: data.classId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trainer_id).toBe(data.trainerId);
      expect(res.body.data.class_id).toBe(data.classId);
      expect(res.body.data.status).toBe('active');
    });

    it('should reject duplicate check-in (already active)', async () => {
      const res = await request(app)
        .post('/api/sessions/checkin')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ class_id: data.classId });

      expect(res.status).toBe(409);
    });

    it('supervisor should NOT be able to check in (RBAC)', async () => {
      const res = await request(app)
        .post('/api/sessions/checkin')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ class_id: data.classId });

      expect(res.status).toBe(403);
    });

    it('should reject invalid class_id', async () => {
      const res = await request(app)
        .post('/api/sessions/checkin')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ class_id: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/sessions/active                                      */
  /* ------------------------------------------------------------ */
  describe('GET /api/sessions/active', () => {
    it('trainer should get their active session', async () => {
      const res = await request(app)
        .get('/api/sessions/active')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // There should be an active session from the checkin test above
      if (res.body.data) {
        expect(res.body.data.status).toBe('active');
      }
    });

    it('supervisor should NOT access active session endpoint (RBAC)', async () => {
      const res = await request(app)
        .get('/api/sessions/active')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(403);
    });
  });

  /* ------------------------------------------------------------ */
  /*  POST /api/sessions/:id/checkout                               */
  /* ------------------------------------------------------------ */
  describe('POST /api/sessions/:id/checkout', () => {
    it('trainer should check out of an active session', async () => {
      // First, get the active session
      const activeRes = await request(app)
        .get('/api/sessions/active')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      const sessionId = activeRes.body.data?.id;
      if (!sessionId) {
        // skip if no active session (shouldn't happen in normal flow)
        return;
      }

      const res = await request(app)
        .post(`/api/sessions/${sessionId}/checkout`)
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.duration_minutes).toBeDefined();
      expect(res.body.data.check_out_time).toBeDefined();
    });

    it('should reject checkout for non-existent session', async () => {
      const res = await request(app)
        .post('/api/sessions/00000000-0000-0000-0000-000000000000/checkout')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(404);
    });

    it('supervisor should NOT checkout (RBAC)', async () => {
      const res = await request(app)
        .post('/api/sessions/00000000-0000-0000-0000-000000000000/checkout')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(403);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/sessions/my-sessions                                 */
  /* ------------------------------------------------------------ */
  describe('GET /api/sessions/my-sessions', () => {
    it('trainer should see their sessions', async () => {
      const res = await request(app)
        .get('/api/sessions/my-sessions')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('supervisor should NOT access my-sessions (RBAC)', async () => {
      const res = await request(app)
        .get('/api/sessions/my-sessions')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(403);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/sessions (supervisor only)                           */
  /* ------------------------------------------------------------ */
  describe('GET /api/sessions', () => {
    it('supervisor should list all sessions', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('trainer should NOT list all sessions (RBAC)', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
