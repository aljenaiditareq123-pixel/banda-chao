'use client';

import { useState, useEffect } from 'react';
import KPIBlock from './KPIBlock';
import SessionList from './SessionList';

interface RightSidebarPanelProps {
  onNewSession: () => void;
}

export default function RightSidebarPanel({ onNewSession }: RightSidebarPanelProps) {
  const [isSessionSummaryOpen, setIsSessionSummaryOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Mock KPI data (replace with real data later)
  const kpiData = [
    {
      label: 'Platform Users',
      value: '1,247',
      change: '+12%',
      trend: 'up' as const,
      icon: '👥'
    },
    {
      label: 'Active Artisans',
      value: '89',
      change: '+8%',
      trend: 'up' as const,
      icon: '🎨'
    },
    {
      label: 'Monthly GMV',
      value: '$45.2K',
      change: '+24%',
      trend: 'up' as const,
      icon: '💰'
    },
    {
      label: 'AI Interactions',
      value: '2,156',
      change: '+67%',
      trend: 'up' as const,
      icon: '🤖'
    }
  ];

  const handleSummarizeSession = async () => {
    setIsGeneratingSummary(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      const mockSummary = `Session Summary - ${new Date().toLocaleDateString('ar-SA')}

Key Discussion Points:
• Strategic planning for Q1 2025
• China market entry analysis
• Product roadmap prioritization
• AI assistant optimization

Decisions Made:
• Focus on Chinese artisan onboarding
• Implement WeChat Pay integration
• Enhance Panda AI capabilities

Next Steps:
• Schedule team meeting for implementation
• Research Chinese e-commerce regulations
• Prepare investor update presentation`;

      setSessionSummary(mockSummary);
      setIsGeneratingSummary(false);
      setIsSessionSummaryOpen(true);
    }, 2000);
  };

  const handleConvertToTodo = () => {
    // Extract actionable items from current session
    const todoItems = [
      'Schedule team meeting for Q1 implementation',
      'Research Chinese e-commerce regulations',
      'Prepare investor update presentation',
      'Contact WeChat Pay integration team',
      'Review Panda AI performance metrics'
    ];

    // In a real app, this would integrate with a TODO system
    console.log('TODO items created:', todoItems);
    
    // Show success notification
    alert(`Created ${todoItems.length} TODO items from current session`);
  };

  const handleSaveSession = async () => {
    // In a real app, this would call the session save API
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Session saved successfully!');
    } catch (error) {
      alert('Failed to save session');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Command Panel
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time insights & actions
        </p>
      </div>

      {/* KPIs Section */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Latest KPIs
        </h3>
        <div className="space-y-3">
          {kpiData.map((kpi, index) => (
            <KPIBlock
              key={index}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={kpi.icon}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleSaveSession}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-lg">💾</span>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">Save Session</p>
              <p className="text-xs opacity-90">Store current conversation</p>
            </div>
          </button>

          <button
            onClick={handleSummarizeSession}
            disabled={isGeneratingSummary}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">
              {isGeneratingSummary ? '⏳' : '📝'}
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">
                {isGeneratingSummary ? 'Generating...' : 'Summarize Session'}
              </p>
              <p className="text-xs opacity-90">AI-powered summary</p>
            </div>
          </button>

          <button
            onClick={handleConvertToTodo}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-lg">✅</span>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">Convert to TODO</p>
              <p className="text-xs opacity-90">Extract action items</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Recent Sessions
        </h3>
        <SessionList limit={5} compact={false} />
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">Today&apos;s Activity</span>
            <span className="font-medium text-gray-900 dark:text-white">12 interactions</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600 dark:text-gray-300">Tokens Used</span>
            <span className="font-medium text-gray-900 dark:text-white">8.2K / 50K</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '16.4%' }} />
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      {isSessionSummaryOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Session Summary
              </h3>
              <button
                onClick={() => setIsSessionSummaryOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {sessionSummary}
              </pre>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsSessionSummaryOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sessionSummary);
                  alert('Summary copied to clipboard!');
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
