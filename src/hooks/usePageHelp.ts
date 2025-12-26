import { useState, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'fitconnect_page_help_';

export function usePageHelp(pageKey: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${pageKey}`;
  
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
