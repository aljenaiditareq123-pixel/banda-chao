import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocketClient(token?: string): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  socket = io(API_BASE_URL, {
    auth: {
      token: token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null),
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Alias for initializeSocketClient for backward compatibility
export function connectSocket(token?: string): Socket | null {
  return initializeSocketClient(token);
}

// Socket helpers object with common socket operations
export const socketHelpers = {
  joinChat: (userId: string) => {
    if (!socket) return;
    const roomId = socket.id ? [socket.id, userId].sort().join('_') : `chat:${userId}`;
    socket.emit('join_room', roomId);
  },
  
  setTyping: (userId: string, typing: boolean) => {
    if (!socket) return;
    socket.emit('typing', { userId, typing });
  },
  
  onMessage: (callback: (message: any) => void) => {
    if (!socket) return;
    socket.on('new_message', callback);
  },
  
  onUserTyping: (callback: (data: { userId: string; typing: boolean }) => void) => {
    if (!socket) return;
    socket.on('user_typing', callback);
  },
  
  joinNotifications: (userId: string) => {
    if (!socket) return;
    socket.emit('join_notifications', userId);
  },
  
  leaveNotifications: (userId: string) => {
    if (!socket) return;
    socket.emit('leave_notifications', userId);
  },
  
  onNotification: (callback: (notification: any) => void) => {
    if (!socket) return;
    socket.on('new_notification', callback);
  },
  
  off: (event: string) => {
    if (!socket) return;
    socket.off(event);
  },
};



