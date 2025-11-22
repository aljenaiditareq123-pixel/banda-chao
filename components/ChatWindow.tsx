'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  onClose: () => void;
  onChangeInput: (value: string) => void;
  onSend: () => void;
}

export default function ChatWindow({
  isOpen,
  messages,
  inputValue,
  isLoading,
  onClose,
  onChangeInput,
  onSend,
}: ChatWindowProps) {
  // Always call hooks at the top level (before any early returns)
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
      'fixed bottom-24 z-40 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden',
      isRTL ? 'rtl-bottom-button' : 'right-6'
    )}>
      <header className={cn(
        'flex items-center justify-between px-5 py-4 bg-[#2E7D32] text-white',
        isRTL && 'rtl-flip-row'
      )}>
        <div>
          <h2 className="text-lg font-semibold">Panda Chat</h2>
          <p className="text-xs opacity-80">Your personal shopping assistant</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white transition"
          aria-label="Close chat"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            👋 Panda Chat is here to help. Ask me anything!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-[#2E7D32] text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
              Panda is typing...
            </div>
          </div>
        )}
      </div>

      <footer className="px-5 py-4 bg-white border-t border-gray-100 space-y-3">
        <Input
          value={inputValue}
          onChange={(event) => onChangeInput(event.target.value)}
          placeholder="Type your message..."
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <Button onClick={onSend} isFullWidth disabled={isLoading || inputValue.trim().length === 0}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </footer>
    </div>
  );
}

