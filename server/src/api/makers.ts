import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMakerSchema } from '../validation/makerSchemas';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';

const router = Router();

// Get all makers (with pagination and filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * pageSize;
    const country = req.query.country as string;
    const language = req.query.language as string;
    const search = req.query.search as string;

    // Generate cache key
    const cacheKey = `makers:${page}:${pageSize}:${country || ''}:${language || ''}:${search || ''}`;
    
    // Try to get from cache
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const where: any = {};
    
    if (country) {
      where.country = country;
    }
    
    if (language) {
      where.languages = { has: language };
    }
    
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [makers, total] = await Promise.all([
      prisma.makers.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              profile_picture: true,
            },
          },
          _count: {
            select: {
              products: true,
              videos: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.makers.count({ where }),
    ]);

    const response = {
      makers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    // Cache response for 60 seconds
    setCache(cacheKey, response, 60 * 1000);

    res.json(response);
  } catch (error: any) {
    console.error('Get makers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get maker by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const maker = await prisma.makers.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile_picture: true,
            bio: true,
          },
        },
        _count: {
          select: {
            products: true,
            videos: true,
            posts: true,
          },
        },
      },
    });

    if (!maker) {
      return res.status(404).json({ error: 'Maker not found' });
    }

    res.json({ maker });
  } catch (error: any) {
    console.error('Get maker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update maker profile (authenticated, MAKER role)
router.post('/', authenticateToken, requireRole(['MAKER']), validate(createMakerSchema), async (req: AuthRequest, res: Response) => {
    // Invalidate makers cache when a maker is created/updated
    invalidateCachePattern('makers:');
  try {
    const { displayName, bio, country, city, languages, socialLinks, wechatLink, instagramLink, twitterLink, facebookLink, paypalLink } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Check if maker profile already exists
    const existingMaker = await prisma.makers.findFirst({
      where: { user_id: req.userId! },
    });

    let maker;
    if (existingMaker) {
      // Update existing maker
      maker = await prisma.makers.update({
        where: { id: existingMaker.id },
        data: {
          displayName,
          bio,
          country,
          city,
          languages: languages || [],
          socialLinks: socialLinks || {},
          wechatLink: wechatLink || null,
          instagramLink: instagramLink || null,
          twitterLink: twitterLink || null,
          facebookLink: facebookLink || null,
          paypalLink: paypalLink || null,
        } as any, // Type assertion needed until Prisma Client is regenerated
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              profile_picture: true,
            },
          },
        },
      });
    } else {
      // Create new maker
      maker = await prisma.makers.create({
        data: {
          user_id: req.userId!,
          displayName,
          bio,
          country,
          city,
          languages: languages || [],
          socialLinks: socialLinks || {},
          wechatLink: wechatLink || null,
          instagramLink: instagramLink || null,
          twitterLink: twitterLink || null,
          facebookLink: facebookLink || null,
          paypalLink: paypalLink || null,
        } as any, // Type assertion needed until Prisma Client is regenerated
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              profile_picture: true,
            },
          },
        },
      });
    }

    res.json({
      message: existingMaker ? 'Maker profile updated' : 'Maker profile created',
      maker,
    });
  } catch (error: any) {
    console.error('Create/update maker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current maker's profile (authenticated maker only)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
        _count: {
          select: {
            products: true,
            videos: true,
          },
        },
      },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found. Please complete onboarding.',
      });
    }

    res.json({
      success: true,
      maker,
    });
  } catch (error) {
    console.error('Error fetching maker profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maker profile',
    });
  }
});

// Get current maker's products
router.get('/me/products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string;

    const where: any = {
      makerId: maker.id,
    };

    if (status && ['DRAFT', 'PUBLISHED'].includes(status)) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching maker products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maker products',
    });
  }
});

// Get current maker's videos
router.get('/me/videos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const [videos, total] = await Promise.all([
      prisma.videos.findMany({
        where: { user_id: maker.user_id },
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.videos.count({ where: { makerId: maker.id } }),
    ]);

    res.json({
      success: true,
      videos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching maker videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maker videos',
    });
  }
});

// Maker onboarding
router.post('/onboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if maker already exists
    const existingMaker = await prisma.makers.findFirst({
      where: { user_id: userId },
    });

    if (existingMaker) {
      return res.status(400).json({
        success: false,
        message: 'Maker profile already exists',
      });
    }

    const { displayName, bio, country, city, languages } = req.body;

    if (!displayName || !bio) {
      return res.status(400).json({
        success: false,
        message: 'displayName and bio are required',
      });
    }

    // Create maker profile
    const maker = await prisma.maker.create({
      data: {
          user_id: userId,
        displayName,
        bio,
        country: country || null,
        city: city || null,
        languages: languages || ['ar', 'en'],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update user role to MAKER if not already
    await prisma.users.update({
      where: { id: userId },
      data: {
        role: 'MAKER' as any,
      },
    });

    res.json({
      success: true,
      maker,
      message: 'Maker profile created successfully',
    });
  } catch (error) {
    console.error('Error creating maker profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maker profile',
    });
  }
});

export default router;

