'use client';

import { useEffect, useState } from 'react';
import ChatBubble from '@/components/ChatBubble';
import ChatWindow, { ChatMessage } from '@/components/ChatWindow';
import { apiCall, handleApiError } from '@/lib/api-error-handler';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (messages.length === 0) {
      setMessages([
        {
          id: 'intro',
          sender: 'assistant',
          text: "Hi! 👋 I'm Panda Chat. Ask me about products, orders, or anything on your mind.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        typeof data.reply === 'string' && data.reply.trim().length > 0
          ? data.reply.trim()
          : "I'm sorry, I couldn't find the right words. Could you try asking in a different way?";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
        },
      ]);
    } catch (error: any) {
      console.error('[ChatWidget] Failed to fetch AI response:', error);
      
      const userFriendlyMessage = handleApiError(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          sender: 'assistant',
          text: `❌ ${userFriendlyMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatBubble onClick={handleToggle} />
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        inputValue={inputValue}
        isLoading={isLoading}
        onClose={handleClose}
        onChangeInput={setInputValue}
        onSend={handleSend}
      />
    </>
  );
}
