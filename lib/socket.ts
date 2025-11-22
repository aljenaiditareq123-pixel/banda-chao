import { io, Socket } from 'socket.io-client';

// Get Socket.io URL from environment variables
// Supports both dedicated socket URL and API URL (which includes socket.io)
// IMPORTANT: This function must be called on the client-side only
const getSocketUrl = (): string => {
  // Server-side: Return a placeholder (socket connections only happen client-side)
  if (typeof window === 'undefined') {
    return 'https://banda-chao.onrender.com'; // Safe default for SSR
  }

  // Priority 1: Dedicated socket URL
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // Priority 2: API URL (socket.io is on the same server)
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Remove trailing slash and /api/v1 if present
    const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return baseUrl;
  }

  // Priority 3: Build from NEXT_PUBLIC_BACKEND_URL if available
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }

  // Priority 4: Client-side detection (only in browser)
  // In production, try to infer from current host
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // Use production backend URL
    return 'https://banda-chao.onrender.com';
  }

  // Fallback: Development default
  return 'http://localhost:3001';
};

let socket: Socket | null = null;

// Create a mock socket for when WebSocket is disabled
const createMockSocket = (): Socket => {
  console.log('[Socket] Creating mock socket (WebSocket disabled)');
  
  const mockSocket = {
    connected: false,
    id: 'mock-socket',
    emit: (event: string, ...args: any[]) => {
      console.log(`[MockSocket] Emit ignored: ${event}`, args);
    },
    on: (event: string, callback: Function) => {
      console.log(`[MockSocket] Event listener ignored: ${event}`);
    },
    off: (event: string) => {
      console.log(`[MockSocket] Remove listener ignored: ${event}`);
    },
    disconnect: () => {
      console.log('[MockSocket] Disconnect ignored');
    },
    connect: () => {
      console.log('[MockSocket] Connect ignored');
    }
  } as unknown as Socket;
  
  return mockSocket;
};

export const connectSocket = (token: string): Socket => {
  // Only connect on client-side
  if (typeof window === 'undefined') {
    throw new Error('Socket connections can only be established on the client-side');
  }

  // Check if WebSocket is enabled via environment variable
  if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== 'true') {
    console.log('[Socket] WebSocket disabled via NEXT_PUBLIC_ENABLE_WEBSOCKET');
    // Return a mock socket that doesn't actually connect
    return createMockSocket();
  }

  if (socket?.connected) {
    return socket;
  }

  // Compute URL lazily (on client-side only, when needed)
  const SOCKET_URL = getSocketUrl();
  
  console.log('[Socket] Connecting to:', SOCKET_URL);

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    // Enhanced reconnection settings
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10, // Increased attempts
    timeout: 20000, // 20 second timeout
    // Add additional options for better reliability
    forceNew: false,
    upgrade: true,
    rememberUpgrade: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to WebSocket server:', SOCKET_URL);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected from WebSocket server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
    console.error('[Socket] Attempted URL:', SOCKET_URL);
    
    // Log additional debugging info
    if (process.env.NODE_ENV === 'development') {
      console.error('[Socket] Environment variables:', {
        NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      });
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('[Socket] Reconnection failed:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket] Failed to reconnect after maximum attempts');
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
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('join_chat', otherUserId);
    }
  },
  
  leaveChat: (otherUserId: string) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('leave_chat', otherUserId);
    }
  },
  
  sendMessage: (receiverId: string, content: string) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('send_message', { receiverId, content });
    }
  },
  
  setTyping: (receiverId: string, isTyping: boolean) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('typing', { receiverId, isTyping });
    }
  },
  
  onMessage: (callback: (message: any) => void) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.on('new_message', callback);
    }
  },
  
  onMessageNotification: (callback: (message: any) => void) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.on('message_notification', callback);
    }
  },
  
  onUserTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.on('user_typing', callback);
    }
  },
  
  // Notifications helpers
  joinNotifications: (userId: string) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('join_notifications', { userId });
    }
  },
  
  leaveNotifications: (userId: string) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.emit('leave_notifications', { userId });
    }
  },
  
  onNotification: (callback: (notification: any) => void) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.on('new_notification', callback);
    }
  },
  
  off: (event: string) => {
    if (socket && process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
      socket.off(event);
    }
  }
};


