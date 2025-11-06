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
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (existingVideo.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own videos' });
    }

    await prisma.video.delete({
      where: { id }
    });

    res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video', message: error.message });
  }
});

// Like/Unlike a video
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // For simplicity, we'll just increment likes
    // In a real app, you'd want to track which users liked which videos
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });

    res.json({
      message: 'Video liked successfully',
      data: updatedVideo
    });
  } catch (error: any) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Failed to like video', message: error.message });
  }
});

export default router;

