/**
 * Loading Card Component
 * Provides consistent loading states for cards and content areas
 */

interface LoadingCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingCard({ 
  className = '', 
  showAvatar = false, 
  lines = 3,
  height = 'md'
}: LoadingCardProps) {
  const heightClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-64'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index}>
            <div 
              className={`h-4 bg-gray-300 rounded ${
                index === lines - 1 ? 'w-2/3' : 'w-full'
              }`}
            ></div>
          </div>
        ))}
      </div>
      
      {height !== 'sm' && (
        <div className={`mt-4 ${heightClasses[height]} bg-gray-200 rounded`}></div>
      )}
    </div>
  );
}

/**
 * Loading Grid Component
 * Shows multiple loading cards in a grid layout
 */
interface LoadingGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingGrid({ 
  count = 6, 
  columns = 3, 
  showAvatar = false,
  className = ''
}: LoadingGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} showAvatar={showAvatar} />
      ))}
    </div>
  );
}

/**
 * Loading List Component
 * Shows loading state for list items
 */
interface LoadingListProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingList({ 
  count = 5, 
  showAvatar = true,
  className = ''
}: LoadingListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {showAvatar && (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
            )}
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading Stats Component
 * Shows loading state for statistics cards
 */
interface LoadingStatsProps {
  count?: number;
  className?: string;
}

export function LoadingStats({ count = 4, className = '' }: LoadingStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
