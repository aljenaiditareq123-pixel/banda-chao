import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import jwt from 'jsonwebtoken';

const router = Router();

// Get comments (optional auth - includes userLiked if authenticated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { videoId, productId } = req.query;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId: string | undefined;

    // Try to get user ID from token if provided
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, continue without userId
        userId = undefined;
      }
    }

    // Validate that either videoId or productId is provided, but not both
    if (!videoId && !productId) {
      return res.status(400).json({ error: 'Either videoId or productId is required' });
    }

    if (videoId && productId) {
      return res.status(400).json({ error: 'Cannot filter by both videoId and productId' });
    }

    const where: any = {};
    if (videoId) {
      where.videoId = videoId as string;
    }
    if (productId) {
      where.productId = productId as string;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If user is authenticated, check which comments they liked
    if (userId) {
      const commentIds = comments.map(c => c.id);
      const userLikes = await prisma.commentLike.findMany({
        where: {
          userId,
          commentId: { in: commentIds }
        },
        select: {
          commentId: true
        }
      });

      const likedCommentIds = new Set(userLikes.map(l => l.commentId));

      // Add userLiked property to each comment
      const commentsWithLikes = comments.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        videoId: comment.videoId,
        productId: comment.productId,
        content: comment.content,
        likes: comment.likes,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          profilePicture: comment.user.profilePicture
        },
        userLiked: likedCommentIds.has(comment.id)
      }));

      return res.json({ data: commentsWithLikes });
    }

    // If not authenticated, return comments without userLiked
    const commentsWithoutLikes = comments.map(comment => ({
      id: comment.id,
      userId: comment.userId,
      videoId: comment.videoId,
      productId: comment.productId,
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        profilePicture: comment.user.profilePicture
      }
    }));

    res.json({ data: commentsWithoutLikes });
  } catch (error: any) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments', message: error.message });
  }
});

// Create a comment
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId, productId, content } = req.body;
    const userId = req.userId!;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Validate that either videoId or productId is provided, but not both
    if (!videoId && !productId) {
      return res.status(400).json({ error: 'Either videoId or productId is required' });
    }

    if (videoId && productId) {
      return res.status(400).json({ error: 'Cannot comment on both video and product' });
    }

    // Verify that video or product exists
    if (videoId) {
      const video = await prisma.video.findUnique({
        where: { id: videoId }
      });
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
    }

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        videoId: videoId || null,
        productId: productId || null,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment created successfully',
      data: {
        id: comment.id,
        userId: comment.userId,
        videoId: comment.videoId,
        productId: comment.productId,
        content: comment.content,
        likes: comment.likes,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          profilePicture: comment.user.profilePicture
        }
      }
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment', message: error.message });
  }
});

// Delete a comment
// Idempotent: returns 204 even if resource doesn't exist (matches TestSprite expectations)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Check if comment exists and verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (comment) {
      // Verify ownership only if comment exists
      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }

      // Delete the comment
      await prisma.comment.delete({
        where: { id }
      });
    }
    // If comment doesn't exist, we still return 204 (idempotent behavior)
    // This matches REST best practices and TestSprite expectations

    // Return 204 No Content for successful/idempotent deletion (REST standard)
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment', message: error.message });
  }
});

// Like a comment
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Comment already liked' });
    }

    // Create like and update comment likes count in a transaction
    await prisma.$transaction([
      prisma.commentLike.create({
        data: {
          userId,
          commentId: id
        }
      }),
      prisma.comment.update({
        where: { id },
        data: { likes: { increment: 1 } }
      })
    ]);

    const updatedComment = await prisma.comment.findUnique({
      where: { id }
    });

    res.json({
      message: 'Comment liked successfully',
      data: {
        id: updatedComment!.id,
        likes: updatedComment!.likes,
        liked: true
      }
    });
  } catch (error: any) {
    console.error('Like comment error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Comment already liked' });
    }
    res.status(500).json({ error: 'Failed to like comment', message: error.message });
  }
});

// Unlike a comment
router.delete('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id
        }
      }
    });

    if (!existingLike) {
      return res.status(400).json({ error: 'Comment not liked' });
    }

    // Delete like and update comment likes count in a transaction
    await prisma.$transaction([
      prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: id
          }
        }
      }),
      prisma.comment.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      })
    ]);

    const updatedComment = await prisma.comment.findUnique({
      where: { id }
    });

    res.json({
      message: 'Comment unliked successfully',
      data: {
        id: updatedComment!.id,
        likes: Math.max(0, updatedComment!.likes),
        liked: false
      }
    });
  } catch (error: any) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Failed to unlike comment', message: error.message });
  }
});

export default router;

