import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Products API', () => {
  describe('GET /api/v1/products', () => {
    it('should return list of products with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should only return published products by default', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      response.body.products.forEach((product: any) => {
        expect(product.status).toBe('PUBLISHED');
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&pageSize=10')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });

    it('should support category filter', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=Ceramics')
        .expect(200);

      expect(response.body).toHaveProperty('products');
    });

    it('should support makerId filter', async () => {
      const response = await request(app)
        .get('/api/v1/products?makerId=test-maker-id')
        .expect(200);

      expect(response.body).toHaveProperty('products');
    });

    it('should support search parameter', async () => {
      const response = await request(app)
        .get('/api/v1/products?search=vase')
        .expect(200);

      expect(response.body).toHaveProperty('products');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/products/makers/:makerId', () => {
    it('should return products for a specific maker', async () => {
      const response = await request(app)
        .get('/api/v1/products/makers/test-maker-id')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });
});

