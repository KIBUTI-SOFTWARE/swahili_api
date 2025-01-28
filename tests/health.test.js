const request = require('supertest');
const app = require('../server'); 

describe('Health Check API', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});