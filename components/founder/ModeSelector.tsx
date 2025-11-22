'use client';

import { useState } from 'react';

type FounderOperatingMode = 
  | 'STRATEGY_MODE'
  | 'PRODUCT_MODE' 
  | 'TECH_MODE'
  | 'MARKETING_MODE'
  | 'CHINA_MODE';

interface ModeSelectorProps {
  currentMode: FounderOperatingMode;
  onModeChange: (mode: FounderOperatingMode) => void;
  className?: string;
}

export default function ModeSelector({ 
  currentMode, 
  onModeChange, 
  className = '' 
}: ModeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const modeConfigs = {
    STRATEGY_MODE: { 
      label: 'Strategic', 
      icon: '🎯', 
      color: 'from-blue-500 to-blue-600',
      description: 'Long-term planning and vision alignment'
    },
    PRODUCT_MODE: { 
      label: 'Product', 
      icon: '🛠️', 
      color: 'from-green-500 to-green-600',
      description: 'Product development and features'
    },
    TECH_MODE: { 
      label: 'Technical', 
      icon: '💻', 
      color: 'from-purple-500 to-purple-600',
      description: 'Technical architecture and implementation'
    },
    MARKETING_MODE: { 
      label: 'Marketing', 
      icon: '📢', 
      color: 'from-orange-500 to-orange-600',
      description: 'Marketing strategy and content'
    },
    CHINA_MODE: { 
      label: 'China Focus', 
      icon: '🇨🇳', 
      color: 'from-red-500 to-red-600',
      description: 'China market entry and strategy'
    }
  };

  const currentConfig = modeConfigs[currentMode];

  return (
    <div className={`relative ${className}`}>
      {/* Current Mode Display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${currentConfig.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{currentConfig.icon}</span>
          <div className="text-left">
            <p className="font-semibold text-sm">{currentConfig.label} Mode</p>
            <p className="text-xs opacity-90">{currentConfig.description}</p>
          </div>
        </div>
        
        <div className={`transform transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`}>
          <span className="text-lg">⌄</span>
        </div>
      </button>

      {/* Mode Options Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-2">
            {Object.entries(modeConfigs).map(([mode, config]) => {
              const isActive = mode === currentMode;
              
              return (
                <button
                  key={mode}
                  onClick={() => {
                    onModeChange(mode as FounderOperatingMode);
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="text-left flex-1">
                    <p className={`font-medium text-sm ${
                      isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {config.label} Mode
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {config.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Mode Info Footer */}
          <div className="border-t border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              Each mode optimizes Panda AI responses for specific contexts
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
