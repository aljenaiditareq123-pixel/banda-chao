import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Toggle like (like/unlike)
router.post('/toggle', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.userId!;

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    if (!['POST', 'PRODUCT', 'VIDEO', 'COMMENT'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType. Must be POST, PRODUCT, VIDEO, or COMMENT' });
    }

    let liked = false;
    let likesCount = 0;

    // Check if already liked and toggle
    if (targetType === 'POST') {
      const existingLike = await prisma.post_likes.findFirst({
        where: {
          user_id: userId,
          post_id: targetId,
        },
      });

      if (existingLike) {
        // Unlike
        await prisma.post_likes.delete({
          where: {
            id: existingLike.id,
          },
        });
        liked = false;
      } else {
        // Like
        const { randomUUID } = await import('crypto');
        await prisma.post_likes.create({
          data: {
            id: randomUUID(),
            user_id: userId,
            post_id: targetId,
          },
        });
        liked = true;
      }

      // Get updated likes count
      likesCount = await prisma.post_likes.count({
        where: { post_id: targetId },
      });

      // Update post likes count
      await prisma.posts.update({
        where: { id: targetId },
        data: { updated_at: new Date() },
      });
    } else if (targetType === 'PRODUCT') {
      const existingLike = await prisma.product_likes.findFirst({
        where: {
          user_id: userId,
          product_id: targetId,
        },
      });

      if (existingLike) {
        await prisma.product_likes.delete({
          where: {
            id: existingLike.id,
          },
        });
        liked = false;
      } else {
        const { randomUUID } = await import('crypto');
        await prisma.product_likes.create({
          data: {
            id: randomUUID(),
            user_id: userId,
            product_id: targetId,
          },
        });
        liked = true;
      }

      likesCount = await prisma.product_likes.count({
        where: { product_id: targetId },
      });
    } else if (targetType === 'VIDEO') {
      const existingLike = await prisma.video_likes.findFirst({
        where: {
          user_id: userId,
          video_id: targetId,
        },
      });

      if (existingLike) {
        await prisma.video_likes.delete({
          where: {
            id: existingLike.id,
          },
        });
        liked = false;
      } else {
        const { randomUUID } = await import('crypto');
        await prisma.video_likes.create({
          data: {
            id: randomUUID(),
            user_id: userId,
            video_id: targetId,
          },
        });
        liked = true;
      }

      likesCount = await prisma.video_likes.count({
        where: { video_id: targetId },
      });

      // Update video likes count
      await prisma.videos.update({
        where: { id: targetId },
        data: {
          likes: likesCount,
          updated_at: new Date(),
        },
      });
    } else if (targetType === 'COMMENT') {
      const existingLike = await prisma.comment_likes.findFirst({
        where: {
          user_id: userId,
          comment_id: targetId,
        },
      });

      if (existingLike) {
        await prisma.comment_likes.delete({
          where: {
            id: existingLike.id,
          },
        });
        liked = false;
      } else {
        const { randomUUID } = await import('crypto');
        await prisma.comment_likes.create({
          data: {
            id: randomUUID(),
            user_id: userId,
            comment_id: targetId,
          },
        });
        liked = true;
      }

      likesCount = await prisma.comment_likes.count({
        where: { comment_id: targetId },
      });

      // Update comment likes count
      await prisma.comments.update({
        where: { id: targetId },
        data: {
          likes: likesCount,
          updated_at: new Date(),
        },
      });
    }

    res.json({
      success: true,
      liked,
      likesCount,
    });
  } catch (error: any) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get like status for a user
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.query;
    const userId = req.userId!;

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    if (!['POST', 'PRODUCT', 'VIDEO', 'COMMENT'].includes(targetType as string)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    let liked = false;
    let likesCount = 0;

    if (targetType === 'POST') {
      liked = !!(await prisma.post_likes.findFirst({
        where: {
          user_id: userId,
          post_id: targetId as string,
        },
      }));
      likesCount = await prisma.post_likes.count({
        where: { post_id: targetId as string },
      });
    } else if (targetType === 'PRODUCT') {
      liked = !!(await prisma.product_likes.findFirst({
        where: {
          user_id: userId,
          product_id: targetId as string,
        },
      }));
      likesCount = await prisma.product_likes.count({
        where: { product_id: targetId as string },
      });
    } else if (targetType === 'VIDEO') {
      liked = !!(await prisma.video_likes.findFirst({
        where: {
          user_id: userId,
          video_id: targetId as string,
        },
      }));
      likesCount = await prisma.video_likes.count({
        where: { video_id: targetId as string },
      });
    } else if (targetType === 'COMMENT') {
      liked = !!(await prisma.comment_likes.findFirst({
        where: {
          user_id: userId,
          comment_id: targetId as string,
        },
      }));
      likesCount = await prisma.comment_likes.count({
        where: { comment_id: targetId as string },
      });
    }

    res.json({
      liked,
      likesCount,
    });
  } catch (error: any) {
    console.error('Get like status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

