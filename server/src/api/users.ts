import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../validation/userSchemas';
import { getStorageProvider, isStorageConfigured } from '../lib/storage';

const router = Router();

// Configure multer for file uploads
// SECURITY: Always use memory storage - we upload directly to cloud storage (Alibaba OSS or GCS)
// Local storage is disabled for security and performance reasons
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Validate userId is present (should be set by authenticateToken middleware)
    if (!req.userId) {
      console.error('[GET /me] userId is missing from request:', {
        path: req.path,
        hasUser: !!req.user,
        userEmail: req.user?.email,
      });
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    // Use Prisma query for better type safety and error handling
    const user = await prisma.users.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        bio: true,
        role: true,
        isVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      console.warn('[GET /me] User not found in database:', {
        userId: req.userId,
        email: req.user?.email,
      });
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Transform snake_case to camelCase for API response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profile_picture,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    res.json({ user: userResponse });
  } catch (error: any) {
    console.error('[GET /me] Error fetching user:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      name: error?.name || 'Unknown error type',
      userId: req.userId,
      email: req.user?.email,
      path: req.path,
    });
    
    // Return more specific error messages in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Internal server error'
      : 'Internal server error';
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        bio: true,
        role: true,
        isVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, validate(updateUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { name, bio } = req.body;

    const user = await prisma.users.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        bio: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ user });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload avatar
// SECURITY: Uses Storage Provider (Alibaba OSS or GCS) - no local storage fallback
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ 
        error: 'File buffer is required. Please ensure the file was uploaded correctly.' 
      });
    }

    // Check if storage provider is configured
    if (!isStorageConfigured()) {
      return res.status(503).json({ 
        error: 'Storage service is under maintenance. Please configure Alibaba Cloud OSS or contact support.' 
      });
    }

    let imageUrl: string;

    try {
      // Get storage provider (Alibaba OSS or GCS)
      const storageProvider = getStorageProvider();
      
      // Upload avatar to cloud storage
      imageUrl = await storageProvider.uploadFile(req.file.buffer, req.file.originalname, 'avatars');
      
      // Delete old avatar from cloud storage if exists
      const currentUser = await prisma.users.findUnique({
        where: { id: req.userId! },
        select: { profile_picture: true },
      });
      
      // Delete old avatar if it exists and is from cloud storage
      if (currentUser?.profile_picture) {
        // Check if old avatar is from cloud storage (OSS or GCS)
        const isCloudStorage = 
          currentUser.profile_picture.startsWith('https://storage.googleapis.com/') ||
          currentUser.profile_picture.includes('.aliyuncs.com/') ||
          currentUser.profile_picture.includes('.oss-cn-');
        
        if (isCloudStorage) {
          try {
            await storageProvider.deleteFile(currentUser.profile_picture);
            console.log(`[Avatar Upload] ✅ Deleted old avatar: ${currentUser.profile_picture}`);
          } catch (deleteError: any) {
            // Don't fail the upload if deletion fails
            console.warn(`[Avatar Upload] ⚠️ Failed to delete old avatar: ${deleteError.message}`);
          }
        }
      }
    } catch (storageError: any) {
      console.error('[Avatar Upload] Storage upload error:', storageError);
      return res.status(503).json({ 
        error: 'Failed to upload avatar to storage service. Please try again later or contact support.',
        details: process.env.NODE_ENV === 'development' ? storageError.message : undefined
      });
    }

    const user = await prisma.users.update({
      where: { id: req.userId! },
      data: {
        profile_picture: imageUrl,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        bio: true,
        role: true,
      },
    });

    res.json({
      message: 'Avatar uploaded successfully',
      user,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/users/:id/verify - Update user verification status (admin/founder only)
router.patch('/:id/verify', authenticateToken, requireRole(['ADMIN', 'FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVerified must be a boolean value',
        code: 'INVALID_VERIFICATION_STATUS',
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        isVerified: isVerified,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile_picture: true,
        bio: true,
        role: true,
        isVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: `User verification ${isVerified ? 'enabled' : 'disabled'} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/v1/users - Get all users (admin/founder only)
router.get('/', authenticateToken, requireRole(['ADMIN', 'FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          profile_picture: true,
          bio: true,
          role: true,
          isVerified: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.users.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;



