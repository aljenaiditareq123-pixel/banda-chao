'use client';

interface ChatBubbleProps {
  onClick: () => void;
}

export default function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#2E7D32] text-white shadow-lg flex items-center justify-center hover:bg-[#256628] transition focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/40"
      aria-label="Open Panda Chat"
    >
      <span className="text-3xl">🐼</span>
    </button>
  );
}

