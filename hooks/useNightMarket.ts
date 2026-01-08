'use client';

import { useState, useEffect } from 'react';
import { useMounted } from './useMounted';

/**
 * Hook to detect if current time is between 8 PM and 6 AM (Night Market hours)
 * Returns true if it's night market time, false otherwise
 * 
 * CRITICAL: Uses useMounted to prevent hydration mismatch
 */
export function useNightMarket(): {
  isNightMarket: boolean;
  currentHour: number;
  timeUntilNextChange: number; // milliseconds until next day/night transition
} {
  const mounted = useMounted();
  const [isNightMarket, setIsNightMarket] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [timeUntilNextChange, setTimeUntilNextChange] = useState(0);

  useEffect(() => {
    // Only run after mount to prevent hydration mismatch
    if (!mounted) return;

    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentHour(hour);

      // Night Market: 8 PM (20:00) to 6 AM (06:00)
      // This spans across midnight, so we check:
      // hour >= 20 OR hour < 6
      const isNight = hour >= 20 || hour < 6;
      setIsNightMarket(isNight);

      // Calculate time until next transition
      const next = new Date(now);
      if (isNight) {
        // Currently night, next transition is at 6 AM
        if (hour >= 20) {
          // It's between 8 PM and midnight, next change is 6 AM tomorrow
          next.setDate(next.getDate() + 1);
          next.setHours(6, 0, 0, 0);
        } else {
          // It's between midnight and 6 AM, next change is 6 AM today
          next.setHours(6, 0, 0, 0);
        }
      } else {
        // Currently day, next transition is at 8 PM today
        next.setHours(20, 0, 0, 0);
      }

      const msUntilChange = next.getTime() - now.getTime();
      setTimeUntilNextChange(msUntilChange);
    };

    // Check immediately after mount
    checkTime();

    // Update every minute to catch transitions
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [mounted]);

  return { isNightMarket, currentHour, timeUntilNextChange };
}
