import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Setup test database or mocks
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  
  // You can set up a test database here if needed
  // For now, we'll use the same database but with test isolation
});

afterAll(async () => {
  // Cleanup if needed
});


