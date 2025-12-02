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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comments.findMany({
        where: {
          product_id: null,
          video_id: null,
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

export default router;

