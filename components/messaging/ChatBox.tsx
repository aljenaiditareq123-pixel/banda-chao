'use client';

import { useState, useEffect, useRef } from 'react';
import { initializeSocketClient, getSocket } from '@/lib/socket';
import Button from '@/components/Button';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  initialMessages?: Message[];
}

export default function ChatBox({ conversationId, currentUserId, initialMessages = [] }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const socket = initializeSocketClient(token || undefined);

    if (socket) {
      socketRef.current = socket;
      setConnected(socket.connected);

      socket.on('connect', () => {
        setConnected(true);
        // Join conversation room
        socket.emit('join:conversation', conversationId);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('joined:conversation', (data: { conversationId: string }) => {
        console.log('Joined conversation:', data.conversationId);
      });

      socket.on('message:receive', (message: Message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave:conversation', conversationId);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    const socket = getSocket();
    if (socket && connected) {
      // Send via Socket.IO
      socket.emit('message:send', {
        conversationId,
        content,
      });
    } else {
      // Fallback to HTTP API
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }

    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">{connected ? 'متصل' : 'غير متصل'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>لا توجد رسائل بعد. ابدأ المحادثة!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.sender.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending || !connected}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim() || !connected}
            variant="primary"
          >
            إرسال
          </Button>
        </div>
      </div>
    </div>
  );
}

