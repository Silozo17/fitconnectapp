import React, { createContext, useContext, ReactNode } from 'react';
import { useSimpleAppResume } from '@/hooks/useAppResumeManager';

/**
 * Simplified ResumeManager Context
 * 
 * Previously: Complex priority-based handler system (300+ lines)
 * Now: Simple visibility handler that lets React Query and Supabase do their jobs
 */

interface ResumeManagerContextType {
  // Kept for backward compatibility - these are no-ops now
  registerHandler: (handler: unknown) => void;
  unregisterHandler: (id: string) => void;
}

const ResumeManagerContext = createContext<ResumeManagerContextType | undefined>(undefined);

export function ResumeManagerProvider({ children }: { children: ReactNode }) {
  // This hook handles all resume logic now
  useSimpleAppResume();

  // No-op handlers for backward compatibility
  const value = React.useMemo(() => ({
    registerHandler: () => {},
    unregisterHandler: () => {},
  }), []);

  return (
    <ResumeManagerContext.Provider value={value}>
      {children}
    </ResumeManagerContext.Provider>
  );
}

export function useResumeManager() {
  const context = useContext(ResumeManagerContext);
  if (context === undefined) {
    throw new Error('useResumeManager must be used within a ResumeManagerProvider');
  }
  return context;
}

export function useResumeManagerSafe() {
  return useContext(ResumeManagerContext);
}

/**
 * @deprecated No longer needed - resume is handled centrally
 */
export function useRegisterResumeHandler(_handler: unknown) {
  // No-op for backward compatibility
}
