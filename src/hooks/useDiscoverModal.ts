import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'fitconnect_discover_seen_';

export function useDiscoverModal(role: 'client' | 'coach') {
  const storageKey = `${STORAGE_KEY_PREFIX}${role}`;
  
  const [hasSeen, setHasSeen] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const markAsSeen = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true');
      setHasSeen(true);
    } catch {
      // localStorage not available
    }
  }, [storageKey]);

  return { 
    shouldShow: !hasSeen, 
    markAsSeen 
  };
}
