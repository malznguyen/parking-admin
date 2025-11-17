'use client';

import { useEffect, useRef } from 'react';
import { initializeStores, cleanupStores } from '@/lib/stores';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeStores().catch(console.error);
    }

    return () => {
      cleanupStores();
    };
  }, []);

  return <>{children}</>;
}
