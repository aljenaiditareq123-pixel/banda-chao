/**
 * Simple in-memory cache for API responses
 * In production, consider using Redis or similar
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL = 60 * 1000; // 60 seconds

/**
 * Get cached data
 */
export function getCache(key: string): any | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    // Expired
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache data
 */
export function setCache(key: string, data: any, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Invalidate cache by key
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate cache by pattern (simple prefix matching)
 */
export function invalidateCachePattern(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}



