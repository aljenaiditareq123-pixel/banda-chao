'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if component has mounted on the client
 * Prevents hydration mismatches by ensuring server and client render the same initial HTML
 * 
 * @returns {boolean} true if component has mounted, false otherwise
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *   
 *   if (!mounted) {
 *     return <div>Loading...</div>; // Server and client both render this
 *   }
 *   
 *   // Safe to access window, localStorage, etc. here
 *   const value = localStorage.getItem('key');
 *   return <div>{value}</div>;
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
