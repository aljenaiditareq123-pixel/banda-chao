import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Makers API', () => {
  describe('GET /api/v1/makers', () => {
    it('should return list of makers with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/makers')
        .expect(200);

      expect(response.body).toHaveProperty('makers');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('pageSize');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.makers)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/makers?page=1&pageSize=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(5);
      expect(response.body.makers.length).toBeLessThanOrEqual(5);
    });

    it('should support country filter', async () => {
      const response = await request(app)
        .get('/api/v1/makers?country=China')
        .expect(200);

      expect(response.body).toHaveProperty('makers');
      // All returned makers should be from China (if any exist)
      response.body.makers.forEach((maker: any) => {
        if (maker.country) {
          expect(maker.country).toBe('China');
        }
      });
    });

    it('should support language filter', async () => {
      const response = await request(app)
        .get('/api/v1/makers?language=zh')
        .expect(200);

      expect(response.body).toHaveProperty('makers');
    });

    it('should support search parameter', async () => {
      const response = await request(app)
        .get('/api/v1/makers?search=test')
        .expect(200);

      expect(response.body).toHaveProperty('makers');
    });
  });

  describe('GET /api/v1/makers/:id', () => {
    it('should return 404 for non-existent maker', async () => {
      const response = await request(app)
        .get('/api/v1/makers/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return maker details if exists', async () => {
      // First, get list of makers
      const listResponse = await request(app)
        .get('/api/v1/makers')
        .expect(200);

      if (listResponse.body.makers.length > 0) {
        const makerId = listResponse.body.makers[0].id;
        const response = await request(app)
          .get(`/api/v1/makers/${makerId}`)
          .expect(200);

        expect(response.body).toHaveProperty('maker');
        expect(response.body.maker.id).toBe(makerId);
      }
    });
  });
});


