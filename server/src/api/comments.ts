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

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          targetType: targetType as any,
          targetId,
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          _count: {
            select: {
              commentLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.comment.count({
        where: {
          targetType: targetType as any,
          targetId,
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

    const comment = await prisma.comment.create({
      data: {
        authorId: req.userId!,
        targetType: targetType as any,
        targetId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    res.status(201).json({ comment });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

