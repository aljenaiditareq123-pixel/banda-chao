/**
 * Performance Optimization Utilities
 * Provides tools for improving app performance
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Debounce hook for performance optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for performance optimization
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// LazyImage component moved to components/ui/LazyImage.tsx

// memo function is available directly from React

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
      this.marks.set(name, Date.now());
    }
  }

  static measure(name: string, startMark: string, endMark?: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      const endMarkName = endMark || `${startMark}-end`;
      window.performance.mark(endMarkName);
      
      try {
        window.performance.measure(name, startMark, endMarkName);
        const entries = window.performance.getEntriesByName(name, 'measure');
        return entries[entries.length - 1]?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }

    // Fallback for environments without performance API
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark || `${startMark}-end`) || Date.now();
    return startTime ? endTime - startTime : 0;
  }

  static clearMarks(name?: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      if (name) {
        window.performance.clearMarks(name);
        this.marks.delete(name);
      } else {
        window.performance.clearMarks();
        this.marks.clear();
      }
    }
  }

  static getNavigationTiming(): PerformanceNavigationTiming | null {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    }
    return null;
  }

  static logPageLoadMetrics(): void {
    if (typeof window === 'undefined') return;

    const navigation = this.getNavigationTiming();
    if (!navigation) return;

    const metrics = {
      'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'TCP Connection': navigation.connectEnd - navigation.connectStart,
      'Request': navigation.responseStart - navigation.requestStart,
      'Response': navigation.responseEnd - navigation.responseStart,
      'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
      'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
      'Total Load Time': navigation.loadEventEnd - navigation.fetchStart,
    };

    console.group('📊 Page Load Performance Metrics');
    Object.entries(metrics).forEach(([name, duration]) => {
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // This would integrate with webpack-bundle-analyzer or similar
  console.log('📦 Bundle analysis available in development mode');
}

/**
 * Memory usage monitor
 */
export function useMemoryMonitor(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (typeof window !== 'undefined' && 'memory' in window.performance) {
        const memory = (window.performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// lazy function is available directly from React
