/**
 * Performance Logger - Dev-only instrumentation for measuring app performance
 * 
 * Measures:
 * - Route navigation time
 * - React Query request duration
 * - Supabase RPC timing
 * - Provider initialization
 * - Auth state changes
 * - Realtime subscriptions
 * - Visibility/focus events
 * 
 * IMPORTANT: Only active when VITE_PERF_DEBUG=true
 * Does NOT log sensitive data (tokens, emails, health metrics, payment details)
 */

// Check if performance debugging is enabled
const isEnabled = (): boolean => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_PERF_DEBUG === 'true' && import.meta.env.DEV;
  }
  return false;
};

// Performance metrics storage
interface PerformanceMetric {
  type: 'navigation' | 'query' | 'rpc' | 'chunk' | 'startup' | 'auth' | 'provider' | 'realtime' | 'visibility' | 'api';
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

// Timeline event for sequential logging
interface TimelineEvent {
  timestamp: number;        // ms from app start
  event: string;            // event name
  duration?: number;        // for end events
  metadata?: Record<string, string | number | boolean>;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 200;

// Active timers for tracking ongoing operations
const activeTimers = new Map<string, number>();

// Timeline for sequential event logging
const timeline: TimelineEvent[] = [];
let appStartTime: number = 0;

// Event counters for tracking frequency
const eventCounters: Record<string, number> = {};

// Session ID for grouping logs
const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Initialize the logger and record app start time
 */
export const initLogger = (): void => {
  if (!isEnabled()) return;
  appStartTime = performance.now();
  
  // Expose on window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__PERF_LOGS__ = timeline;
    (window as any).__PERF_TIMELINE__ = printTimeline;
    (window as any).__PERF_SUMMARY__ = getSummary;
    (window as any).__PERF_COUNTERS__ = eventCounters;
    (window as any).__PERF_SESSION__ = sessionId;
  }
  
  logEvent('app_start', { sessionId });
};

/**
 * Get time since app start
 */
const getTimeFromStart = (): number => {
  if (appStartTime === 0) {
    appStartTime = performance.now();
  }
  return performance.now() - appStartTime;
};

/**
 * Log a timeline event
 */
export const logEvent = (
  event: string, 
  metadata?: Record<string, string | number | boolean>
): void => {
  if (!isEnabled()) return;
  
  const timestamp = Math.round(getTimeFromStart());
  
  const timelineEvent: TimelineEvent = {
    timestamp,
    event,
    metadata,
  };
  
  timeline.push(timelineEvent);
  
  // Also log to console with formatting
  const emoji = getEventEmoji(event);
  console.log(
    `%c${emoji} [PERF][${timestamp}ms] ${event}`,
    'color: #8b5cf6; font-weight: bold;',
    metadata || ''
  );
};

/**
 * Log a timed event (start + end)
 */
export const logTimedEvent = (
  event: string,
  duration: number,
  metadata?: Record<string, string | number | boolean>
): void => {
  if (!isEnabled()) return;
  
  const timestamp = Math.round(getTimeFromStart());
  
  const timelineEvent: TimelineEvent = {
    timestamp,
    event,
    duration: Math.round(duration),
    metadata,
  };
  
  timeline.push(timelineEvent);
  
  const emoji = getEventEmoji(event);
  const color = getColor(duration);
  console.log(
    `%c${emoji} [PERF][${timestamp}ms] ${event} (${Math.round(duration)}ms)`,
    `color: ${color}; font-weight: bold;`,
    metadata || ''
  );
};

/**
 * Increment an event counter
 */
export const incrementCounter = (counterName: string): number => {
  if (!isEnabled()) return 0;
  
  eventCounters[counterName] = (eventCounters[counterName] || 0) + 1;
  return eventCounters[counterName];
};

/**
 * Start timing an operation
 */
export const startTiming = (type: PerformanceMetric['type'], name: string): string => {
  if (!isEnabled()) return '';
  
  const id = `${type}:${name}:${Date.now()}`;
  activeTimers.set(id, performance.now());
  
  // Log the start event
  logEvent(`${name}_start`, { type });
  
  return id;
};

/**
 * End timing and record the metric
 */
export const endTiming = (
  id: string, 
  metadata?: Record<string, string | number | boolean>
): number => {
  if (!isEnabled() || !id) return 0;
  
  const startTime = activeTimers.get(id);
  if (!startTime) return 0;
  
  const duration = performance.now() - startTime;
  activeTimers.delete(id);
  
  const [type, name] = id.split(':') as [PerformanceMetric['type'], string];
  
  const metric: PerformanceMetric = {
    type,
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  };
  
  metrics.push(metric);
  
  // Keep only recent metrics
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
  
  // Log the end event with duration
  logTimedEvent(`${name}_end`, duration, metadata);
  
  return duration;
};

/**
 * Log a navigation event
 */
export const logNavigation = (from: string, to: string, duration: number): void => {
  if (!isEnabled()) return;
  
  // Sanitize paths - remove IDs and sensitive params
  const sanitizedFrom = sanitizePath(from);
  const sanitizedTo = sanitizePath(to);
  
  const metric: PerformanceMetric = {
    type: 'navigation',
    name: `${sanitizedFrom} → ${sanitizedTo}`,
    duration,
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  
  logTimedEvent(`navigation: ${sanitizedFrom} → ${sanitizedTo}`, duration);
};

/**
 * Log a React Query request
 */
export const logQuery = (queryKey: string, duration: number, status: 'success' | 'error'): void => {
  if (!isEnabled()) return;
  
  // Sanitize query key - remove user IDs
  const sanitizedKey = sanitizeQueryKey(queryKey);
  
  const metric: PerformanceMetric = {
    type: 'query',
    name: sanitizedKey,
    duration,
    timestamp: Date.now(),
    metadata: { status },
  };
  
  metrics.push(metric);
  
  logTimedEvent(`query: ${sanitizedKey}`, duration, { status });
};

/**
 * Log a Supabase RPC call
 */
export const logRPC = (rpcName: string, duration: number): void => {
  if (!isEnabled()) return;
  
  const metric: PerformanceMetric = {
    type: 'rpc',
    name: rpcName,
    duration,
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  
  logTimedEvent(`rpc: ${rpcName}`, duration);
};

/**
 * Log a chunk load (dynamic import)
 */
export const logChunkLoad = (chunkName: string, duration: number): void => {
  if (!isEnabled()) return;
  
  const metric: PerformanceMetric = {
    type: 'chunk',
    name: chunkName,
    duration,
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  
  logTimedEvent(`chunk: ${chunkName}`, duration);
};

/**
 * Log an API call
 */
export const logApiCall = (
  table: string, 
  operation: string, 
  duration: number,
  metadata?: Record<string, string | number | boolean>
): void => {
  if (!isEnabled()) return;
  
  const metric: PerformanceMetric = {
    type: 'api',
    name: `${table}.${operation}`,
    duration,
    timestamp: Date.now(),
    metadata,
  };
  
  metrics.push(metric);
  
  logTimedEvent(`api: ${table}.${operation}`, duration, metadata);
};

/**
 * Log a visibility change event
 */
export const logVisibilityChange = (state: 'visible' | 'hidden', source: string): void => {
  if (!isEnabled()) return;
  
  const count = incrementCounter(`visibility_${state}`);
  logEvent(`visibility_${state}`, { source, count });
};

/**
 * Log a focus event
 */
export const logFocusEvent = (source: string): void => {
  if (!isEnabled()) return;
  
  const count = incrementCounter('focus_event');
  logEvent('focus_event', { source, count });
};

/**
 * Log a realtime subscription
 */
export const logRealtimeSubscribe = (channelName: string): void => {
  if (!isEnabled()) return;
  
  const count = incrementCounter('realtime_subscribe');
  logEvent('realtime_subscribe', { channel: sanitizePath(channelName), count });
};

/**
 * Log when realtime is ready
 */
export const logRealtimeReady = (channelName: string): void => {
  if (!isEnabled()) return;
  
  logEvent('realtime_ready', { channel: sanitizePath(channelName) });
};

/**
 * Get all metrics (for debugging)
 */
export const getMetrics = (): PerformanceMetric[] => {
  return [...metrics];
};

/**
 * Get the timeline (for debugging)
 */
export const getTimeline = (): TimelineEvent[] => {
  return [...timeline];
};

/**
 * Get event counters
 */
export const getCounters = (): Record<string, number> => {
  return { ...eventCounters };
};

/**
 * Get summary statistics
 */
export const getSummary = (): Record<string, { count: number; avgDuration: number; maxDuration: number }> => {
  const summary: Record<string, { count: number; totalDuration: number; maxDuration: number }> = {};
  
  for (const metric of metrics) {
    if (!summary[metric.type]) {
      summary[metric.type] = { count: 0, totalDuration: 0, maxDuration: 0 };
    }
    summary[metric.type].count++;
    summary[metric.type].totalDuration += metric.duration;
    summary[metric.type].maxDuration = Math.max(summary[metric.type].maxDuration, metric.duration);
  }
  
  return Object.fromEntries(
    Object.entries(summary).map(([type, data]) => [
      type,
      {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
        maxDuration: data.maxDuration,
      },
    ])
  );
};

/**
 * Print timeline to console in readable format
 */
export const printTimeline = (): void => {
  console.log('\n%c📊 PERFORMANCE TIMELINE', 'font-size: 16px; font-weight: bold; color: #8b5cf6;');
  console.log(`%cSession: ${sessionId}`, 'color: #6b7280;');
  console.log('━'.repeat(60));
  
  for (const event of timeline) {
    const durationStr = event.duration ? ` (${event.duration}ms)` : '';
    const metaStr = event.metadata ? ` ${JSON.stringify(event.metadata)}` : '';
    console.log(`[${event.timestamp}ms] ${event.event}${durationStr}${metaStr}`);
  }
  
  console.log('━'.repeat(60));
  console.log('\n%c📈 EVENT COUNTERS', 'font-size: 14px; font-weight: bold; color: #8b5cf6;');
  console.table(eventCounters);
  
  console.log('\n%c📊 SUMMARY BY TYPE', 'font-size: 14px; font-weight: bold; color: #8b5cf6;');
  console.table(getSummary());
};

/**
 * Clear all metrics
 */
export const clearMetrics = (): void => {
  metrics.length = 0;
  timeline.length = 0;
  activeTimers.clear();
  Object.keys(eventCounters).forEach(key => delete eventCounters[key]);
};

// Helper functions

const getEventEmoji = (event: string): string => {
  if (event.includes('app_start')) return '🚀';
  if (event.includes('auth')) return '🔐';
  if (event.includes('provider') || event.includes('context')) return '📦';
  if (event.includes('navigation') || event.includes('route')) return '🧭';
  if (event.includes('query') || event.includes('api')) return '📊';
  if (event.includes('rpc')) return '⚡';
  if (event.includes('realtime')) return '📡';
  if (event.includes('visibility') || event.includes('focus')) return '👁️';
  if (event.includes('push')) return '🔔';
  if (event.includes('dashboard') || event.includes('layout')) return '🏠';
  if (event.includes('badge')) return '🔢';
  if (event.includes('admin')) return '👤';
  return '📈';
};

const getColor = (duration: number): string => {
  if (duration < 100) return '#22c55e'; // Green - fast
  if (duration < 300) return '#eab308'; // Yellow - acceptable
  if (duration < 500) return '#f97316'; // Orange - slow
  return '#ef4444'; // Red - very slow
};

const sanitizePath = (path: string): string => {
  // Remove UUIDs
  return path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id]');
};

const sanitizeQueryKey = (key: string): string => {
  // Remove UUIDs and potential sensitive data
  return key
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id]')
    .replace(/\"[^"]*@[^"]*\"/g, '"[email]"');
};

// Export a noop version for production
export const perfLogger = {
  initLogger,
  logEvent,
  logTimedEvent,
  incrementCounter,
  startTiming,
  endTiming,
  logNavigation,
  logQuery,
  logRPC,
  logChunkLoad,
  logApiCall,
  logVisibilityChange,
  logFocusEvent,
  logRealtimeSubscribe,
  logRealtimeReady,
  getMetrics,
  getTimeline,
  getCounters,
  getSummary,
  printTimeline,
  clearMetrics,
  isEnabled,
};

export default perfLogger;
