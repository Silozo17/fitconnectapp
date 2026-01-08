import { supabase } from "@/integrations/supabase/client";

type DebugEventType = 'navigation' | 'auth' | 'render' | 'click' | 'error' | 'state' | 'query' | 'lifecycle';

interface DebugLogEvent {
  eventType: DebugEventType;
  eventName: string;
  eventData?: Record<string, unknown>;
  component?: string;
  route?: string;
}

// Generate unique session ID for this page load
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Buffer logs to batch insert (performance optimization)
let logBuffer: (DebugLogEvent & { timestamp: string })[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
let isFlushingInProgress = false;

// Check if debug mode is enabled
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  // ENABLED BY DEFAULT - set localStorage.debug_logging_disabled = 'true' to disable
  return localStorage.getItem('debug_logging_disabled') !== 'true';
};

// Get current route safely
const getCurrentRoute = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname + window.location.search;
};

// Flush buffered logs to Supabase
const flushLogs = async () => {
  if (logBuffer.length === 0 || isFlushingInProgress) return;
  
  isFlushingInProgress = true;
  const logsToFlush = [...logBuffer];
  logBuffer = [];
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logs = logsToFlush.map(log => ({
      user_id: user?.id || null,
      session_id: SESSION_ID,
      event_type: log.eventType,
      event_name: log.eventName,
      event_data: JSON.parse(JSON.stringify(log.eventData || {})), // Ensure JSON-serializable
      component: log.component || null,
      route: log.route || getCurrentRoute(),
      timestamp: log.timestamp,
    }));
    
    const { error } = await supabase.from('user_debug_logs').insert(logs);
    
    if (error) {
      console.warn('[DebugLogger] Failed to flush logs to DB:', error.message);
    }
  } catch (error) {
    console.warn('[DebugLogger] Failed to flush logs:', error);
  } finally {
    isFlushingInProgress = false;
  }
};

// Queue a log event (batched for performance)
export const logDebugEvent = (event: DebugLogEvent) => {
  if (!isDebugEnabled()) return;
  
  const timestamp = new Date().toISOString();
  const route = event.route || getCurrentRoute();
  
  // Always log to console for immediate visibility
  const prefix = event.component ? `[${event.component}]` : '';
  console.log(
    `%c[Debug] ${event.eventType}${prefix}: ${event.eventName}`,
    getLogColor(event.eventType),
    { ...event.eventData, route, timestamp }
  );
  
  logBuffer.push({ ...event, route, timestamp });
  
  // Flush after 1000ms of no new events (debounce)
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushLogs, 1000);
  
  // Also flush if buffer is getting large
  if (logBuffer.length >= 20) {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushLogs();
  }
};

// Color coding for different event types
const getLogColor = (eventType: DebugEventType): string => {
  switch (eventType) {
    case 'navigation': return 'color: #3b82f6; font-weight: bold;'; // blue
    case 'auth': return 'color: #10b981; font-weight: bold;'; // green
    case 'render': return 'color: #8b5cf6; font-weight: bold;'; // purple
    case 'error': return 'color: #ef4444; font-weight: bold;'; // red
    case 'state': return 'color: #f59e0b; font-weight: bold;'; // amber
    case 'query': return 'color: #06b6d4; font-weight: bold;'; // cyan
    case 'lifecycle': return 'color: #ec4899; font-weight: bold;'; // pink
    default: return 'color: #6b7280; font-weight: bold;'; // gray
  }
};

// Convenience methods
export const debugLogger = {
  // Navigation events
  navigation: (from: string, to: string, data?: Record<string, unknown>) => 
    logDebugEvent({ 
      eventType: 'navigation', 
      eventName: `${from} → ${to}`,
      eventData: data 
    }),
  
  // Auth events
  auth: (eventName: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'auth', eventName, eventData: data }),
  
  // Component render/mount events
  render: (component: string, eventName: string = 'mount', data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'render', eventName, component, eventData: data }),
  
  // State changes
  state: (component: string, stateName: string, value: unknown, prevValue?: unknown) =>
    logDebugEvent({ 
      eventType: 'state', 
      eventName: stateName, 
      component, 
      eventData: { value, prevValue } 
    }),
  
  // Click events
  click: (target: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'click', eventName: target, eventData: data }),
  
  // Error events
  error: (message: string, error?: unknown, component?: string) =>
    logDebugEvent({ 
      eventType: 'error', 
      eventName: message, 
      component,
      eventData: { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      } 
    }),
  
  // Query events (React Query, Supabase, etc.)
  query: (queryKey: string, status: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'query', eventName: queryKey, eventData: { status, ...data } }),
  
  // Lifecycle events (effects, cleanup, etc.)
  lifecycle: (component: string, eventName: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'lifecycle', eventName, component, eventData: data }),
    
  // Force immediate flush (useful before navigation/unload)
  flush: flushLogs,
  
  // Toggle logging
  disable: () => {
    localStorage.setItem('debug_logging_disabled', 'true');
    console.log('%c[DebugLogger] Disabled', 'color: #ef4444;');
  },
  enable: () => {
    localStorage.removeItem('debug_logging_disabled');
    console.log('%c[DebugLogger] Enabled', 'color: #10b981;');
  },
  isEnabled: isDebugEnabled,
  
  // Get session ID for reference
  getSessionId: () => SESSION_ID,
};

// Flush logs before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (logBuffer.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      const user = supabase.auth.getUser();
      // Note: We can't await here, so logs may be lost on unload
      flushLogs();
    }
  });
  
  // Log initial page load
  if (isDebugEnabled()) {
    logDebugEvent({
      eventType: 'lifecycle',
      eventName: 'page_load',
      eventData: {
        sessionId: SESSION_ID,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }
    });
  }
}

export default debugLogger;
