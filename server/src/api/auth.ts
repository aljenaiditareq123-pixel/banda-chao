import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { getUserRoleFromEmail, isFounderEmail } from '../utils/roles';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists (return 409 Conflict for duplicates)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', message: 'A user with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate user role before creating user
    const role = getUserRoleFromEmail(email);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
    const rawExpiresIn = process.env.JWT_EXPIRES_IN;
    const expiresIn: string | number = rawExpiresIn && rawExpiresIn.trim().length > 0
      ? rawExpiresIn.trim()
      : '7d';
    const payload = { userId: user.id, email: user.email, role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        role
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

// Helper function to generate JWT token
function createJwtTokenForUser(user: { id: string; email: string; role: string }): string {
  const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
  const rawExpiresIn = process.env.JWT_EXPIRES_IN;
  const expiresIn: string | number = rawExpiresIn && rawExpiresIn.trim().length > 0
    ? rawExpiresIn.trim()
    : '7d';
  const payload = { userId: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);
}

// Login - SIMPLIFIED: Only allow founder email
router.post('/login', async (req: Request, res: Response) => {
  try {
    const rawEmail = (req.body?.email ?? '').toString();
    const email = rawEmail.trim().toLowerCase();
    const HARDCODED_FOUNDER_EMAIL = 'aljenaiditareq123@gmail.com';

    console.log('[Auth] Login attempt', { email });

    // Only allow founder login
    if (email !== HARDCODED_FOUNDER_EMAIL) {
      console.warn('[Auth] Non-founder login rejected', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Upsert founder user
    // Note: Password field is required by Prisma schema, so we generate a temp one
    const tempPassword = await bcrypt.hash(`founder-temp-${Date.now()}`, 10);
    
    const founderUser = await prisma.user.upsert({
      where: { email },
      update: { role: 'FOUNDER' },
      create: {
        email,
        password: tempPassword, // Required by schema but won't be used
        name: 'Founder',
        role: 'FOUNDER'
      }
    });

    // Generate JWT token
    const token = createJwtTokenForUser({
      id: founderUser.id,
      email: founderUser.email,
      role: founderUser.role
    });

    console.log('[Founder Login SIMPLE] Login successful', {
      id: founderUser.id,
      email: founderUser.email
    });

    return res.status(200).json({
      success: true,
      user: {
        id: founderUser.id,
        email: founderUser.email,
        name: founderUser.name,
        profilePicture: founderUser.profilePicture,
        role: founderUser.role
      },
      token
    });
  } catch (err: any) {
    console.error('[Auth] Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

