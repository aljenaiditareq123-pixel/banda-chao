'use client';

import { useEffect } from 'react';
import { initEnvChecks } from '@/lib/env-check';

/**
 * Client component to initialize environment checks
 * Must be a client component because env checks use window object
 */
export default function EnvCheckInit() {
  useEffect(() => {
    initEnvChecks();
  }, []);

  // This component doesn't render anything
  return null;
}



