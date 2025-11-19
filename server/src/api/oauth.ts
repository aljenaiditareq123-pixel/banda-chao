import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { getUserRoleFromEmail, isFounderEmail } from '../utils/roles';
import { FOUNDER_EMAIL } from '../config/env';

const router = Router();

/**
 * GET /api/v1/oauth/google
 * Initiate Google OAuth login
 */
router.get('/google', async (req: Request, res: Response) => {
  try {
    const { redirectUri } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const callbackUrl = `${frontendUrl}/auth/callback?provider=google`;
    
    // Google OAuth configuration
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      // Log missing env vars for debugging (without exposing actual values)
      console.error('[OAuth] Missing Google env vars', {
        hasClientId: !!googleClientId,
        endpoint: 'GET /api/v1/oauth/google'
      });
      
      return res.status(500).json({ 
        error: 'Google OAuth not configured',
        message: 'GOOGLE_CLIENT_ID environment variable is not set'
      });
    }

    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.json({
      authUrl: googleAuthUrl,
      callbackUrl
    });
  } catch (error: any) {
    console.error('Google OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Google OAuth', message: error.message });
  }
});

/**
 * POST /api/v1/oauth/google/callback
 * Handle Google OAuth callback
 */
router.post('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const callbackUrl = `${frontendUrl}/auth/callback?provider=google`;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      // Log missing env vars for debugging (without exposing actual values)
      console.error('[OAuth] Missing Google env vars', {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        endpoint: 'POST /api/v1/oauth/google/callback'
      });
      
      return res.status(500).json({ 
        error: 'Google OAuth not configured',
        message: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables are not set'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      return res.status(400).json({ 
        error: 'Failed to exchange authorization code',
        details: errorData
      });
    }

    const tokens = await tokenResponse.json() as { access_token?: string };
    const access_token = tokens.access_token;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token from Google' });
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch user info from Google' });
    }

    const googleUser = await userInfoResponse.json() as { email?: string; name?: string; picture?: string; id?: string };
    const email = googleUser.email;
    const name = googleUser.name;
    const picture = googleUser.picture;
    const googleId = googleUser.id;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if this is the founder email
    const isFounder = isFounderEmail(email);

    // Check if user exists, if not create new user
    let existingUser = await prisma.user.findUnique({
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
      const newUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          profilePicture: picture || null,
          password: '', // OAuth users don't have passwords
          role: isFounder ? 'FOUNDER' : 'USER'
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
      
      user = newUser;
    } else {
      // If this is the founder email, ensure role is FOUNDER
      const updateData: { profilePicture?: string; role?: 'FOUNDER' | 'USER' } = {};
      
      // Update profile picture if available
      if (picture && picture !== existingUser.profilePicture) {
        updateData.profilePicture = picture;
      }
      
      // Always set role to FOUNDER if email matches FOUNDER_EMAIL
      if (isFounder && existingUser.role !== 'FOUNDER') {
        updateData.role = 'FOUNDER';
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            profilePicture: true,
            role: true,
            createdAt: true
          }
        });
        
        user = updatedUser;
      } else {
        // Fetch user with role
        const fetchedUser = await prisma.user.findUnique({
          where: { id: existingUser.id },
          select: {
            id: true,
            email: true,
            name: true,
            profilePicture: true,
            role: true,
            createdAt: true
          }
        });
        if (!fetchedUser) {
          return res.status(500).json({ error: 'Failed to retrieve user' });
        }
        // Ensure role is FOUNDER if email matches (even if not updated)
        user = {
          ...fetchedUser,
          role: isFounder ? 'FOUNDER' : fetchedUser.role
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
