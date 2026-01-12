import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { getIO } from '../realtime/socket';
import { createNotification } from '../services/notifications';
import { randomUUID } from 'crypto';

const router = Router();

// Send a message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Create message
    const message = await prisma.messages.create({
      data: {
        id: randomUUID(),
        sender_id: req.userId!,
        receiver_id: receiverId,
        content,
        timestamp: new Date(),
        read: false,
      },
      include: {
        users_messages_sender_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        },
        users_messages_receiver_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        }
      }
    });

    // Emit message via WebSocket
    const io = getIO();
    const roomId = [req.userId, receiverId].sort().join('_');
    if (io) {
      io.to(roomId).emit('new_message', message);
    }

    // Create notification for message receiver (if not the same user)
    if (req.userId !== receiverId) {
      const sender = await prisma.users.findUnique({
        where: { id: req.userId! },
        select: { name: true },
      });

      await createNotification({
        userId: receiverId,
        type: 'message',
        title: 'رسالة جديدة',
        body: sender?.name ? `${sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}` : `رسالة جديدة: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        data: {
          messageId: message.id,
          fromUserId: req.userId!,
        },
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message', message: error.message });
  }
});

// Get chat history between two users
router.get('/:userId1/:userId2', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId1, userId2 } = req.params;
    const currentUserId = req.userId!;

    // Verify user is part of this conversation
    if (currentUserId !== userId1 && currentUserId !== userId2) {
      return res.status(403).json({ error: 'Unauthorized access to this conversation' });
    }

    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { sender_id: userId1, receiver_id: userId2 },
          { sender_id: userId2, receiver_id: userId1 }
        ]
      },
      include: {
        users_messages_sender_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        },
        users_messages_receiver_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    res.json(messages);
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', message: error.message });
  }
});

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get distinct conversations - Note: Prisma doesn't support distinct on multiple fields directly
    // We'll fetch all messages and group them in memory
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: {
        users_messages_sender_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        },
        users_messages_receiver_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Group by conversation partner
    const conversationMap = new Map<string, typeof messages[0]>();
    messages.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json(conversations);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', message: error.message });
  }
});

export default router;
