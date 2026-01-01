/**
 * NOTE: This file has been extended with cache hit/miss logging
 * for native performance optimization. See logCacheResult().
 */

/**
 * Performance Logger - Dev-only instrumentation for measuring app performance
 * 
 * Measures:
 * - Route navigation time
 * - React Query request duration
 * - Supabase RPC timing
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
  type: 'navigation' | 'query' | 'rpc' | 'chunk' | 'startup' | 'auth';
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100;

// Active timers for tracking ongoing operations
const activeTimers = new Map<string, number>();

/**
 * Start timing an operation
 */
export const startTiming = (type: PerformanceMetric['type'], name: string): string => {
  if (!isEnabled()) return '';
  
  const id = `${type}:${name}:${Date.now()}`;
  activeTimers.set(id, performance.now());
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
  
  // Log to console in development
  const emoji = getEmoji(type);
  const color = getColor(duration);
  console.log(
    `%c${emoji} [Perf] ${type}: ${name} - ${duration.toFixed(2)}ms`,
    `color: ${color}; font-weight: bold;`
  );
  
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
  
  const color = getColor(duration);
  console.log(
    `%c🧭 [Perf] Navigation: ${sanitizedFrom} → ${sanitizedTo} - ${duration.toFixed(2)}ms`,
    `color: ${color}; font-weight: bold;`
  );
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
  
  const color = getColor(duration);
  const statusEmoji = status === 'success' ? '✅' : '❌';
  console.log(
    `%c📊 [Perf] Query ${statusEmoji}: ${sanitizedKey} - ${duration.toFixed(2)}ms`,
    `color: ${color}; font-weight: bold;`
  );
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
  
  const color = getColor(duration);
  console.log(
    `%c⚡ [Perf] RPC: ${rpcName} - ${duration.toFixed(2)}ms`,
    `color: ${color}; font-weight: bold;`
  );
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
  
  const color = getColor(duration);
  console.log(
    `%c📦 [Perf] Chunk: ${chunkName} - ${duration.toFixed(2)}ms`,
    `color: ${color}; font-weight: bold;`
  );
};

/**
 * Log cache hit/miss for native caching
 * DEV-ONLY: No sensitive data logged
 */
export const logCacheResult = (key: string, hit: boolean, reason?: string): void => {
  if (!isEnabled()) return;
  
  const emoji = hit ? '✅' : '❌';
  const status = hit ? 'HIT' : 'MISS';
  const reasonStr = reason ? ` (${reason})` : '';
  
  console.log(
    `%c${emoji} [Cache] ${status}: ${key}${reasonStr}`,
    `color: ${hit ? '#22c55e' : '#f97316'}; font-weight: bold;`
  );
};

/**
 * Get all metrics (for debugging)
 */
export const getMetrics = (): PerformanceMetric[] => {
  return [...metrics];
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
 * Clear all metrics
 */
export const clearMetrics = (): void => {
  metrics.length = 0;
  activeTimers.clear();
};

// Helper functions

const getEmoji = (type: PerformanceMetric['type']): string => {
  switch (type) {
    case 'navigation': return '🧭';
    case 'query': return '📊';
    case 'rpc': return '⚡';
    case 'chunk': return '📦';
    case 'startup': return '🚀';
    case 'auth': return '🔐';
    default: return '📈';
  }
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
  startTiming,
  endTiming,
  logNavigation,
  logQuery,
  logRPC,
  logChunkLoad,
  logCacheResult,
  getMetrics,
  getSummary,
  clearMetrics,
  isEnabled,
};

export default perfLogger;
