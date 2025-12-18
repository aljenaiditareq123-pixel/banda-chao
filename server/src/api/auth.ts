import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/authSchemas';

const router = Router();

// JWT_SECRET is required in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production environment');
}
const JWT_SECRET: string = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-only');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Normalize email: trim and convert to lowercase for consistent storage
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists (using raw SQL since table is 'users' not 'User')
    // Use LOWER() for case-insensitive comparison
    const existingUsers = await prisma.$queryRaw<Array<{id: string, email: string}>>`
      SELECT id, email FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail})) LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role - Use USER as default (matches schema default)
    // Accepted roles: FOUNDER, MAKER, USER, ADMIN
    const userRole = role && ['FOUNDER', 'MAKER', 'USER', 'ADMIN'].includes(role) 
      ? role 
      : 'USER';

    // Create user (using raw SQL since table is 'users' not 'User')
    // Store email in lowercase for consistency
    // NOTE: Role is now a String field, no enum cast needed
    const userId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO users (id, email, password, name, role, created_at, updated_at)
      VALUES (${userId}, ${normalizedEmail}, ${hashedPassword}, ${name}, ${userRole}, NOW(), NOW());
    `;

    // Fetch the created user
    const createdUsers = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      profilePicture: string | null;
      bio: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT id, email, name, profile_picture as "profilePicture", bio, role, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = ${userId};
    `;
    const user = createdUsers[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Set HttpOnly cookie for token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token, // Still return token for client-side storage (backward compatibility)
    });
  } catch (error: any) {
    // Enhanced error logging for database connection issues
    console.error('[REGISTER_ERROR]', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    // Check if it's a database connection error
    const isConnectionError = 
      error.message?.includes('connection') ||
      error.message?.includes('connect') ||
      error.message?.includes('SSL') ||
      error.code === 'P1001' || // Prisma connection error
      error.code === 'ECONNREFUSED' ||
      error.code === 'P1000' || // Authentication failed
      error.code === 'P1003'; // Database not found
    
    // Return more specific error message
    if (isConnectionError) {
      return res.status(500).json({ 
        error: 'Database connection error',
        message: 'Unable to connect to database. Please check DATABASE_URL configuration.',
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          message: error.message,
        } : undefined,
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during registration',
    });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Normalize email: trim and convert to lowercase for consistent comparison
    const normalizedEmail = email.trim().toLowerCase();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LOGIN] Attempting login:', {
        originalEmail: email,
        normalizedEmail,
        passwordLength: password?.length || 0,
      });
    }

    // Fetch user by email using raw SQL (consistent with register endpoint)
    // This ensures we use the exact column name from the database
    // Use LOWER() in SQL to ensure case-insensitive comparison
    let users: Array<{
      id: string;
      email: string;
      name: string;
      passwordHash: string | null;
      profilePicture: string | null;
      bio: string | null;
      role: string;
    }>;
    
    try {
      users = await prisma.$queryRaw<Array<{
        id: string;
        email: string;
        name: string;
        passwordHash: string | null;
        profilePicture: string | null;
        bio: string | null;
        role: string;
      }>>`
        SELECT id, email, name, password as "passwordHash", profile_picture as "profilePicture", bio, role
        FROM users
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail}))
        LIMIT 1;
      `;
    } catch (dbError: any) {
      console.error('[LOGIN_ERROR] Database query failed:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined,
      });
      
      // Check if it's a connection error
      const isConnectionError = 
        dbError.message?.includes('connection') ||
        dbError.message?.includes('connect') ||
        dbError.code === 'P1001' || // Prisma connection error
        dbError.code === 'ECONNREFUSED';
      
      return res.status(500).json({
        success: false,
        message: isConnectionError 
          ? 'Database connection error. Please ensure the database server is running and try again.'
          : 'Database error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
      });
    }

    // If user not found, return 401
    if (users.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOGIN] User not found for email:', normalizedEmail);
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = users[0];

    // Check if password hash exists
    if (!user.passwordHash) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOGIN] User found but no password hash:', {
          userId: user.id,
          email: user.email,
        });
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Compare password with stored hash
    let isValidPassword: boolean;
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOGIN] Comparing password...', {
          userId: user.id,
          email: user.email,
          passwordHashLength: user.passwordHash.length,
          passwordHashPrefix: user.passwordHash.substring(0, 10) + '...',
        });
      }
      
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOGIN] Password comparison result:', {
          isValid: isValidPassword,
          userId: user.id,
          email: user.email,
        });
      }
    } catch (bcryptError: any) {
      console.error('[LOGIN_ERROR] Password comparison failed:', {
        message: bcryptError.message,
        stack: process.env.NODE_ENV === 'development' ? bcryptError.stack : undefined,
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication',
      });
    }

    // If password mismatch, return 401
    if (!isValidPassword) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[LOGIN] Password mismatch for user:', {
          userId: user.id,
          email: user.email,
        });
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    let token: string;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );
    } catch (jwtError: any) {
      console.error('[LOGIN_ERROR] JWT signing failed:', jwtError.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during token generation',
      });
    }

    // Set HttpOnly cookie for token (more secure than localStorage)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return success response
    res.json({
      success: true,
      token, // Still return token for client-side storage (backward compatibility)
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
      },
    });
  } catch (error: any) {
    // Enhanced error logging to help debug the issue
    console.error('[LOGIN_ERROR]', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        code: error.code 
      })
    });
  }
});

// Get current user (me)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Find user using raw SQL since table is 'users' not 'User'
    const users = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      profilePicture: string | null;
      bio: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT id, email, name, "profilePicture", bio, role, "createdAt", "updatedAt"
      FROM users
      WHERE id = ${req.userId!}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get maker profile if exists
    let maker = null;
    try {
      const makers = await prisma.$queryRaw<Array<{
        id: string;
        displayName: string;
        bio: string | null;
        country: string | null;
        city: string | null;
        languages: string[];
        rating: number;
        reviewCount: number;
        avatarUrl: string | null;
        coverImageUrl: string | null;
      }>>`
        SELECT id, "displayName", bio, country, city, languages, rating, "reviewCount", "avatarUrl", "coverImageUrl"
        FROM makers
        WHERE "userId" = ${user.id}
        LIMIT 1;
      `;
      if (makers.length > 0) {
        maker = makers[0];
      }
    } catch (makerErr) {
      // Maker profile not found or error - continue without it
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Auth /me] Maker profile fetch error:', makerErr);
      }
    }

    res.json({ 
      user: {
        ...user,
        maker: maker ? {
          id: maker.id,
          displayName: maker.displayName,
          bio: maker.bio,
          country: maker.country,
          city: maker.city,
          languages: maker.languages,
          rating: maker.rating,
          reviewCount: maker.reviewCount,
          avatarUrl: maker.avatarUrl,
          coverImageUrl: maker.coverImageUrl,
        } : null,
      }
    });
  } catch (error: unknown) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
