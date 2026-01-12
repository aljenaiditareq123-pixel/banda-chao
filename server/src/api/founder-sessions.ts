/**
 * Founder Sessions API - Memory system for Founder Panda v2
 * EXCLUSIVE for founder only
 * 
 * NOTE: This feature is currently disabled as the founderSession model does not exist in the schema.
 * To enable, add the founderSession model to prisma/schema.prisma
 */

import { Router, Request, Response } from 'express';
import { authenticateFounder, AuthRequest } from '../middleware/founderAuth';

const router = Router();

// All routes are disabled until founderSession model is added to schema
// Uncomment and fix Prisma calls when the model is available

/**
 * POST /api/v1/founder/sessions
 * Create a new founder session summary
 */
router.post('/', authenticateFounder, async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    error: 'Founder sessions feature is not yet implemented',
    message: 'The founderSession model needs to be added to the database schema',
  });
});

/**
 * GET /api/v1/founder/sessions
 * Get founder session summaries (paginated)
 */
router.get('/', authenticateFounder, async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    error: 'Founder sessions feature is not yet implemented',
    message: 'The founderSession model needs to be added to the database schema',
  });
});

/**
 * GET /api/v1/founder/sessions/:id
 * Get specific founder session
 */
router.get('/:id', authenticateFounder, async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    error: 'Founder sessions feature is not yet implemented',
    message: 'The founderSession model needs to be added to the database schema',
  });
});

/**
 * DELETE /api/v1/founder/sessions/:id
 * Delete specific founder session
 */
router.delete('/:id', authenticateFounder, async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    error: 'Founder sessions feature is not yet implemented',
    message: 'The founderSession model needs to be added to the database schema',
  });
});

export default router;
