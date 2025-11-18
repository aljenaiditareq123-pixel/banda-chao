import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get all videos with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = type ? { type: type as string } : {};

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
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
        },
        skip,
        take: limitNum
      }),
      prisma.video.count({ where })
    ]);

    res.json({
      data: videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos', message: error.message });
  }
});

// Get a single video
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
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

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views
    await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({
      ...video,
      views: video.views + 1
    });
  } catch (error: any) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video', message: error.message });
  }
});

// Create a new video
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, type } = req.body;

    if (!title || !videoUrl || !thumbnailUrl || !duration || !type) {
      return res.status(400).json({ 
        error: 'Title, videoUrl, thumbnailUrl, duration, and type are required' 
      });
    }

    if (type !== 'short' && type !== 'long') {
      return res.status(400).json({ error: 'Type must be either "short" or "long"' });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl,
        duration: parseInt(duration, 10),
        type,
        userId: req.userId!
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
      message: 'Video created successfully',
      data: video
    });
  } catch (error: any) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Failed to create video', message: error.message });
  }
});

// Update a video
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnailUrl, duration, type } = req.body;

    // Verify ownership
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (existingVideo.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own videos' });
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(videoUrl && { videoUrl }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(duration && { duration: parseInt(duration, 10) }),
        ...(type && { type })
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

    res.json({
      message: 'Video updated successfully',
      data: updatedVideo
    });
  } catch (error: any) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video', message: error.message });
  }
});

// Delete a video
// Idempotent: returns 204 even if resource doesn't exist (matches TestSprite expectations)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if video exists and verify ownership
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (existingVideo) {
      // Verify ownership only if video exists
      if (existingVideo.userId !== req.userId) {
        return res.status(403).json({ error: 'You can only delete your own videos' });
      }

      // Delete the video
      await prisma.video.delete({
        where: { id }
      });
    }
    // If video doesn't exist, we still return 204 (idempotent behavior)
    // This matches REST best practices and TestSprite expectations

    // Return 204 No Content for successful/idempotent deletion (REST standard)
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video', message: error.message });
  }
});

// Like a video
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user already liked this video
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Video already liked' });
    }

    // Create like and update video likes count in a transaction
    await prisma.$transaction([
      prisma.videoLike.create({
        data: {
          userId,
          videoId: id
        }
      }),
      prisma.video.update({
        where: { id },
        data: { likes: { increment: 1 } }
      })
    ]);

    const updatedVideo = await prisma.video.findUnique({
      where: { id }
    });

    res.json({
      message: 'Video liked successfully',
      data: {
        id: updatedVideo!.id,
        likes: updatedVideo!.likes,
        liked: true
      }
    });
  } catch (error: any) {
    console.error('Like video error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Video already liked' });
    }
    res.status(500).json({ error: 'Failed to like video', message: error.message });
  }
});

// Unlike a video
router.delete('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user liked this video
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      }
    });

    if (!existingLike) {
      return res.status(400).json({ error: 'Video not liked' });
    }

    // Delete like and update video likes count in a transaction
    await prisma.$transaction([
      prisma.videoLike.delete({
        where: {
          userId_videoId: {
            userId,
            videoId: id
          }
        }
      }),
      prisma.video.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      })
    ]);

    const updatedVideo = await prisma.video.findUnique({
      where: { id }
    });

    res.json({
      message: 'Video unliked successfully',
      data: {
        id: updatedVideo!.id,
        likes: Math.max(0, updatedVideo!.likes),
        liked: false
      }
    });
  } catch (error: any) {
    console.error('Unlike video error:', error);
    res.status(500).json({ error: 'Failed to unlike video', message: error.message });
  }
});

// Check if video is liked
router.get('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const like = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      }
    });

    res.json({
      liked: !!like,
      likesCount: video.likes
    });
  } catch (error: any) {
    console.error('Check video like error:', error);
    res.status(500).json({ error: 'Failed to check video like', message: error.message });
  }
});

export default router;
