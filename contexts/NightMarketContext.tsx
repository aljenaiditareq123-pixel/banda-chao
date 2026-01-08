'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNightMarket } from '@/hooks/useNightMarket';
import { useMounted } from '@/hooks/useMounted';

interface NightMarketContextType {
  isNightMarket: boolean;
  currentHour: number;
  timeUntilNextChange: number;
  toggleNightMarket?: () => void; // For manual override (optional)
}

const NightMarketContext = createContext<NightMarketContextType | undefined>(undefined);

export function NightMarketProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const { isNightMarket, currentHour, timeUntilNextChange } = useNightMarket();
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Apply theme class to document (only after mount to prevent hydration mismatch)
  useEffect(() => {
    if (!mounted) return;

    const isActive = manualOverride !== null ? manualOverride : isNightMarket;
    
    if (isActive) {
      document.documentElement.classList.add('night-market');
      document.body.classList.add('night-market');
    } else {
      document.documentElement.classList.remove('night-market');
      document.body.classList.remove('night-market');
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('night-market');
      document.body.classList.remove('night-market');
    };
  }, [mounted, isNightMarket, manualOverride]);

  const toggleNightMarket = () => {
    setManualOverride((prev) => {
      if (prev === null) {
        // First manual toggle - override to opposite of current
        return !isNightMarket;
      } else {
        // Toggle the override
        return !prev;
      }
    });
  };

  const value: NightMarketContextType = {
    isNightMarket: manualOverride !== null ? manualOverride : isNightMarket,
    currentHour,
    timeUntilNextChange,
    toggleNightMarket,
  };

  return (
    <NightMarketContext.Provider value={value}>
      {children}
    </NightMarketContext.Provider>
  );
}

export function useNightMarketContext(): NightMarketContextType {
  const context = useContext(NightMarketContext);
  if (context === undefined) {
    throw new Error('useNightMarketContext must be used within a NightMarketProvider');
  }
  return context;
}
