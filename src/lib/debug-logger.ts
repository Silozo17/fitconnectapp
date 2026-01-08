import { supabase } from "@/integrations/supabase/client";

type DebugEventType = 
  | 'navigation' 
  | 'auth' 
  | 'render' 
  | 'click' 
  | 'error' 
  | 'state' 
  | 'query' 
  | 'lifecycle'
  | 'fetch'       // API/network requests
  | 'interaction' // User interactions (scroll, focus, input)
  | 'performance' // Performance metrics
  | 'mutation'    // Data mutations
  // NEW event types
  | 'toast'       // User-facing notifications
  | 'modal'       // Dialog open/close events
  | 'storage'     // localStorage/sessionStorage operations
  | 'subscription' // Real-time subscriptions
  | 'payment'     // Payment-related events
  | 'ai'          // AI feature usage
  | 'media'       // File upload/download
  | 'booking'     // Session/booking events
  | 'onboarding'  // Onboarding flow tracking
  | 'cache';      // Query cache events

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
    case 'fetch': return 'color: #6366f1; font-weight: bold;'; // indigo
    case 'interaction': return 'color: #14b8a6; font-weight: bold;'; // teal
    case 'performance': return 'color: #eab308; font-weight: bold;'; // yellow
    case 'mutation': return 'color: #f43f5e; font-weight: bold;'; // rose
    // NEW event type colors
    case 'toast': return 'color: #22c55e; font-weight: bold;'; // green-500
    case 'modal': return 'color: #a855f7; font-weight: bold;'; // purple-500
    case 'storage': return 'color: #64748b; font-weight: bold;'; // slate-500
    case 'subscription': return 'color: #0ea5e9; font-weight: bold;'; // sky-500
    case 'payment': return 'color: #84cc16; font-weight: bold;'; // lime-500
    case 'ai': return 'color: #d946ef; font-weight: bold;'; // fuchsia-500
    case 'media': return 'color: #f97316; font-weight: bold;'; // orange-500
    case 'booking': return 'color: #06b6d4; font-weight: bold;'; // cyan-500
    case 'onboarding': return 'color: #8b5cf6; font-weight: bold;'; // violet-500
    case 'cache': return 'color: #78716c; font-weight: bold;'; // stone-500
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

  // Fetch/API events
  fetch: (url: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'fetch', eventName: url, eventData: data }),

  // User interaction events (scroll, focus, input)
  interaction: (action: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'interaction', eventName: action, eventData: data }),

  // Performance metrics
  performance: (metric: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'performance', eventName: metric, eventData: data }),

  // Data mutation events
  mutation: (table: string, operation: string, data?: Record<string, unknown>) =>
    logDebugEvent({ eventType: 'mutation', eventName: `${table}:${operation}`, eventData: data }),

  // ========== NEW METHODS ==========

  // Toast notification events
  toast: (type: 'success' | 'error' | 'info' | 'warning', message: string, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'toast', 
      eventName: `${type}: ${message.slice(0, 50)}`,
      eventData: { type, message, ...data }
    }),

  // Modal/Dialog events
  modal: (name: string, action: 'open' | 'close' | 'confirm' | 'cancel', data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'modal', 
      eventName: `${name}:${action}`,
      eventData: { name, action, ...data }
    }),

  // Storage events (localStorage/sessionStorage)
  storage: (key: string, action: 'get' | 'set' | 'remove', data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'storage', 
      eventName: `${action}:${key}`,
      eventData: { key, action, ...data }
    }),

  // Real-time subscription events
  subscription: (channel: string, event: 'subscribe' | 'unsubscribe' | 'message' | 'error', data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'subscription', 
      eventName: `${channel}:${event}`,
      eventData: { channel, event, ...data }
    }),

  // Payment events
  payment: (action: string, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'payment', 
      eventName: action,
      eventData: data
    }),

  // AI feature usage
  ai: (feature: string, status: 'start' | 'success' | 'error', data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'ai', 
      eventName: `${feature}:${status}`,
      eventData: { feature, status, ...data }
    }),

  // Media/file events
  media: (action: 'upload' | 'download' | 'delete' | 'view', fileType: string, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'media', 
      eventName: `${action}:${fileType}`,
      eventData: { action, fileType, ...data }
    }),

  // Booking/session events
  booking: (action: string, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'booking', 
      eventName: action,
      eventData: data
    }),

  // Onboarding flow events
  onboarding: (step: string, action: 'enter' | 'complete' | 'skip' | 'error', data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'onboarding', 
      eventName: `${step}:${action}`,
      eventData: { step, action, ...data }
    }),

  // Cache events (query cache hits/misses)
  cache: (key: string, hit: boolean, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'cache', 
      eventName: `${hit ? 'hit' : 'miss'}:${key}`,
      eventData: { key, hit, ...data }
    }),

  // View/profile switching (for AdminContext)
  viewSwitch: (fromView: string, toView: string, data?: Record<string, unknown>) =>
    logDebugEvent({ 
      eventType: 'state', 
      eventName: `view_switch:${fromView}→${toView}`,
      component: 'AdminContext',
      eventData: { fromView, toView, ...data }
    }),
    
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