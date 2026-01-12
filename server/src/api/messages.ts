import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { io } from '../index';
import { createNotification } from '../services/notifications';

const router = Router();

// Send a message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Emit message via WebSocket
    const roomId = [req.userId, receiverId].sort().join('_');
    io.to(roomId).emit('new_message', message);

    // Create notification for message receiver (if not the same user)
    if (req.userId !== receiverId) {
      const sender = await prisma.user.findUnique({
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

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true
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

    // Get distinct conversations
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      distinct: ['senderId', 'receiverId']
    });

    res.json(conversations);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', message: error.message });
  }
});

export default router;


