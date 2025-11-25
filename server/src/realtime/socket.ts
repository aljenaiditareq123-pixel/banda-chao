import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string; email: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    console.log(`User ${userId} connected to Socket.IO`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join conversation rooms
    socket.on('join:conversation', async (conversationId: string) => {
      try {
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

        if (conversation) {
          socket.join(`conversation:${conversationId}`);
          socket.emit('joined:conversation', { conversationId });
        } else {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Send message
    socket.on('message:send', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

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
          socket.emit('error', { message: 'Not authorized to send message' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
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

        // Emit to all users in conversation
        io?.to(`conversation:${conversationId}`).emit('message:receive', message);

        // TODO: Send notification to other participants
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Leave conversation
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from Socket.IO`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Helper to emit notification to user
export function emitNotification(userId: string, notification: any) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}


