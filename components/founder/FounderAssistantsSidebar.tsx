'use client';

import { useState } from 'react';
import { type Assistant, type FounderAssistantsSidebarProps } from '@/types/founder';

const assistants: Assistant[] = [
  {
    id: 'founder',
    name: 'Founder Panda',
    nameAr: 'الباندا المؤسس',
    role: 'Strategic Vision Leader',
    roleAr: 'قائد الرؤية الاستراتيجية',
    emoji: '🐼',
    gradient: 'from-rose-500 to-pink-600',
    isActive: true,
  },
  {
    id: 'tech',
    name: 'Technical Panda',
    nameAr: 'الباندا التقني',
    role: 'Infrastructure Engineer',
    roleAr: 'مهندس البنية التحتية',
    emoji: '💻',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'guard',
    name: 'Security Panda',
    nameAr: 'الباندا الحارس',
    role: 'Security & Privacy Shield',
    roleAr: 'درع الأمن والخصوصية',
    emoji: '🛡️',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'commerce',
    name: 'Commerce Panda',
    nameAr: 'باندا التجارة',
    role: 'Sales & Growth Strategist',
    roleAr: 'استراتيجي المبيعات والنمو',
    emoji: '📊',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'content',
    name: 'Content Panda',
    nameAr: 'باندا المحتوى',
    role: 'Brand Voice & Storyteller',
    roleAr: 'صوت العلامة وراوي القصص',
    emoji: '✍️',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'logistics',
    name: 'Logistics Panda',
    nameAr: 'باندا اللوجستيات',
    role: 'Operations Coordinator',
    roleAr: 'منسق العمليات',
    emoji: '📦',
    gradient: 'from-slate-500 to-gray-600',
  },
];

export default function FounderAssistantsSidebar({ 
  selectedAssistant = 'founder', 
  onAssistantSelect 
}: FounderAssistantsSidebarProps) {
  const [hoveredAssistant, setHoveredAssistant] = useState<string | null>(null);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🐼</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Assistants</h2>
            <p className="text-sm text-gray-600">مساعدوك الستة</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Choose an assistant to start your conversation
        </p>
      </div>

      {/* Assistants List */}
      <div className="p-4 space-y-3">
        {assistants.map((assistant) => {
          const isSelected = selectedAssistant === assistant.id;
          const isHovered = hoveredAssistant === assistant.id;
          
          return (
            <button
              key={assistant.id}
              onClick={() => onAssistantSelect(assistant.id)}
              onMouseEnter={() => setHoveredAssistant(assistant.id)}
              onMouseLeave={() => setHoveredAssistant(null)}
              className={`w-full p-4 rounded-xl transition-all duration-200 text-right rtl:text-right ltr:text-left group ${
                isSelected
                  ? `bg-gradient-to-r ${assistant.gradient} text-white shadow-lg scale-[1.02]`
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-white/20' 
                    : `bg-gradient-to-br ${assistant.gradient}`
                }`}>
                  <span className={`text-xl ${isSelected ? '' : 'grayscale group-hover:grayscale-0'}`}>
                    {assistant.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 rtl:flex-row-reverse rtl:justify-end">
                    <h3 className={`font-semibold text-sm truncate ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {assistant.nameAr}
                    </h3>
                    {assistant.isActive && (
                      <div className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white/60' : 'bg-green-500'
                      } animate-pulse`} />
                    )}
                  </div>
                  <p className={`text-xs truncate ${
                    isSelected ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {assistant.roleAr}
                  </p>
                  
                  {/* English names on hover */}
                  {(isHovered || isSelected) && (
                    <p className={`text-xs mt-1 truncate ${
                      isSelected ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {assistant.name}
                    </p>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="w-2 h-8 bg-white/40 rounded-full rtl:order-first" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">💡</span>
            <span className="text-xs font-medium text-gray-900">Quick Tip</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Each assistant has specialized knowledge. Switch between them based on your current needs.
          </p>
        </div>
      </div>
    </div>
  );
}
