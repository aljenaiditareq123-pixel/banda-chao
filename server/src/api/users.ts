import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../validation/userSchemas';
import { uploadToGCS, isGCSConfigured, deleteFromGCS } from '../lib/gcs';

const router = Router();

// Configure multer for file uploads (in-memory for GCS, or disk for local fallback)
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage if GCS is configured, otherwise use disk storage (fallback)
const storage = isGCSConfigured()
  ? multer.memoryStorage() // Store in memory for GCS upload
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

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
    // Use raw SQL to ensure consistent field names and avoid Prisma schema mismatches
    const users = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      profilePicture: string | null;
      bio: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT 
        id, 
        email, 
        name, 
        profile_picture as "profilePicture", 
        bio, 
        role, 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE id = ${req.userId!}
      LIMIT 1;
    `;

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      userId: req.userId,
    });
    res.status(500).json({ error: 'Internal server error' });
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
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let imageUrl: string;

    // Use GCS if configured, otherwise use local storage
    if (isGCSConfigured() && req.file.buffer) {
      // Upload to Google Cloud Storage
      imageUrl = await uploadToGCS(req.file.buffer, req.file.originalname, 'avatars');
      
      // Delete old avatar from GCS if exists
      const currentUser = await prisma.users.findUnique({
        where: { id: req.userId! },
        select: { profile_picture: true },
      });
      
      if (currentUser?.profile_picture && currentUser.profile_picture.startsWith('https://storage.googleapis.com/')) {
        await deleteFromGCS(currentUser.profile_picture);
      }
    } else {
      // Fallback to local storage
      imageUrl = `/uploads/avatars/${req.file.filename}`;
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

export default router;



