import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { uploadToGCS, isGCSConfigured } from '../lib/gcs';
import { randomUUID } from 'crypto';

const router = Router();

// Configure multer for video uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage if GCS is configured, otherwise use disk storage
const storage = isGCSConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video\/(mp4|webm|quicktime|x-msvideo)/.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (mp4, webm, mov, avi) are allowed'));
    }
  },
});

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

    // Note: language column does not exist in videos table, so we skip this filter
    // if (language) {
    //   whereClause += ` AND v.language = $${paramIndex}`;
    //   params.push(language);
    //   paramIndex++;
    // }

    if (makerId) {
      whereClause += ` AND v."user_id" = $${paramIndex}`;
      params.push(makerId);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (v.title ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Build parameters array for LIMIT and OFFSET
    const limitParamIndex = paramIndex;
    const offsetParamIndex = paramIndex + 1;
    const allParams = [...params, limit, skip];

    // NOTE: Safe parameterized query - parameters passed separately
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
      LEFT JOIN users u ON v."user_id" = u.id
      WHERE ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `, ...allParams);

    // NOTE: Safe parameterized query
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
    console.error('Get videos error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      meta: error?.meta || 'No metadata',
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // NOTE: Safe parameterized query - parameters passed separately
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
      LEFT JOIN users u ON v."user_id" = u.id
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
    console.error('Get video error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      meta: error?.meta || 'No metadata',
      videoId: req.params.id,
    });
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

    // Use raw SQL to match actual schema (videos table has user_id, not makerId)
    let whereClause = `v."user_id" = $1`;
    const params: any[] = [req.params.makerId];
    let paramIndex = 2;

    if (type && ['SHORT', 'LONG'].includes(type)) {
      whereClause += ` AND v.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // NOTE: Safe parameterized query - parameters passed separately
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
      LEFT JOIN users u ON v."user_id" = u.id
      WHERE ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, skip);

    res.json({ videos });
  } catch (error: any) {
    console.error('Get maker videos error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      meta: error?.meta || 'No metadata',
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Upload video (POST)
router.post('/', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, duration } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    if (!title || !type || !['SHORT', 'LONG'].includes(type)) {
      return res.status(400).json({ error: 'Title and type (SHORT or LONG) are required' });
    }

    // Upload video to GCS or save locally
    let videoUrl: string;
    let thumbnailUrl: string | null = null;

    if (isGCSConfigured()) {
      // Upload to GCS
      const fileBuffer = file.buffer;
      videoUrl = await uploadToGCS(fileBuffer, file.originalname, 'videos');
      
      // For now, use a placeholder thumbnail (in production, generate from video)
      thumbnailUrl = null; // TODO: Generate thumbnail from video
    } else {
      // Save locally
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      videoUrl = `${baseUrl}/uploads/videos/${file.filename}`;
    }

    // Get user's maker profile
    const maker = await prisma.makers.findUnique({
      where: { user_id: req.userId! },
    });

    if (!maker) {
      return res.status(403).json({ error: 'You must be a maker to upload videos' });
    }

    // Create video record using Prisma
    const videoId = randomUUID();
    const video = await prisma.videos.create({
      data: {
        id: videoId,
        user_id: req.userId!,
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || '',
        type: type as 'SHORT' | 'LONG',
        duration: duration ? parseInt(duration) : 0,
        views: 0,
        likes: 0,
        updated_at: new Date(),
      },
    });

    // Invalidate cache
    invalidateCachePattern('videos:*');

    res.status(201).json({
      success: true,
      video: {
        id: videoId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        type,
        duration: duration ? parseInt(duration) : null,
        viewsCount: 0,
        likesCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Create video error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      userId: req.userId,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

