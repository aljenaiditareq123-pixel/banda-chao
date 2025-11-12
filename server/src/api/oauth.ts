import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

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

    const tokens = await tokenResponse.json();
    const { access_token } = tokens;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch user info from Google' });
    }

    const googleUser = await userInfoResponse.json();
    const { email, name, picture, id: googleId } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists, if not create new user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          profilePicture: picture || null,
          password: '', // OAuth users don't have passwords
        },
        select: {
          id: true,
          email: true,
          name: true,
          profilePicture: true,
          createdAt: true
        }
      });
    } else {
      // Update user profile picture if available
      if (picture && picture !== user.profilePicture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profilePicture: picture },
          select: {
            id: true,
            email: true,
            name: true,
            profilePicture: true,
            createdAt: true
          }
        });
      }
    }

    // Generate JWT token
    const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      message: 'Google OAuth login successful',
      user,
      token
    });
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to process Google OAuth callback', message: error.message });
  }
});

export default router;


