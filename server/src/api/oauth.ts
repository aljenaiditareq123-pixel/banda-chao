import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getUserRoleFromEmail, isFounderEmail } from '../utils/roles';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:10000/api/v1/oauth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Google OAuth credentials not configured. OAuth routes will not work.');
}

const oauth2Client = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
  ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
  : null;

/**
 * GET /api/v1/oauth/google
 * Redirects user to Google OAuth consent screen
 */
router.get('/google', (req: Request, res: Response) => {
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google OAuth not configured' });
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  res.redirect(authUrl);
});

/**
 * GET /api/v1/oauth/google/callback
 * Handles Google OAuth callback and creates/logs in user
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    if (!oauth2Client) {
      return res.status(503).json({ error: 'Google OAuth not configured' });
    }

    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID!,
    });

    const googlePayload = ticket.getPayload();
    if (!googlePayload) {
      return res.status(400).json({ error: 'Failed to get user information from Google' });
    }

    const { email, name, picture } = googlePayload;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if this is the founder email
    const isFounder = isFounderEmail(email);

    // Check if user exists, if not create new user
    let existingUser = await prisma.users.findUnique({
      where: { email }
    });

    let user: {
      id: string;
      email: string;
      name: string | null;
      profilePicture: string | null;
      role: string;
      createdAt: Date;
    } | null = null;

    // Calculate user role: FOUNDER if email matches FOUNDER_EMAIL, otherwise calculate from email
    const role = isFounder ? 'FOUNDER' : getUserRoleFromEmail(email);

    if (!existingUser) {
      // Create new user with FOUNDER role if email matches FOUNDER_EMAIL
      const newUser = await prisma.users.create({
        data: {
          email,
          name: name || email.split('@')[0],
          profile_picture: picture || null,
          password: '', // OAuth users don't have passwords
          role: isFounder ? 'FOUNDER' : 'USER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          profile_picture: true,
          role: true,
          created_at: true
        }
      });
      
      user = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profilePicture: newUser.profile_picture,
        role: newUser.role,
        createdAt: newUser.created_at
      };
    } else {
      // If this is the founder email, ensure role is FOUNDER
      const updateData: { profile_picture?: string; role?: 'FOUNDER' | 'USER' } = {};
      
      // Update profile picture if available
      if (picture && picture !== existingUser.profile_picture) {
        updateData.profile_picture = picture;
      }
      
      // Always set role to FOUNDER if email matches FOUNDER_EMAIL
      if (isFounder && existingUser.role !== 'FOUNDER') {
        updateData.role = 'FOUNDER';
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.users.update({
          where: { id: existingUser.id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            profile_picture: true,
            role: true,
            created_at: true
          }
        });
        
        user = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          profilePicture: updatedUser.profile_picture,
          role: updatedUser.role,
          createdAt: updatedUser.created_at
        };
      } else {
        // Fetch user with role
        const fetchedUser = await prisma.users.findUnique({
          where: { id: existingUser.id },
          select: {
            id: true,
            email: true,
            name: true,
            profile_picture: true,
            role: true,
            created_at: true
          }
        });
        if (!fetchedUser) {
          return res.status(500).json({ error: 'Failed to retrieve user' });
        }
        // Ensure role is FOUNDER if email matches (even if not updated)
        user = {
          id: fetchedUser.id,
          email: fetchedUser.email,
          name: fetchedUser.name,
          profilePicture: fetchedUser.profile_picture,
          role: isFounder ? 'FOUNDER' : fetchedUser.role,
          createdAt: fetchedUser.created_at
        };
      }
    }

    // Generate JWT token
    if (!user) {
      return res.status(500).json({ error: 'Failed to create or retrieve user' });
    }

    // Ensure founder email always has FOUNDER role
    const finalRole = isFounderEmail(user.email) ? 'FOUNDER' : (user.role || getUserRoleFromEmail(user.email));

    const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
    const rawExpiresIn = process.env.JWT_EXPIRES_IN;
    const expiresIn: string | number = rawExpiresIn && rawExpiresIn.trim().length > 0
      ? rawExpiresIn.trim()
      : '7d';
    const payload = { userId: user.id, email: user.email, role: finalRole };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      message: 'Google OAuth login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        role: finalRole,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to process Google OAuth callback', message: error.message });
  }
});

export default router;
