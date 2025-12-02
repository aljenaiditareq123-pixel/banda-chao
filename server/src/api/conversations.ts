import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getIO } from '../realtime/socket';
import { validate } from '../middleware/validate';
import { createConversationSchema, sendMessageSchema } from '../validation/conversationSchemas';

const router = Router();

// Get or create conversation between two users
router.post('/', authenticateToken, validate(createConversationSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { participantId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (userId === participantId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself',
      });
    }

    // Find existing conversation
    // Conversations model doesn't exist - use messages directly
    // Find existing messages between users
    const existingMessages = await prisma.messages.findFirst({
      where: {
        OR: [
          { sender_id: userId, receiver_id: participantId },
          { sender_id: participantId, receiver_id: userId },
        ],
      },
      orderBy: { timestamp: 'desc' },
    });
    
    let conversation: any = null;
    if (existingMessages) {
      conversation = {
        id: `${userId}_${participantId}`,
        participants: [
          await prisma.users.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, profile_picture: true } }),
          await prisma.users.findUnique({ where: { id: participantId }, select: { id: true, name: true, email: true, profile_picture: true } }),
        ],
        messages: [existingMessages],
      };
    } else {
      // Create conversation structure (no DB table, just return structure)
      const [user1, user2] = await Promise.all([
        prisma.users.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, profile_picture: true } }),
        prisma.users.findUnique({ where: { id: participantId }, select: { id: true, name: true, email: true, profile_picture: true } }),
      ]);
      conversation = {
        id: `${userId}_${participantId}`,
        participants: [user1, user2],
        messages: [],
      };
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/get conversation',
    });
  }
});

// Get user conversations
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get all unique conversation partners from messages
    const sentMessages = await prisma.messages.findMany({
      where: { sender_id: userId },
      select: { receiver_id: true },
      distinct: ['receiver_id'],
    });
    const receivedMessages = await prisma.messages.findMany({
      where: { receiver_id: userId },
      select: { sender_id: true },
      distinct: ['sender_id'],
    });
    
    const partnerIds = [...new Set([
      ...sentMessages.map(m => m.receiver_id),
      ...receivedMessages.map(m => m.sender_id),
    ])];
    
    const conversations = await Promise.all(partnerIds.map(async (partnerId) => {
      const lastMessage = await prisma.messages.findFirst({
        where: {
          OR: [
            { sender_id: userId, receiver_id: partnerId },
            { sender_id: partnerId, receiver_id: userId },
          ],
        },
        orderBy: { timestamp: 'desc' },
        include: {
          users_messages_sender_idTousers: {
            select: { id: true, name: true },
          },
        },
      });
      
      const partner = await prisma.users.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, email: true, profile_picture: true },
      });
      
      const messageCount = await prisma.messages.count({
        where: {
          OR: [
            { sender_id: userId, receiver_id: partnerId },
            { sender_id: partnerId, receiver_id: userId },
          ],
        },
      });
      
      return {
        id: `${userId}_${partnerId}`,
        participants: [partner],
        messages: lastMessage ? [lastMessage] : [],
        _count: { messages: messageCount },
      };
    }));

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
});

// Get conversation messages
router.get('/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const skip = (page - 1) * pageSize;

    const [messages, total] = await Promise.all([
      prisma.messages.findMany({
        where: {
          OR: [
            { sender_id: userId, receiver_id: partnerId },
            { sender_id: partnerId, receiver_id: userId },
          ],
        },
        skip,
        take: pageSize,
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          users_messages_sender_idTousers: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
        },
      }),
      prisma.messages.count({
        where: {
          OR: [
            { sender_id: userId, receiver_id: partnerId },
            { sender_id: partnerId, receiver_id: userId },
          ],
        },
      }),
    ]);

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
});

// Send message (fallback for non-realtime)
router.post('/:id/messages', authenticateToken, validate(sendMessageSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: conversationId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Verify user is part of conversation
    const [partnerId1, partnerId2] = conversationId.split('_');
    if (partnerId1 !== userId && partnerId2 !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation',
      });
    }
    const partnerId = partnerId1 === userId ? partnerId2 : partnerId1;

    const { randomUUID } = await import('crypto');
    const message = await prisma.messages.create({
      data: {
        id: randomUUID(),
        sender_id: userId,
        receiver_id: partnerId,
        content: content.trim(),
        timestamp: new Date(),
        read: false,
      },
      include: {
        users_messages_sender_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
    });

    // Emit Socket.IO event for real-time delivery
    const io = getIO();
    io?.to(`conversation:${conversationId}`).emit('message:sent', message);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
});

export default router;



