import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all posts (with pagination)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const makerId = req.query.makerId as string;

    const where: any = {};
    
    if (type && ['TEXT', 'IMAGE', 'VIDEO'].includes(type)) {
      where.type = type;
    }
    
    if (makerId) {
      where.makerId = makerId;
    }

    const [posts, total] = await Promise.all([
      prisma.posts.findMany({
        where,
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.posts.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await prisma.posts.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            bio: true,
          },
        },
        _count: {
          select: {
            post_likes: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error: any) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Use comments API pattern - comments for posts have both product_id and video_id as null
    const [comments, total] = await Promise.all([
      prisma.comments.findMany({
        where: {
          product_id: null,
          video_id: null,
          // Note: posts table doesn't have a direct relation to comments in schema
          // Comments are linked via product_id/video_id being null for posts
        },
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      }),
      prisma.comments.count({
        where: {
          product_id: null,
          video_id: null,
        },
      }),
    ]);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get post comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post (authenticated)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, images } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { randomUUID } = await import('crypto');
    const postId = randomUUID();

    const post = await prisma.posts.create({
      data: {
        id: postId,
        user_id: req.userId!,
        content: content.trim(),
        images: images && Array.isArray(images) ? images : [],
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      },
    });

    res.status(201).json({ post });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

