import { useEffect, useRef, useCallback } from 'react';
import { isDespia } from '@/lib/despia';

/**
 * Priority levels for resume handlers
 * Lower number = higher priority = runs first
 */
export type ResumePriority = 'immediate' | 'fast' | 'background';

const PRIORITY_ORDER: Record<ResumePriority, number> = {
  immediate: 0,
  fast: 1,
  background: 2,
};

/**
 * Delays for background tasks (staggered to prevent network congestion)
 */
const BACKGROUND_DELAYS: Record<string, number> = {
  session: 0,           // Immediate
  viewRestore: 100,     // 100ms after session
  subscription: 3000,   // 3s after resume
  boost: 4000,          // 4s after resume
  wearable: 5000,       // 5s after resume
  sessionActivity: 6000, // 6s after resume (web only)
};

export interface ResumeHandler {
  id: string;
  priority: ResumePriority;
  handler: () => void | Promise<void>;
  /** Optional delay in ms for background tasks */
  delay?: number;
  /** If true, only runs on web (not native) */
  webOnly?: boolean;
  /** If true, only runs on native (Despia) */
  nativeOnly?: boolean;
}

interface ResumeManagerState {
  handlers: Map<string, ResumeHandler>;
  isHandlingResume: boolean;
  lastResumeTime: number;
}

// Global debounce - minimum time between resume handling
const RESUME_DEBOUNCE_MS = 2000;

// Focus debounce for native apps
const FOCUS_DEBOUNCE_MS = 1000;

/**
 * Unified App Resume Manager
 * 
 * Centralizes all visibility/focus event handling into a single, coordinated system.
 * This eliminates parallel resume handlers firing simultaneously and prevents
 * network congestion on app resume.
 * 
 * Features:
 * - Single event listener for visibility and focus
 * - Global 2-second debounce across all handlers
 * - Priority-based execution order
 * - Staggered background task execution
 */
export function useAppResumeManager() {
  const stateRef = useRef<ResumeManagerState>({
    handlers: new Map(),
    isHandlingResume: false,
    lastResumeTime: 0,
  });
  
  const focusDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * Register a resume handler
   */
  const registerHandler = useCallback((handler: ResumeHandler) => {
    stateRef.current.handlers.set(handler.id, handler);
    console.log(`[ResumeManager] Registered handler: ${handler.id} (priority: ${handler.priority})`);
  }, []);

  /**
   * Unregister a resume handler
   */
  const unregisterHandler = useCallback((id: string) => {
    stateRef.current.handlers.delete(id);
    console.log(`[ResumeManager] Unregistered handler: ${id}`);
  }, []);

  /**
   * Execute all registered handlers in priority order
   */
  const executeHandlers = useCallback(async () => {
    const state = stateRef.current;
    const isNative = isDespia();
    
    // Guard: prevent concurrent handling
    if (state.isHandlingResume) {
      console.log('[ResumeManager] Already handling resume, skipping');
      return;
    }
    
    // Debounce: check if we recently handled a resume
    const now = Date.now();
    if (now - state.lastResumeTime < RESUME_DEBOUNCE_MS) {
      console.log('[ResumeManager] Resume debounce active, skipping');
      return;
    }
    
    state.isHandlingResume = true;
    state.lastResumeTime = now;
    
    console.log('[ResumeManager] Executing resume handlers...');
    
    // Clear any pending background timeouts
    backgroundTimeoutsRef.current.forEach(t => clearTimeout(t));
    backgroundTimeoutsRef.current = [];
    
    // Sort handlers by priority
    const handlers = Array.from(state.handlers.values())
      .filter(h => {
        // Filter by platform requirements
        if (h.webOnly && isNative) return false;
        if (h.nativeOnly && !isNative) return false;
        return true;
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    
    // Execute immediate and fast handlers synchronously
    for (const h of handlers) {
      if (h.priority === 'immediate' || h.priority === 'fast') {
        const delay = h.delay || (h.priority === 'fast' ? 100 : 0);
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        try {
          console.log(`[ResumeManager] Running ${h.id} (${h.priority})`);
          await h.handler();
        } catch (error) {
          console.error(`[ResumeManager] Handler ${h.id} failed:`, error);
        }
      }
    }
    
    // Schedule background handlers with staggered delays
    for (const h of handlers) {
      if (h.priority === 'background') {
        const delay = h.delay || BACKGROUND_DELAYS[h.id] || 3000;
        
        const timeout = setTimeout(async () => {
          try {
            console.log(`[ResumeManager] Running ${h.id} (background, delayed ${delay}ms)`);
            await h.handler();
          } catch (error) {
            console.error(`[ResumeManager] Handler ${h.id} failed:`, error);
          }
        }, delay);
        
        backgroundTimeoutsRef.current.push(timeout);
      }
    }
    
    // Reset guard after a short delay to allow for event settling
    setTimeout(() => {
      state.isHandlingResume = false;
    }, 100);
  }, []);

  /**
   * Handle visibility change event
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.log('[ResumeManager] Visibility changed to visible');
      executeHandlers();
    }
  }, [executeHandlers]);

  /**
   * Handle focus event (debounced for native apps)
   */
  const handleFocus = useCallback(() => {
    // Focus handler is primarily for Despia native
    if (!isDespia()) return;
    
    // Clear existing debounce timer
    if (focusDebounceRef.current) {
      clearTimeout(focusDebounceRef.current);
    }
    
    // Debounce to prevent rapid successive calls
    focusDebounceRef.current = setTimeout(() => {
      console.log('[ResumeManager] Focus event (native)');
      executeHandlers();
    }, FOCUS_DEBOUNCE_MS);
  }, [executeHandlers]);

  // Set up global event listeners
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
      
      backgroundTimeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [handleVisibilityChange, handleFocus]);

  return {
    registerHandler,
    unregisterHandler,
  };
}

export { BACKGROUND_DELAYS };
