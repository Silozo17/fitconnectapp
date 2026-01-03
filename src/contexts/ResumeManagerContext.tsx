import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useAppResumeManager, ResumeHandler } from '@/hooks/useAppResumeManager';

interface ResumeManagerContextType {
  /**
   * Register a handler to be called when the app resumes from background
   */
  registerHandler: (handler: ResumeHandler) => void;
  /**
   * Unregister a previously registered handler
   */
  unregisterHandler: (id: string) => void;
}

const ResumeManagerContext = createContext<ResumeManagerContextType | undefined>(undefined);

/**
 * ResumeManagerProvider
 * 
 * Provides centralized app resume handling to the entire application.
 * Place this provider high in the component tree, after AuthProvider.
 * 
 * Benefits:
 * - Single visibility/focus listener instead of 6+ separate ones
 * - Global 2-second debounce prevents rapid-fire handling
 * - Priority-based execution (immediate → fast → background)
 * - Staggered background tasks prevent network congestion
 */
export function ResumeManagerProvider({ children }: { children: ReactNode }) {
  const { registerHandler, unregisterHandler } = useAppResumeManager();

  const value = React.useMemo(() => ({
    registerHandler,
    unregisterHandler,
  }), [registerHandler, unregisterHandler]);

  return (
    <ResumeManagerContext.Provider value={value}>
      {children}
    </ResumeManagerContext.Provider>
  );
}

/**
 * Hook to access the resume manager context
 */
export function useResumeManager() {
  const context = useContext(ResumeManagerContext);
  if (context === undefined) {
    throw new Error('useResumeManager must be used within a ResumeManagerProvider');
  }
  return context;
}

/**
 * Safe version that returns undefined outside provider
 */
export function useResumeManagerSafe() {
  return useContext(ResumeManagerContext);
}

/**
 * Hook to easily register a resume handler with automatic cleanup
 */
export function useRegisterResumeHandler(handler: ResumeHandler | null) {
  const manager = useResumeManagerSafe();
  
  useEffect(() => {
    if (!manager || !handler) return;
    
    manager.registerHandler(handler);
    
    return () => {
      manager.unregisterHandler(handler.id);
    };
  }, [manager, handler?.id, handler?.priority, handler?.delay]);
}
