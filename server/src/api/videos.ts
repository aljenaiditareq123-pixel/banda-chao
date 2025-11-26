import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';

const router = Router();

// Get all videos (with pagination and filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const language = req.query.language as string;
    const makerId = req.query.makerId as string;
    const search = req.query.search as string;

    const where: any = {};
    
    if (type && ['SHORT', 'LONG'].includes(type)) {
      where.type = type;
    }
    
    if (language) {
      where.language = language;
    }
    
    if (makerId) {
      where.makerId = makerId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        include: {
          maker: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              videoLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.video.count({ where }),
    ]);

    const response = {
      videos,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache response for 60 seconds
    const cacheKey = `videos:${page}:${limit}:${type || ''}:${language || ''}:${makerId || ''}:${search || ''}`;
    setCache(cacheKey, response, 60 * 1000);

    res.json(response);
  } catch (error: any) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        maker: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            videoLikes: true,
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views count
    await prisma.video.update({
      where: { id: video.id },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({ video: { ...video, viewsCount: video.viewsCount + 1 } });
  } catch (error: any) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get videos by maker
router.get('/makers/:makerId', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    const where: any = {
      makerId: req.params.makerId,
    };
    
    if (type && ['SHORT', 'LONG'].includes(type)) {
      where.type = type;
    }

    const videos = await prisma.video.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            videoLikes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ videos });
  } catch (error: any) {
    console.error('Get maker videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

