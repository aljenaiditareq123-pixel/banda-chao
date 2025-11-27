import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/authSchemas';

const router = Router();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists (using raw SQL since table is 'users' not 'User')
    const existingUsers = await prisma.$queryRaw<Array<{id: string, email: string}>>`
      SELECT id, email FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role
    const userRole = role && ['FOUNDER', 'MAKER', 'BUYER', 'ADMIN'].includes(role) 
      ? role 
      : 'BUYER';

    // Create user (using raw SQL since table is 'users' not 'User')
    const userId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO users (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, ${userRole}, NOW(), NOW());
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
      SELECT id, email, name, "profilePicture", bio, role, "createdAt", "updatedAt"
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

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Fetch user by email using Prisma
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        profilePicture: true,
        bio: true,
        role: true,
      },
    });

    // If user not found, return 401
    if (!user || !user.passwordHash) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Compare password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    // If password mismatch, return 401
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Return success response
    res.json({
      success: true,
      token,
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
    console.error('[LOGIN_ERROR]', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
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
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
