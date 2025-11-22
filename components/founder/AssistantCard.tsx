'use client';

import Link from 'next/link';

interface AssistantCardProps {
  id: string;
  label: string;
  description: string;
  emoji: string;
  route: string;
  gradient: string;
}

export default function AssistantCard({
  id,
  label,
  description,
  emoji,
  route,
  gradient,
}: AssistantCardProps) {
  return (
    <Link
      href={route}
      className="group block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 h-full"
    >
      <div className="flex flex-col h-full">
        {/* Icon/Emoji */}
        <div className={`w-16 h-16 rounded-xl ${gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
          {emoji}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {label}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
          {description}
        </p>

        {/* Action Button */}
        <div className="mt-auto">
          <span className="inline-flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
            Open
            <svg
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}




