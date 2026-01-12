import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { randomUUID } from 'crypto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export const setupWebSocketHandlers = (io: Server) => {
  // Authentication middleware for WebSocket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('Authenticated user connected:', socket.userId);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      // Also join notifications room
      socket.join(`notifications:${socket.userId}`);
      console.log(`User ${socket.userId} joined notifications room`);
    }

    // Handle joining notifications room (explicit)
    socket.on('join_notifications', (data: { userId: string }) => {
      if (!socket.userId || socket.userId !== data.userId) return;
      socket.join(`notifications:${data.userId}`);
      console.log(`User ${socket.userId} explicitly joined notifications room`);
    });

    // Handle leaving notifications room
    socket.on('leave_notifications', (data: { userId: string }) => {
      if (!socket.userId || socket.userId !== data.userId) return;
      socket.leave(`notifications:${data.userId}`);
      console.log(`User ${socket.userId} left notifications room`);
    });

    // Handle joining a chat room
    socket.on('join_chat', async (otherUserId: string) => {
      if (!socket.userId) return;

      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.join(`chat_${roomId}`);
      console.log(`User ${socket.userId} joined chat room: ${roomId}`);
    });

    // Handle leaving a chat room
    socket.on('leave_chat', (otherUserId: string) => {
      if (!socket.userId) return;

      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.leave(`chat_${roomId}`);
      console.log(`User ${socket.userId} left chat room: ${roomId}`);
    });

    // Handle sending a message via WebSocket (alternative to REST API)
    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
      if (!socket.userId) return;

      try {
        const message = await prisma.messages.create({
          data: {
            id: randomUUID(),
            sender_id: socket.userId,
            receiver_id: data.receiverId,
            content: data.content,
            timestamp: new Date(),
            read: false,
          },
        });

        // Get sender info
        const sender = await prisma.users.findUnique({
          where: { id: socket.userId },
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        });

        const messageWithSender = {
          ...message,
          sender: sender,
        };

        // Emit to both users in the chat room
        const roomId = [socket.userId, data.receiverId].sort().join('_');
        io.to(`chat_${roomId}`).emit('new_message', messageWithSender);

        // Also emit to individual user rooms for notifications
        io.to(`user_${data.receiverId}`).emit('message_notification', messageWithSender);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      if (!socket.userId) return;

      const roomId = [socket.userId, data.receiverId].sort().join('_');
      socket.to(`chat_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
};
