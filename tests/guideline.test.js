const request = require('supertest');
const app = require('../src/index');

describe('Guideline API', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('UGC Guideline Service API');
    });
  });

  describe('GET /api/guidelines', () => {
    it('should return all guidelines with success flag', async () => {
      const response = await request(app).get('/api/guidelines');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/guidelines/:id', () => {
    it('should return 404 for non-existent guideline', async () => {
      const response = await request(app).get('/api/guidelines/99999');
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Guideline not found');
    });
  });

  describe('GET /api/guidelines/category/:category', () => {
    it('should return guidelines for a specific category', async () => {
      const response = await request(app).get('/api/guidelines/category/social-media');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/guidelines', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/guidelines')
        .send({ category: 'test' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title and content are required');
    });
  });

  describe('PUT /api/guidelines/:id', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .put('/api/guidelines/1')
        .send({ category: 'test' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title and content are required');
    });

    it('should return 404 for non-existent guideline', async () => {
      const response = await request(app)
        .put('/api/guidelines/99999')
        .send({ title: 'Test', content: 'Test content' });
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/guidelines/:id', () => {
    it('should return 404 for non-existent guideline', async () => {
      const response = await request(app).delete('/api/guidelines/99999');
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Guideline not found');
    });
  });
});
