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

/**
 * POST /api/v1/chat/start
 * Start a conversation (or open existing one) between buyer and seller
 */
router.post('/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User ID not found in token',
      });
    }

    const { sellerId, productId } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
        error: 'MISSING_SELLER_ID',
      });
    }

    // Don't allow users to chat with themselves
    if (userId === sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself',
        error: 'INVALID_CONVERSATION',
      });
    }

    // Ensure participant1_id is always the smaller ID for consistency
    const participant1Id = userId < sellerId ? userId : sellerId;
    const participant2Id = userId < sellerId ? sellerId : userId;

    // Try to find existing conversation
    let conversation = await prisma.conversations.findUnique({
      where: {
        participant1_id_participant2_id_product_id: {
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          product_id: productId || null,
        },
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
      },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await prisma.conversations.create({
        data: {
          id: require('crypto').randomUUID(),
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          product_id: productId || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          participant1: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
              isVerified: true,
            },
          },
          participant2: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
              isVerified: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
        },
      });
    }

    // Determine the other participant (not the current user)
    const otherParticipant =
      conversation.participant1.id === userId
        ? conversation.participant2
        : conversation.participant1;

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        participant1: conversation.participant1,
        participant2: conversation.participant2,
        otherParticipant, // The person the current user is chatting with
        product: conversation.product,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      // Conversation already exists, try to fetch it again
      return res.status(409).json({
        success: false,
        message: 'Conversation already exists',
        error: 'CONVERSATION_EXISTS',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/v1/chat/send
 * Send a message in a conversation
 */
router.post('/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User ID not found in token',
      });
    }

    const { conversationId, content } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
        error: 'MISSING_CONVERSATION_ID',
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
        error: 'MISSING_CONTENT',
      });
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        participant1_id: true,
        participant2_id: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        error: 'CONVERSATION_NOT_FOUND',
      });
    }

    if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
        error: 'NOT_A_PARTICIPANT',
      });
    }

    // Create message
    const message = await prisma.conversation_messages.create({
      data: {
        id: require('crypto').randomUUID(),
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        is_read: false,
        created_at: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
      },
    });

    // Update conversation's last message info
    await prisma.conversations.update({
      where: { id: conversationId },
      data: {
        updated_at: new Date(),
        last_message_at: new Date(),
        last_message_text: content.trim().substring(0, 100), // First 100 chars
      },
    });

    res.status(201).json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        isRead: message.is_read,
        createdAt: message.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/chat/inbox
 * Get user's conversations (inbox)
 */
router.get('/inbox', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User ID not found in token',
      });
    }

    // Get conversations where user is participant1 or participant2
    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [
          { participant1_id: userId },
          { participant2_id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1, // Get last message for preview
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    // Transform to include other participant info
    const inbox = conversations.map((conv) => {
      const otherParticipant =
        conv.participant1.id === userId ? conv.participant2 : conv.participant1;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        otherParticipant,
        product: conv.product,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.sender_id,
              senderName: lastMessage.sender.name,
              isRead: lastMessage.is_read,
              createdAt: lastMessage.created_at,
            }
          : null,
        lastMessageText: conv.last_message_text,
        lastMessageAt: conv.last_message_at,
        updatedAt: conv.updated_at,
        createdAt: conv.created_at,
      };
    });

    res.json({
      success: true,
      conversations: inbox,
      total: inbox.length,
    });
  } catch (error: any) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inbox',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/chat/:conversationId
 * Get messages in a conversation
 */
router.get('/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User ID not found in token',
      });
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
        error: 'CONVERSATION_NOT_FOUND',
      });
    }

    if (conversation.participant1_id !== userId && conversation.participant2_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
        error: 'NOT_A_PARTICIPANT',
      });
    }

    // Get messages
    const [messages, total] = await Promise.all([
      prisma.conversation_messages.findMany({
        where: { conversation_id: conversationId },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc', // Oldest first
        },
      }),
      prisma.conversation_messages.count({
        where: { conversation_id: conversationId },
      }),
    ]);

    // Determine other participant
    const otherParticipant =
      conversation.participant1.id === userId ? conversation.participant2 : conversation.participant1;

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        otherParticipant,
        product: conversation.product,
        createdAt: conversation.created_at,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        isRead: msg.is_read,
        createdAt: msg.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
