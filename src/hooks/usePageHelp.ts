import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/storage-keys';

export function usePageHelp(pageKey: string) {
  const storageKey = `${STORAGE_KEYS.PAGE_HELP_PREFIX}${pageKey}`;
  
  const [hasSeen, setHasSeen] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const dismissHelp = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true');
      setHasSeen(true);
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  return { 
    showHelp: !hasSeen, 
    dismissHelp 
  };
}
