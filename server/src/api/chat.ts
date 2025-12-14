import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateChatResponse, getUserRecentOrder } from '../services/chatService';
import { prisma } from '../utils/prisma';

const router = Router();

/**
 * POST /api/v1/chat/message
 * Send a message to the AI Butler
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, context, locale = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get user info if authenticated
    let userId: string | undefined;
    let userName: string | undefined;
    let recentOrderId: string | undefined;

    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        // Try to decode token to get user ID (simplified - in production use proper JWT verification)
        const user = await prisma.users.findFirst({
          where: { id: token }, // This is simplified - should use proper JWT verification
        } as any);

        if (user) {
          userId = user.id;
          userName = user.name || undefined;
          recentOrderId = await getUserRecentOrder(user.id);
        }
      }
    } catch (error) {
      // If auth fails, continue as guest
      console.log('Auth check failed, continuing as guest');
    }

    // Build chat context
    const chatContext = {
      userId,
      userName,
      currentProductId: context?.currentProductId,
      recentOrderId: recentOrderId || context?.recentOrderId,
      conversationHistory: context?.conversationHistory || [],
    };

    // Generate response
    const response = await generateChatResponse(message.trim(), chatContext, locale);

    return res.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/chat/message (Authenticated)
 * Send a message with user authentication
 */
router.post('/message/auth', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context, locale = 'en' } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Get user info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    } as any);

    const recentOrderId = await getUserRecentOrder(userId);

    // Build chat context
    const chatContext = {
      userId: user?.id,
      userName: user?.name || undefined,
      currentProductId: context?.currentProductId,
      recentOrderId: recentOrderId || context?.recentOrderId,
      conversationHistory: context?.conversationHistory || [],
    };

    // Generate response
    const response = await generateChatResponse(message.trim(), chatContext, locale);

    return res.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message,
    });
  }
});

export default router;
