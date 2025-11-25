import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});


