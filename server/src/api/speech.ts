/**
 * Speech-to-Text API Endpoint
 * Handles audio transcription requests from the frontend
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { transcribeAudio, isSpeechToTextAvailable } from '../lib/speech-to-text';

const router = Router();

// Configure multer for audio file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * POST /api/v1/speech/transcribe
 * Transcribe audio to text
 * Access: FOUNDER, ADMIN
 */
router.post(
  '/transcribe',
  authenticateToken,
  requireRole(['FOUNDER', 'ADMIN']),
  upload.single('audio'),
  async (req: AuthRequest, res: Response) => {
    try {
      // Check if Speech-to-Text is available
      if (!isSpeechToTextAvailable()) {
        return res.status(503).json({
          success: false,
          error: 'Speech-to-Text service is not configured',
          message: 'GOOGLE_SPEECH_API_KEY or GEMINI_API_KEY environment variable is required',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required',
        });
      }

      // Get language code from request (default: Arabic)
      const languageCode = (req.body.languageCode as string) || 'ar-SA';

      // Convert buffer to Blob
      const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

      // Transcribe audio
      const transcript = await transcribeAudio(audioBlob, languageCode);

      if (!transcript || transcript.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No speech detected in audio',
          message: 'Please ensure the audio contains clear speech',
        });
      }

      res.json({
        success: true,
        transcript,
        languageCode,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[Speech API] Transcription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transcribe audio',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/speech/status
 * Check if Speech-to-Text is available
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  const isAvailable = isSpeechToTextAvailable();
  res.json({
    success: true,
    available: isAvailable,
    message: isAvailable
      ? 'Speech-to-Text service is available'
      : 'Speech-to-Text service is not configured. Set GOOGLE_SPEECH_API_KEY or GEMINI_API_KEY environment variable.',
  });
});

export default router;

