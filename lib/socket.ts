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



