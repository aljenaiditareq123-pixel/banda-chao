'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messagesAPI } from '@/lib/api';
import { connectSocket, socketHelpers, disconnectSocket } from '@/lib/socket';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  sender: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string | null;
  lastMessage: string;
  lastMessageTime: string;
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}

function ChatContent() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    // Connect to WebSocket
    const socket = connectSocket(token);

    // Listen for new messages
    socketHelpers.onMessage((message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing indicator
    socketHelpers.onUserTyping((data) => {
      setIsTyping(data.isTyping);
    });

    // Load conversations
    loadConversations();

    return () => {
      disconnectSocket();
    };
  }, [token, user]);

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      // Transform response to conversations format
      const transformed = response.data.map((msg: Message) => ({
        id: msg.receiverId === user?.id ? msg.senderId : msg.receiverId,
        userId: msg.receiverId === user?.id ? msg.senderId : msg.receiverId,
        userName: msg.receiverId === user?.id ? msg.sender.name : msg.receiver.name,
        userProfilePicture: msg.receiverId === user?.id ? msg.sender.profilePicture : msg.receiver.profilePicture,
        lastMessage: msg.content,
        lastMessageTime: msg.timestamp,
      }));
      setConversations(transformed);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const response = await messagesAPI.getChatHistory(user.id, otherUserId);
      setMessages(response.data);

      // Join chat room for WebSocket
      socketHelpers.joinChat(otherUserId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !user) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      // Send message via API (will also trigger WebSocket)
      await messagesAPI.sendMessage({
        receiverId: selectedConversation,
        content,
      });

      // Message will be added via WebSocket event
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert('فشل إرسال الرسالة: ' + (error.response?.data?.error || error.message));
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (!selectedConversation) return;
    socketHelpers.setTyping(selectedConversation, typing);
  };

  const selectedConversationData = conversations.find(
    (conv) => conv.userId === selectedConversation
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">المحادثات</h2>
              </div>
              {loading ? (
                <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  لا توجد محادثات بعد
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.userId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.userId ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {conversation.userProfilePicture ? (
                            <img
                              src={conversation.userProfilePicture}
                              alt={conversation.userName || 'User'}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                              {(conversation.userName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.userName || 'مستخدم'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      {selectedConversationData?.userProfilePicture ? (
                        <img
                          src={selectedConversationData.userProfilePicture}
                          alt={selectedConversationData.userName || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                          {(selectedConversationData?.userName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedConversationData?.userName || 'مستخدم'}
                        </p>
                        {isTyping && (
                          <p className="text-sm text-gray-500">يكتب...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-red-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          handleTyping(true);
                        }}
                        onBlur={() => handleTyping(false)}
                        placeholder="اكتب رسالة..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || sending}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'جاري الإرسال...' : 'إرسال'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  اختر محادثة للبدء
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}


