import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { getUserRoleFromEmail } from '../utils/roles';
import { createNotification } from '../services/notifications';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Get all users (must be before /:id route to avoid route conflicts)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count();

    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Apply role fallback for each user
    const usersWithRole = users.map(user => ({
      ...user,
      role: user.role || getUserRoleFromEmail(user.email)
    }));

    res.json({
      data: usersWithRole,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure userId is available from middleware
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use role from database (fallback to calculation if missing for backward compatibility)
    const role = user.role || getUserRoleFromEmail(user.email);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    // Don't use user variable in catch block - it may not be defined
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch user' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, profilePicture, bio } = req.body;

    // Verify user can only update their own profile
    if (id !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.userId!;
    const file = req.file;

    // Generate public URL for the uploaded file
    // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll return a local path that can be served statically
    const publicUrl = `/uploads/avatars/${file.filename}`;

    // Update user's profile picture
    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: publicUrl }
    });

    // In production, return the cloud storage URL
    // For now, return the local path
    // You may need to configure Express to serve static files from the uploads directory
    const fullUrl = `${req.protocol}://${req.get('host')}${publicUrl}`;

    res.json({
      message: 'Avatar uploaded successfully',
      url: fullUrl
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar', message: error.message });
  }
});

// Follow a user
router.post('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.userId!;
    const followingId = req.params.id;

    // Cannot follow yourself
    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following (idempotent)
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        message: 'Already following',
        following: true,
      });
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Create notification for the user being followed
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    await createNotification({
      userId: followingId,
      type: 'follow',
      title: 'متابع جديد',
      body: follower?.name ? `${follower.name} بدأ بمتابعتك` : 'شخص بدأ بمتابعتك',
      data: {
        followerId,
      },
    });

    res.status(201).json({
      message: 'Now following user',
      following: true,
    });
  } catch (error: any) {
    console.error('[Follow] Error:', error);
    res.status(500).json({
      error: 'Failed to follow user',
      message: error.message,
    });
  }
});

// Unfollow a user
router.delete('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.userId!;
    const followingId = req.params.id;

    // Delete follow relationship (idempotent - deleteMany)
    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    res.status(200).json({
      message: 'Unfollowed user',
      following: false,
    });
  } catch (error: any) {
    console.error('[Follow] Error:', error);
    res.status(500).json({
      error: 'Failed to unfollow user',
      message: error.message,
    });
  }
});

// Get followers of a user
router.get('/:id/followers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get followers
    const follows = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    const followers = follows.map((follow) => follow.follower);

    res.json({
      data: followers,
      total: followers.length,
    });
  } catch (error: any) {
    console.error('[Follow] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch followers',
      message: error.message,
    });
  }
});

// Get users that a user is following
router.get('/:id/following', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get following
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    const following = follows.map((follow) => follow.following);

    res.json({
      data: following,
      total: following.length,
    });
  } catch (error: any) {
    console.error('[Follow] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch following',
      message: error.message,
    });
  }
});

export default router;
