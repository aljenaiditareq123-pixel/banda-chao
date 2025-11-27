import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/utils/prisma';
import * as jwt from 'jsonwebtoken';

describe('Zod Validation Security Tests', () => {
  let testUser: { id: string; email: string; name: string };
  let authToken: string;

  beforeAll(async () => {
    // Create a test user for authentication
    const email = `test-validation-${Date.now()}@example.com`;
    const password = 'testpassword123';
    const name = 'Test User';

    // Register user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password, name })
      .expect(201);

    testUser = registerResponse.body.user;
    authToken = registerResponse.body.token;
  });

  describe('Users API - PUT /api/v1/users/:id', () => {
    it('should reject empty name (less than 2 characters)', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'A' }) // Only 1 character
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0]).toHaveProperty('field', 'name');
      expect(response.body.errors[0].message).toContain('at least 2 characters');
    });

    it('should reject name that is too long (more than 100 characters)', async () => {
      const longName = 'A'.repeat(101); // 101 characters
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: longName })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors[0].message).toContain('too long');
    });

    it('should reject bio that is too long (more than 500 characters)', async () => {
      const longBio = 'A'.repeat(501); // 501 characters
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: longBio })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors[0].message).toContain('too long');
    });

    it('should reject invalid data types (number instead of string)', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 12345 }) // Number instead of string
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should accept valid data and return 200', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          name: 'Valid Name',
          bio: 'This is a valid bio under 500 characters'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe('Valid Name');
      expect(response.body.user.bio).toBe('This is a valid bio under 500 characters');
    });
  });

  describe('Reports API - POST /api/v1/reports', () => {
    it('should reject invalid targetType', async () => {
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetType: 'INVALID_TYPE',
          targetId: testUser.id,
          reason: 'This is a valid reason with more than 10 characters'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject invalid UUID format for targetId', async () => {
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetType: 'USER',
          targetId: 'not-a-valid-uuid',
          reason: 'This is a valid reason with more than 10 characters'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors[0].message).toContain('Invalid target ID format');
    });

    it('should reject reason that is too short (less than 10 characters)', async () => {
      const response = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetType: 'USER',
          targetId: testUser.id,
          reason: 'Short' // Less than 10 characters
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors[0].message).toContain('at least 10 characters');
    });
  });

  describe('Conversations API - POST /api/v1/conversations', () => {
    it('should reject invalid UUID format for participantId', async () => {
      const response = await request(app)
        .post('/api/v1/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          participantId: 'invalid-uuid-format'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.errors[0].message).toContain('Invalid participant ID format');
    });
  });

  describe('Notifications API - POST /api/v1/notifications/send', () => {
    // Note: This endpoint requires FOUNDER or ADMIN role
    // We'll test validation even if auth fails
    it('should reject invalid UUID format for userId', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'invalid-uuid',
          type: 'TEST',
          title: 'Test Title',
          body: 'Test Body'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should reject empty title', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id,
          type: 'TEST',
          title: '',
          body: 'Test Body'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });
});

