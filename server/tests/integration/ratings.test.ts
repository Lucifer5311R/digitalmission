import request from 'supertest';
import {
  getTestApp,
  syncDatabase,
  closeDatabase,
  seedTestData,
  TestData,
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

describe('Ratings Integration Tests', () => {
  /* ------------------------------------------------------------ */
  /*  POST /api/ratings                                             */
  /* ------------------------------------------------------------ */
  describe('POST /api/ratings', () => {
    it('supervisor should create a rating for a trainer', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({
          trainer_id: data.trainerId,
          rating: 5,
          feedback_text: 'Excellent performance',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.trainer_id).toBe(data.trainerId);
    });

    it('should create multiple ratings', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({
          trainer_id: data.trainerId,
          rating: 4,
          feedback_text: 'Good job',
        });

      expect(res.status).toBe(201);
    });

    it('trainer should NOT create a rating (RBAC)', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({
          trainer_id: data.trainerId,
          rating: 3,
        });

      expect(res.status).toBe(403);
    });

    it('should reject rating outside 1-5 range', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({
          trainer_id: data.trainerId,
          rating: 10,
        });

      expect(res.status).toBe(400);
    });

    it('should reject missing trainer_id', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(400);
    });

    it('should reject missing rating', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ trainer_id: data.trainerId });

      expect(res.status).toBe(400);
    });

    it('should reject invalid trainer_id', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ trainer_id: 'not-a-uuid', rating: 4 });

      expect(res.status).toBe(400);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/ratings/trainer/:id                                  */
  /* ------------------------------------------------------------ */
  describe('GET /api/ratings/trainer/:id', () => {
    it('should return ratings for a trainer', async () => {
      const res = await request(app)
        .get(`/api/ratings/trainer/${data.trainerId}`)
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('trainer should also be able to view their ratings', async () => {
      const res = await request(app)
        .get(`/api/ratings/trainer/${data.trainerId}`)
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid trainer UUID', async () => {
      const res = await request(app)
        .get('/api/ratings/trainer/not-a-uuid')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get(`/api/ratings/trainer/${data.trainerId}`);

      expect(res.status).toBe(401);
    });
  });
});
