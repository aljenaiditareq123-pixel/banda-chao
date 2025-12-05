import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Submit Beta application (public endpoint)
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const { name, email, country, mainPlatform, whatYouSell, preferredLang, whyJoin } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Name is required' 
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    if (!country || !country.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Country is required' 
      });
    }

    // Check if email already exists
    const existing = await prisma.beta_applications.findFirst({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ 
        success: false,
        error: 'This email has already submitted an application' 
      });
    }

    // Create application
    const application = await prisma.beta_applications.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        main_platform: mainPlatform?.trim() || null,
        what_you_sell: whatYouSell?.trim() || null,
        preferred_lang: preferredLang?.trim() || null,
        why_join: whyJoin?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        name: application.name,
        email: application.email,
      },
    });
  } catch (error: unknown) {
    console.error('Submit beta application error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Get all Beta applications (protected, founder only)
router.get('/applications', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { language, country } = req.query;

    const where: {
      preferred_lang?: string;
      country?: string;
    } = {};

    if (language) {
      where.preferred_lang = language as string;
    }

    if (country) {
      where.country = country as string;
    }

    const applications = await prisma.beta_applications.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      applications,
      total: applications.length,
    });
  } catch (error: unknown) {
    console.error('Get beta applications error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

export default router;

