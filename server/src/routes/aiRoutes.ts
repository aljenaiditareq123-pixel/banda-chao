import { Router } from 'express';
import { AIController } from '../controllers/AIController';

const router = Router();

/**
 * POST /api/ai/chat
 * Chat with the AI brain - searches memories and returns context
 */
router.post('/chat', AIController.chat);

/**
 * POST /api/ai/memory
 * Store a new memory in the AI brain
 */
router.post('/memory', AIController.storeMemory);

export default router;





