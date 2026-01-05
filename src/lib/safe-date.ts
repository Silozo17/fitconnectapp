/**
 * Defensive date utilities to prevent crashes from invalid date values
 * Use these instead of raw date-fns calls when working with data from APIs
 */

import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";

/**
 * Safely parse a date value to a Date object
 * Returns null if the value is invalid
 */
export function safeDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  
  try {
    // Already a valid Date
    if (value instanceof Date && isValid(value)) {
      return value;
    }
    
    // ISO string
    if (typeof value === "string") {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    }
    
    // Timestamp number
    if (typeof value === "number" && !isNaN(value)) {
      const date = new Date(value);
      return isValid(date) ? date : null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely format a date as "X ago" or return fallback
 */
export function safeFormatDistanceToNow(
  value: unknown,
  fallback = "—"
): string {
  const date = safeDate(value);
  if (!date) return fallback;
  
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return fallback;
  }
}

/**
 * Safely format a date with a pattern or return fallback
 */
export function safeFormat(
  value: unknown,
  pattern: string,
  fallback = "—"
): string {
  const date = safeDate(value);
  if (!date) return fallback;
  
  try {
    return format(date, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Safely access nested object property with fallback
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  fallback: T
): T {
  if (obj === null || obj === undefined) return fallback;
  
  try {
    const keys = path.split(".");
    let current: unknown = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) return fallback;
      current = (current as Record<string, unknown>)[key];
    }
    
    return (current ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a number with fallback
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}
