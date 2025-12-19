/**
 * Error handling utilities with proper TypeScript typing
 * Use these instead of catch (error: any)
 */

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Type guard for Error instances
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard for Supabase/PostgrestError
 */
export function isSupabaseError(error: unknown): error is { code: string; message: string; details?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Log error only in development mode
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}

/**
 * Log warning only in development mode
 */
export function logWarn(context: string, message: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    if (data !== undefined) {
      console.warn(`[${context}] ${message}`, data);
    } else {
      console.warn(`[${context}] ${message}`);
    }
  }
}

/**
 * Log debug info only in development mode
 */
export function logDebug(context: string, message: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    if (data !== undefined) {
      console.log(`[${context}] ${message}`, data);
    } else {
      console.log(`[${context}] ${message}`);
    }
  }
}
