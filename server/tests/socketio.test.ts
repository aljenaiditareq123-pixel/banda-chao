import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Client as SocketIOClient } from 'socket.io-client';
import { createServer } from 'http';
import express from 'express';
import { initializeSocket, getIO } from '../src/realtime/socket';
import { prisma } from '../src/utils/prisma';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

describe('Socket.IO Real-time Communication Tests', () => {
  let httpServer: HTTPServer;
  let io: SocketIOServer | null;
  let userA: { id: string; email: string; token: string };
  let userB: { id: string; email: string; token: string };
  let conversationId: string;
  let serverUrl: string;

  beforeAll(async () => {
    // Create test Express app and HTTP server
    const app = express();
    httpServer = createServer(app);
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    io = getIO();
    
    if (!io) {
      throw new Error('Socket.IO server not initialized');
    }

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const port = (httpServer.address() as any)?.port || 3002;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Create User A
    const userAEmail = `usera-${Date.now()}@test.com`;
    const userAPassword = 'password123';
    const userAHash = await bcrypt.hash(userAPassword, 10);
    const userAId = randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO users (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
      VALUES (${userAId}, ${userAEmail}, ${userAHash}, 'User A', 'BUYER', NOW(), NOW());
    `;

    const userAToken = jwt.sign(
      { userId: userAId, email: userAEmail, role: 'BUYER' },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );

    userA = { id: userAId, email: userAEmail, token: userAToken };

    // Create User B
    const userBEmail = `userb-${Date.now()}@test.com`;
    const userBPassword = 'password123';
    const userBHash = await bcrypt.hash(userBPassword, 10);
    const userBId = randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO users (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
      VALUES (${userBId}, ${userBEmail}, ${userBHash}, 'User B', 'BUYER', NOW(), NOW());
    `;

    const userBToken = jwt.sign(
      { userId: userBId, email: userBEmail, role: 'BUYER' },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );

    userB = { id: userBId, email: userBEmail, token: userBToken };

    // Create a conversation between User A and User B
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: userAId }, { id: userBId }],
        },
      },
    });

    conversationId = conversation.id;
  });

  afterAll(async () => {
    // Cleanup
    if (conversationId) {
      await prisma.conversation.delete({ where: { id: conversationId } }).catch(() => {});
    }
    if (userA?.id) {
      await prisma.$executeRaw`DELETE FROM users WHERE id = ${userA.id}`.catch(() => {});
    }
    if (userB?.id) {
      await prisma.$executeRaw`DELETE FROM users WHERE id = ${userB.id}`.catch(() => {});
    }
    
    io?.close();
    httpServer?.close();
  });

  it('should connect User A and User B via Socket.IO', async () => {

    return new Promise<void>((resolve, reject) => {
      const clientA = SocketIOClient(serverUrl, {
        auth: { token: userA.token },
        transports: ['websocket'],
      });

      const clientB = SocketIOClient(serverUrl, {
        auth: { token: userB.token },
        transports: ['websocket'],
      });

      let clientAConnected = false;
      let clientBConnected = false;

      clientA.on('connect', () => {
        clientAConnected = true;
        if (clientAConnected && clientBConnected) {
          clientA.disconnect();
          clientB.disconnect();
          resolve();
        }
      });

      clientB.on('connect', () => {
        clientBConnected = true;
        if (clientAConnected && clientBConnected) {
          clientA.disconnect();
          clientB.disconnect();
          resolve();
        }
      });

      clientA.on('connect_error', (error) => {
        reject(new Error(`Client A connection error: ${error.message}`));
      });

      clientB.on('connect_error', (error) => {
        reject(new Error(`Client B connection error: ${error.message}`));
      });

      setTimeout(() => {
        if (!clientAConnected || !clientBConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  });

  it('should send message from User A and User B should receive it instantly', async () => {

    return new Promise<void>((resolve, reject) => {
      const clientA = SocketIOClient(serverUrl, {
        auth: { token: userA.token },
        transports: ['websocket'],
      });

      const clientB = SocketIOClient(serverUrl, {
        auth: { token: userB.token },
        transports: ['websocket'],
      });

      let messageReceived = false;
      const testMessage = `Test message at ${Date.now()}`;

      // User B joins conversation room
      clientB.on('connect', () => {
        clientB.emit('join:conversation', conversationId);
      });

      clientB.on('joined:conversation', () => {
        // User A sends message
        clientA.emit('message:send', {
          conversationId,
          content: testMessage,
        });
      });

      // User B should receive the message
      clientB.on('message:sent', (message: any) => {
        expect(message).toHaveProperty('content', testMessage);
        expect(message).toHaveProperty('senderId', userA.id);
        messageReceived = true;
        clientA.disconnect();
        clientB.disconnect();
        resolve();
      });

      clientA.on('connect', () => {
        clientA.emit('join:conversation', conversationId);
      });

      // Handle errors
      clientA.on('error', (error) => {
        reject(new Error(`Client A error: ${error}`));
      });

      clientB.on('error', (error) => {
        reject(new Error(`Client B error: ${error}`));
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!messageReceived) {
          clientA.disconnect();
          clientB.disconnect();
          reject(new Error('Message not received within timeout'));
        }
      }, 10000);
    });
  });

  it('should send notification to User B and User B should receive it instantly', async () => {

    return new Promise<void>((resolve, reject) => {
      const clientB = SocketIOClient(serverUrl, {
        auth: { token: userB.token },
        transports: ['websocket'],
      });

      let notificationReceived = false;
      const testNotification = {
        type: 'TEST',
        title: 'Test Notification',
        body: `Test notification at ${Date.now()}`,
      };

      clientB.on('connect', () => {
          // Wait a bit for connection to stabilize
        setTimeout(() => {
          // Emit notification to User B's room
          if (io) {
            io.to(`user:${userB.id}`).emit('notification', {
              id: randomUUID(),
              userId: userB.id,
              ...testNotification,
              read: false,
              createdAt: new Date(),
            });
          }
        }, 500);
      });

      // User B should receive the notification
      clientB.on('notification', (notification: any) => {
        expect(notification).toHaveProperty('title', testNotification.title);
        expect(notification).toHaveProperty('body', testNotification.body);
        expect(notification).toHaveProperty('userId', userB.id);
        notificationReceived = true;
        clientB.disconnect();
        resolve();
      });

      clientB.on('connect_error', (error) => {
        reject(new Error(`Client B connection error: ${error.message}`));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!notificationReceived) {
          clientB.disconnect();
          reject(new Error('Notification not received within timeout'));
        }
      }, 5000);
    });
  });
});

