'use client';

interface KPIBlockProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export default function KPIBlock({ label, value, change, trend, icon }: KPIBlockProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getTrendIcon()}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          {label}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className={`text-xs font-medium ${getTrendColor()}`}>
          {change}
        </p>
      </div>
      
      {/* Hover effect indicator */}
      <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
}
