/**
 * Founder Sessions API - Memory system for Founder Panda v2
 * EXCLUSIVE for founder only
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateFounder, AuthRequest } from '../middleware/founderAuth';
import { founderAIRateLimit } from '../middleware/rateLimiter';
import { prisma } from '../utils/prisma';

const router = Router();

/**
 * POST /api/v1/founder/sessions
 * Create a new founder session summary
 */
router.post('/',
  founderAIRateLimit,
  authenticateFounder,
  [
    body('title')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('summary')
      .isString()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Summary must be between 1 and 5000 characters'),
    body('tasks')
      .optional()
      .isArray()
      .withMessage('Tasks must be an array if provided'),
    body('mode')
      .optional()
      .isIn(['STRATEGY_MODE', 'PRODUCT_MODE', 'TECH_MODE', 'MARKETING_MODE', 'CHINA_MODE'])
      .withMessage('Invalid operating mode'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, summary, tasks, mode } = req.body;
      const founderId = req.userId; // Use userId from AuthRequest after authenticateFounder

      if (!founderId) {
        console.warn('[FounderSessions] POST - No userId found', { path: req.path });
        return res.status(401).json({
          message: 'Unauthorized: founder access only',
          error: 'Authentication required'
        });
      }

      // Create session record
      const session = await prisma.founderSession.create({
        data: {
          title,
          summary,
          tasks: tasks ? JSON.stringify(tasks) : null,
          founderId,
          mode: mode || null,
        }
      });

      console.log(`[FounderSessions] Created session ${session.id} for founder ${founderId}`);

      res.status(201).json({
        success: true,
        data: {
          id: session.id,
          title: session.title,
          summary: session.summary,
          tasks: session.tasks ? JSON.parse(session.tasks) : null,
          mode: session.mode,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      });

    } catch (error) {
      console.error('[FounderSessions] Error creating session:', error);
      res.status(500).json({
        error: 'Failed to create session'
      });
    }
  }
);

/**
 * GET /api/v1/founder/sessions
 * Get founder session summaries (paginated)
 */
router.get('/',
  authenticateFounder,
  async (req: AuthRequest, res: Response) => {
    try {
      const founderId = req.userId; // Use userId from AuthRequest after authenticateFounder
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      if (!founderId) {
        console.warn('[FounderSessions] GET - No userId found', { path: req.path });
        return res.status(401).json({
          message: 'Unauthorized: founder access only',
          error: 'Authentication required'
        });
      }

      // Get sessions for founder
      const sessions = await prisma.founderSession.findMany({
        where: {
          founderId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          summary: true,
          tasks: true,
          mode: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Parse tasks JSON for each session
      const sessionsWithParsedTasks = sessions.map(session => ({
        ...session,
        tasks: session.tasks ? JSON.parse(session.tasks) : null
      }));

      // Get total count
      const totalCount = await prisma.founderSession.count({
        where: {
          founderId
        }
      });

      res.json({
        success: true,
        data: {
          sessions: sessionsWithParsedTasks,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
          }
        }
      });

    } catch (error) {
      console.error('[FounderSessions] Error fetching sessions:', error);
      res.status(500).json({
        error: 'Failed to fetch sessions'
      });
    }
  }
);

/**
 * GET /api/v1/founder/sessions/:id
 * Get specific founder session
 */
router.get('/:id',
  authenticateFounder,
  async (req: AuthRequest, res: Response) => {
    try {
      const founderId = req.userId; // Use userId from AuthRequest after authenticateFounder
      const sessionId = req.params.id;

      if (!founderId) {
        console.warn('[FounderSessions] GET /:id - No userId found', { path: req.path });
        return res.status(401).json({
          message: 'Unauthorized: founder access only',
          error: 'Authentication required'
        });
      }

      const session = await prisma.founderSession.findFirst({
        where: {
          id: sessionId,
          founderId // Ensure founder can only access their own sessions
        }
      });

      if (!session) {
        return res.status(404).json({
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: session.id,
          title: session.title,
          summary: session.summary,
          tasks: session.tasks ? JSON.parse(session.tasks) : null,
          mode: session.mode,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      });

    } catch (error) {
      console.error('[FounderSessions] Error fetching session:', error);
      res.status(500).json({
        error: 'Failed to fetch session'
      });
    }
  }
);

/**
 * DELETE /api/v1/founder/sessions/:id
 * Delete specific founder session
 */
router.delete('/:id',
  authenticateFounder,
  async (req: AuthRequest, res: Response) => {
    try {
      const founderId = req.userId; // Use userId from AuthRequest after authenticateFounder
      const sessionId = req.params.id;

      if (!founderId) {
        console.warn('[FounderSessions] DELETE /:id - No userId found', { path: req.path });
        return res.status(401).json({
          message: 'Unauthorized: founder access only',
          error: 'Authentication required'
        });
      }

      // Delete session (only if it belongs to the founder)
      const deletedSession = await prisma.founderSession.deleteMany({
        where: {
          id: sessionId,
          founderId
        }
      });

      if (deletedSession.count === 0) {
        return res.status(404).json({
          error: 'Session not found'
        });
      }

      console.log(`[FounderSessions] Deleted session ${sessionId} for founder ${founderId}`);

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });

    } catch (error) {
      console.error('[FounderSessions] Error deleting session:', error);
      res.status(500).json({
        error: 'Failed to delete session'
      });
    }
  }
);

export default router;
