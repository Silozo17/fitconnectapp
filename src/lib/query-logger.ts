import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { debugLogger } from "./debug-logger";

// Threshold for slow query warning (ms)
const SLOW_QUERY_THRESHOLD = 500;

/**
 * Setup React Query logging for all queries and mutations.
 * Call this once when creating the QueryClient.
 */
export const setupQueryLogging = (queryClient: QueryClient) => {
  if (!debugLogger.isEnabled()) return;

  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();

  // Track query timings
  const queryStartTimes = new Map<string, number>();

  // Subscribe to query cache events
  queryCache.subscribe((event) => {
    const query = event.query;
    const queryKey = JSON.stringify(query.queryKey).slice(0, 100);
    const state = query.state;

    switch (event.type) {
      case 'added':
        queryStartTimes.set(queryKey, Date.now());
        debugLogger.query(queryKey, 'added', {
          queryHash: query.queryHash,
        });
        break;

      case 'updated':
        const startTime = queryStartTimes.get(queryKey);
        const duration = startTime ? Date.now() - startTime : undefined;
        
        // Check for slow queries
        if (duration && duration > SLOW_QUERY_THRESHOLD) {
          debugLogger.performance(`slow_query:${queryKey}`, {
            duration,
            threshold: SLOW_QUERY_THRESHOLD,
            status: state.status,
          });
        }

        debugLogger.query(queryKey, state.status, {
          fetchStatus: state.fetchStatus,
          dataUpdatedAt: state.dataUpdatedAt,
          errorUpdatedAt: state.errorUpdatedAt,
          isStale: query.isStale(),
          duration,
          ...(state.error && { error: String(state.error) }),
        });

        // Clear timing on success/error
        if (state.status === 'success' || state.status === 'error') {
          queryStartTimes.delete(queryKey);
        }
        break;

      case 'removed':
        debugLogger.cache(queryKey, false, { action: 'removed' });
        queryStartTimes.delete(queryKey);
        break;
    }
  });

  // Subscribe to mutation cache events
  mutationCache.subscribe((event) => {
    const mutation = event.mutation;
    if (!mutation) return;

    const mutationKey = mutation.options.mutationKey 
      ? JSON.stringify(mutation.options.mutationKey).slice(0, 100)
      : 'unknown';
    const state = mutation.state;

    switch (event.type) {
      case 'added':
        debugLogger.mutation('mutation', 'started', {
          mutationKey,
        });
        break;

      case 'updated':
        debugLogger.mutation('mutation', state.status, {
          mutationKey,
          failureCount: state.failureCount,
          ...(state.error && { error: String(state.error) }),
          ...(state.submittedAt && { submittedAt: state.submittedAt }),
        });
        break;

      case 'removed':
        debugLogger.mutation('mutation', 'removed', {
          mutationKey,
        });
        break;
    }
  });

  console.log('%c[QueryLogger] React Query logging enabled', 'color: #06b6d4;');
};

/**
 * Log a cache hit/miss manually (for custom caching logic)
 */
export const logCacheEvent = (key: string, hit: boolean, data?: Record<string, unknown>) => {
  debugLogger.cache(key, hit, data);
};

/**
 * Log query invalidation
 */
export const logQueryInvalidation = (queryKey: string[], reason?: string) => {
  debugLogger.query(JSON.stringify(queryKey).slice(0, 100), 'invalidated', { reason });
};

export default setupQueryLogging;