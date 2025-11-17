'use client';

import { useUIStore } from '@/lib/stores';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GlobalLoading() {
  const globalLoading = useUIStore((state) => state.globalLoading);
  const loadingMessage = useUIStore((state) => state.loadingMessage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !globalLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        {loadingMessage && (
          <p className="text-sm text-gray-600">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
