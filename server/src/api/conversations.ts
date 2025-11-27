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
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            id: {
              in: [userId, participantId],
            },
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
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
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: participantId }],
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
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
      });
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

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

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
      prisma.message.findMany({
        where: {
          conversationId,
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.message.count({
        where: {
          conversationId,
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
        message: 'Not authorized to send message in this conversation',
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
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



