import { describe, it, expect } from 'vitest';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

describe('JWT Token Generation & Validation (Unit Tests)', () => {
  const jwtSecret = 'test-secret-key-for-testing-only';
  const testUser = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'BUYER',
  };

  describe('1. JWT Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should generate token with correct structure (3 parts)', () => {
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const parts = token.split('.');
      expect(parts.length).toBe(3);
      expect(parts[0]).toBeTruthy(); // Header
      expect(parts[1]).toBeTruthy(); // Payload
      expect(parts[2]).toBeTruthy(); // Signature
    });

    it('should include all required fields in token payload', () => {
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const decoded = jwt.decode(token) as any;
      expect(decoded).toHaveProperty('userId', testUser.id);
      expect(decoded).toHaveProperty('email', testUser.email);
      expect(decoded).toHaveProperty('name', testUser.name);
      expect(decoded).toHaveProperty('role', testUser.role);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });
  });

  describe('2. JWT Token Verification', () => {
    it('should verify token with correct secret', () => {
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const verified = jwt.verify(token, jwtSecret) as any;
      expect(verified).toBeTruthy();
      expect(verified.userId).toBe(testUser.id);
      expect(verified.email).toBe(testUser.email);
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const wrongSecret = 'wrong-secret-key';
      expect(() => {
        jwt.verify(token, wrongSecret);
      }).toThrow();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      expect(() => {
        jwt.verify(expiredToken, jwtSecret);
      }).toThrow();
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      
      expect(() => {
        jwt.verify(malformedToken, jwtSecret);
      }).toThrow();
    });
  });

  describe('3. Password Hashing & Verification', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(20);
      expect(hash).not.toBe(password); // Hash should be different from original
    });

    it('should verify correct password against hash', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('4. Complete Authentication Flow Simulation', () => {
    it('should simulate complete login flow: hash password → generate token → verify token', async () => {
      // Step 1: Hash password (simulating registration)
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      expect(hashedPassword).toBeTruthy();

      // Step 2: Verify password (simulating login)
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      expect(isValidPassword).toBe(true);

      // Step 3: Generate JWT token (simulating successful login)
      const token = jwt.sign(
        { userId: testUser.id, email: testUser.email, name: testUser.name, role: testUser.role },
        jwtSecret,
        { expiresIn: '7d' }
      );
      expect(token).toBeTruthy();

      // Step 4: Verify token (simulating protected route access)
      const verified = jwt.verify(token, jwtSecret) as any;
      expect(verified.userId).toBe(testUser.id);
      expect(verified.email).toBe(testUser.email);
      expect(verified.role).toBe(testUser.role);
    });
  });
});

