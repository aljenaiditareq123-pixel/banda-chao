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

    // Use raw SQL to match actual schema (videos table has user_id, not makerId)
    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type && ['SHORT', 'LONG'].includes(type)) {
      whereClause += ` AND v.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (language) {
      whereClause += ` AND v.language = $${paramIndex}`;
      params.push(language);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (v.title ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const videos = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        v.id,
        v.title,
        v.description,
        v.video_url as "videoUrl",
        v.thumbnail_url as "thumbnailUrl",
        v.duration,
        v.type,
        v.views as "viewsCount",
        v.likes as "likesCount",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, skip);

    const totalResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
      SELECT COUNT(*) as count
      FROM videos v
      WHERE ${whereClause}
    `, ...params);
    const total = Number(totalResult[0]?.count || 0);

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
    const videos = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        v.id,
        v.title,
        v.description,
        v.video_url as "videoUrl",
        v.thumbnail_url as "thumbnailUrl",
        v.duration,
        v.type,
        v.views as "viewsCount",
        v.likes as "likesCount",
        v.created_at as "createdAt",
        v.updated_at as "updatedAt",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id = $1
    `, req.params.id);

    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videos[0];
    
    // Increment views count
    await prisma.$executeRawUnsafe(`
      UPDATE videos SET views = views + 1 WHERE id = $1
    `, req.params.id);

    res.json({ video: { ...video, viewsCount: (video.viewsCount || 0) + 1 } });
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

