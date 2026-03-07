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

describe('Classes Integration Tests', () => {
  /* ------------------------------------------------------------ */
  /*  GET /api/classes                                              */
  /* ------------------------------------------------------------ */
  describe('GET /api/classes', () => {
    it('should return list of classes for authenticated user', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(401);
    });

    it('trainer should also be able to list classes', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  /* ------------------------------------------------------------ */
  /*  GET /api/classes/:id                                          */
  /* ------------------------------------------------------------ */
  describe('GET /api/classes/:id', () => {
    it('should return a single class by id', async () => {
      const res = await request(app)
        .get(`/api/classes/${data.classId}`)
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(data.classId);
      expect(res.body.data.name).toBe('Test Class');
    });

    it('should return 404 for non-existent class', async () => {
      const res = await request(app)
        .get('/api/classes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject invalid UUID', async () => {
      const res = await request(app)
        .get('/api/classes/not-a-uuid')
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(400);
    });
  });

  /* ------------------------------------------------------------ */
  /*  POST /api/classes                                             */
  /* ------------------------------------------------------------ */
  describe('POST /api/classes', () => {
    it('supervisor should create a class', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ name: 'New Class', description: 'Test', location: 'Room 202' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Class');
    });

    it('trainer should NOT be able to create a class (RBAC)', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ name: 'Forbidden Class' });

      expect(res.status).toBe(403);
    });

    it('should reject missing name (validation)', async () => {
      const res = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ description: 'No name provided' });

      expect(res.status).toBe(400);
    });
  });

  /* ------------------------------------------------------------ */
  /*  PUT /api/classes/:id                                          */
  /* ------------------------------------------------------------ */
  describe('PUT /api/classes/:id', () => {
    it('supervisor should update a class', async () => {
      const res = await request(app)
        .put(`/api/classes/${data.classId}`)
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ name: 'Updated Class Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('trainer should NOT update a class (RBAC)', async () => {
      const res = await request(app)
        .put(`/api/classes/${data.classId}`)
        .set('Authorization', `Bearer ${data.trainerToken}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  /* ------------------------------------------------------------ */
  /*  DELETE /api/classes/:id (archives)                            */
  /* ------------------------------------------------------------ */
  describe('DELETE /api/classes/:id', () => {
    it('trainer should NOT delete a class (RBAC)', async () => {
      const res = await request(app)
        .delete(`/api/classes/${data.classId}`)
        .set('Authorization', `Bearer ${data.trainerToken}`);

      expect(res.status).toBe(403);
    });

    it('supervisor should archive a class', async () => {
      // Create a class to archive so we don't mess up other tests
      const createRes = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${data.supervisorToken}`)
        .send({ name: 'Class To Archive' });

      const classId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${data.supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
