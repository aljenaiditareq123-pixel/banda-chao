import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'video-reviews');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomId.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  },
});

// File filter: only allow video files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo', // .avi
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files (MP4, WebM, MOV, AVI) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * Helper function to get video duration (requires ffprobe or similar)
 * For now, we'll use a simple check - in production, use ffprobe
 */
async function validateVideoDuration(filePath: string): Promise<{ valid: boolean; duration?: number; error?: string }> {
  // In production, use ffprobe to check duration:
  // const { exec } = require('child_process');
  // exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, ...)
  
  // For now, we'll accept the file and let the frontend handle duration validation
  // The frontend will check duration before upload
  return { valid: true };
}

/**
 * POST /api/v1/video-upload/review
 * Upload a video review (15 seconds max, 10MB max)
 */
router.post('/review', authenticateToken, upload.single('video'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Validate video duration (15 seconds max)
    const durationCheck = await validateVideoDuration(req.file.path);
    if (!durationCheck.valid) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: durationCheck.error || 'Video duration exceeds 15 seconds',
      });
    }

    // In production, upload to cloud storage (S3, GCS, etc.)
    // For now, return the local file path
    // In production, replace with cloud storage URL
    const videoUrl = `/uploads/video-reviews/${req.file.filename}`;
    
    // If using cloud storage:
    // const videoUrl = await uploadToCloudStorage(req.file.path, `reviews/${req.file.filename}`);

    res.json({
      success: true,
      videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error: any) {
    // Clean up uploaded file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error uploading video review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video review',
      error: error.message,
    });
  }
});

export default router;
