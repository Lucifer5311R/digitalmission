import request from 'supertest';
import {
  getTestApp,
  syncDatabase,
  closeDatabase,
  seedTestData,
  TestData,
  UserModel,
} from './helpers';
import { hashPassword } from '@/utils/password';

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

describe('Assignments Integration Tests', () => {
  /* ------------------------------------------------------------ */
  /*  GET /api/assignments                                          */
  /* ------------------------------------------------------------ */
  describe('GET /api/assignments', () => {
    it('should return assignments for authenticated user', async () => {
      const res = await request(app)
        .get('/api/assignments')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('trainer should see their own assignments', async () => {
      const res = await request(app)
        .get('/api/assignments')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/assignments');
      expect(res.status).toBe(401);
    });
  });

  /* ------------------------------------------------------------ */
  /*  POST /api/assignments                                         */
  /* ------------------------------------------------------------ */
  describe('POST /api/assignments', () => {
    let newTrainerId: string;

    beforeAll(async () => {
      // Create a second trainer for assignment tests
      const pw = await hashPassword('Test@1234');
      const trainer2 = await UserModel.create({
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'Trainer Two',
        email: 'trainer2@test.com',
        password_hash: pw,
        role: 'trainer' as any,
        status: 'active' as any,
        refresh_token: null,
      });
      newTrainerId = trainer2.id;
    });

    it('supervisor should create an assignment', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ trainer_id: newTrainerId, class_id: data.classId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject duplicate active assignment', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ trainer_id: newTrainerId, class_id: data.classId });

      expect(res.status).toBe(409);
    });

    it('trainer should NOT create an assignment (RBAC)', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ trainer_id: data.trainerId, class_id: data.classId });

      expect(res.status).toBe(403);
    });

    it('should reject invalid trainer_id', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ trainer_id: 'not-a-uuid', class_id: data.classId });

      expect(res.status).toBe(400);
    });
  });

  /* ------------------------------------------------------------ */
  /*  DELETE /api/assignments/:id                                   */
  /* ------------------------------------------------------------ */
  describe('DELETE /api/assignments/:id', () => {
    it('supervisor should remove an assignment', async () => {
      const res = await request(app)
        .delete(`/api/assignments/${data.assignmentId}`)
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('trainer should NOT remove an assignment (RBAC)', async () => {
      const res = await request(app)
        .delete(`/api/assignments/${data.assignmentId}`)
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
