import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { uploadToGCS, isGCSConfigured } from '../lib/gcs';

const router = Router();

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
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
        cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for post images
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

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
        select: {
          id: true,
          content: true,
          images: true,
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
          _count: {
            select: {
              post_likes: true,
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
      select: {
        id: true,
        content: true,
        images: true,
        created_at: true,
        updated_at: true,
        user_id: true,
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
        select: {
          id: true,
          content: true,
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

// Upload post image (authenticated)
router.post('/upload-image', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    let imageUrl: string | null = null;
    
    if (isGCSConfigured() && req.file.buffer) {
      // Upload to GCS
      imageUrl = await uploadToGCS(req.file.buffer, req.file.originalname, 'posts');
    } else if (req.file.path) {
      // Fallback to local storage
      imageUrl = `/uploads/posts/${path.basename(req.file.path)}`;
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error: unknown) {
    console.error('Upload post image error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get maker's posts (authenticated, maker only)
router.get('/me', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Get all posts for this maker
    const posts = await prisma.posts.findMany({
      where: {
        maker_id: maker.id,
      },
      select: {
        id: true,
        content: true,
        images: true,
        created_at: true,
        updated_at: true,
        user_id: true,
        _count: {
          select: {
            post_likes: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        images: post.images,
        created_at: post.created_at,
        likes: post._count.post_likes,
      })),
    });
  } catch (error: any) {
    console.error('[Posts] Error fetching maker posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create post (authenticated)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, images } = req.body;
    const userId = req.userId!;

    // Allow posts with only images (no content required)
    if (!content || content.trim().length === 0) {
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Content or at least one image is required' 
        });
      }
    }

    // Find maker by user_id (optional - for linking posts to makers)
    let makerId: string | null = null;
    try {
      const maker = await prisma.makers.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });
      makerId = maker?.id || null;
    } catch (err) {
      // Maker not found - post can still be created without maker_id
      console.warn('[Posts] Maker not found for user:', userId);
    }

    const { randomUUID } = await import('crypto');
    const postId = randomUUID();

    const post = await prisma.posts.create({
      data: {
        id: postId,
        user_id: userId,
        maker_id: makerId,
        content: content?.trim() || '',
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

    res.status(201).json({ 
      success: true,
      post 
    });
  } catch (error: unknown) {
    console.error('Create post error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Delete post (authenticated, maker only)
router.delete('/:id', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const postId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Check if post exists and belongs to this maker or user
    const existingPost = await prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership: either user_id matches or maker_id matches
    if (existingPost.user_id !== userId && existingPost.maker_id !== maker.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post',
      });
    }

    // Delete post
    await prisma.posts.delete({
      where: { id: postId },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('[Posts] Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

