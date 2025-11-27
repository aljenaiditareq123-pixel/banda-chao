import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Setup test database or mocks
beforeAll(async () => {
  // Set test environment
  (process.env as any).NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '1h';
  
  // Set DATABASE_URL if not already set (use the same as development for now)
  if (!process.env.DATABASE_URL) {
    // Try to load from .env file or use a default test database URL
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/banda_chao_test';
  }
  
  // Set optional environment variables for testing
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_testing';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // You can set up a test database here if needed
  // For now, we'll use the same database but with test isolation
});

afterAll(async () => {
  // Cleanup if needed
});



