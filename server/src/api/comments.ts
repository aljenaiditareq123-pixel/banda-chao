import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validation/commentSchemas';

const router = Router();

// Get comments by target (post, video, or product)
router.get('/', async (req: Request, res: Response) => {
  try {
    const targetType = req.query.targetType as string;
    const targetId = req.query.targetId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    if (!['POST', 'VIDEO', 'PRODUCT'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    // Map targetType to appropriate field
    const where: any = {};
    if (targetType === 'PRODUCT') {
      where.product_id = targetId;
    } else if (targetType === 'VIDEO') {
      where.video_id = targetId;
    } else {
      where.product_id = null;
      where.video_id = null;
    }

    const [comments, total] = await Promise.all([
      prisma.comments.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          review_video_url: true,
          review_rating: true,
          likes: true,
          created_at: true,
          updated_at: true,
          user_id: true,
          users: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
            },
          },
        } as any,
        orderBy: {
          created_at: 'asc',
        },
      }),
      prisma.comments.count({ where }),
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
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create comment (authenticated)
router.post('/', authenticateToken, validate(createCommentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, content } = req.body;

    if (!targetType || !targetId || !content) {
      return res.status(400).json({ error: 'targetType, targetId, and content are required' });
    }

    if (!['POST', 'VIDEO', 'PRODUCT'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    const { randomUUID } = await import('crypto');
    const commentId = randomUUID();
    
    const { reviewVideoUrl, reviewRating } = req.body;
    
    const data: any = {
      id: commentId,
      user_id: req.userId!,
      content,
      likes: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add video review fields if provided
    if (reviewVideoUrl) {
      data.review_video_url = reviewVideoUrl;
    }
    if (reviewRating !== undefined && reviewRating !== null) {
      data.review_rating = parseFloat(reviewRating);
    }
    
    if (targetType === 'PRODUCT') {
      data.product_id = targetId;
    } else if (targetType === 'VIDEO') {
      data.video_id = targetId;
    }

    const comment = await prisma.comments.create({
      data,
      select: {
        id: true,
        content: true,
        review_video_url: true,
        review_rating: true,
        likes: true,
        created_at: true,
        updated_at: true,
        user_id: true,
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      } as any,
    });

    res.status(201).json({ comment });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

