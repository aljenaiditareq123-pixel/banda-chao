/**
 * Simple Video Upload API
 * Uploads video to cloud storage and returns URL only (no database record)
 * Used for product videos, etc.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getStorageProvider, isStorageConfigured } from '../lib/storage';

const router = Router();

// Configure multer for video uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov|avi/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = /video\/(mp4|webm|quicktime|x-msvideo)/.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (mp4, webm, mov, avi) are allowed'));
    }
  },
});

/**
 * POST /api/v1/video-upload-simple
 * Upload video file and return URL only (no database record)
 */
router.post('/', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: 'Video file is required' 
      });
    }

    if (!file.buffer) {
      return res.status(400).json({ 
        success: false,
        error: 'Video file buffer is required' 
      });
    }

    // Check if storage provider is configured
    if (!isStorageConfigured()) {
      return res.status(503).json({ 
        success: false,
        error: 'Storage service is under maintenance. Please configure Alibaba Cloud OSS or contact support.' 
      });
    }

    try {
      // Get storage provider (Alibaba OSS or GCS)
      const storageProvider = getStorageProvider();
      
      // Upload video to cloud storage
      const videoUrl = await storageProvider.uploadFile(file.buffer, file.originalname, 'videos');
      
      return res.json({
        success: true,
        videoUrl,
        fileName: file.originalname,
        fileSize: file.size,
      });
    } catch (storageError: any) {
      console.error('[Video Upload Simple] Storage upload error:', storageError);
      return res.status(503).json({ 
        success: false,
        error: 'Failed to upload video to storage service. Please try again later or contact support.',
        details: process.env.NODE_ENV === 'development' ? storageError.message : undefined
      });
    }
  } catch (error: any) {
    console.error('[Video Upload Simple] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload video',
    });
  }
});

export default router;
