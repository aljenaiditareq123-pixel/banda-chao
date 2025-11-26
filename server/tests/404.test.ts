import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('404 Handler', () => {
  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/v1/non-existent-route')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Route not found');
    expect(response.body).toHaveProperty('code', 'NOT_FOUND');
  });

  it('should return 404 for invalid API version', async () => {
    const response = await request(app)
      .get('/api/v2/makers')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
  });
});



