import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

// Helper functions for WebSocket events
export const socketHelpers = {
  joinChat: (otherUserId: string) => {
    if (socket) {
      socket.emit('join_chat', otherUserId);
    }
  },
  
  leaveChat: (otherUserId: string) => {
    if (socket) {
      socket.emit('leave_chat', otherUserId);
    }
  },
  
  sendMessage: (receiverId: string, content: string) => {
    if (socket) {
      socket.emit('send_message', { receiverId, content });
    }
  },
  
  setTyping: (receiverId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  },
  
  onMessage: (callback: (message: any) => void) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  },
  
  onMessageNotification: (callback: (message: any) => void) => {
    if (socket) {
      socket.on('message_notification', callback);
    }
  },
  
  onUserTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socket) {
      socket.on('user_typing', callback);
    }
  },
  
  // Notifications helpers
  joinNotifications: (userId: string) => {
    if (socket) {
      socket.emit('join_notifications', { userId });
    }
  },
  
  leaveNotifications: (userId: string) => {
    if (socket) {
      socket.emit('leave_notifications', { userId });
    }
  },
  
  onNotification: (callback: (notification: any) => void) => {
    if (socket) {
      socket.on('new_notification', callback);
    }
  },
  
  off: (event: string) => {
    if (socket) {
      socket.off(event);
    }
  }
};


