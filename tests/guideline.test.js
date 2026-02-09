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
    it('should return all guidelines', async () => {
      const response = await request(app).get('/api/guidelines');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
});
