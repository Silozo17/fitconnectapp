import { useState, useMemo, useCallback } from 'react';
import { startOfDay, endOfDay, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';

export type DatePreset = 'today' | '7d' | '30d' | '90d' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
export type CompareMode = 'none' | 'previousPeriod' | 'previousMonth' | 'previousYear' | 'sameLastYear';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangeState {
  preset: DatePreset;
  startDate: Date;
  endDate: Date;
  compareMode: CompareMode;
}

export interface UseDateRangeAnalyticsReturn {
  // Current state
  preset: DatePreset;
  startDate: Date;
  endDate: Date;
  compareMode: CompareMode;
  
  // Computed ranges
  dateRange: DateRange;
  comparisonRange: DateRange | null;
  
  // Formatted strings for display
  dateRangeLabel: string;
  comparisonLabel: string | null;
  
  // Setters
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
  setCompareMode: (mode: CompareMode) => void;
  
  // Helpers for Supabase queries
  getDateFilter: () => { start: string; end: string };
  getComparisonFilter: () => { start: string; end: string } | null;
}

function getPresetDates(preset: DatePreset): { start: Date; end: Date } {
  const now = new Date();
  const today = startOfDay(now);
  const endOfToday = endOfDay(now);

  switch (preset) {
    case 'today':
      return { start: today, end: endOfToday };
    case '7d':
      return { start: startOfDay(subDays(now, 6)), end: endOfToday };
    case '30d':
      return { start: startOfDay(subDays(now, 29)), end: endOfToday };
    case '90d':
      return { start: startOfDay(subDays(now, 89)), end: endOfToday };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfToday };
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    case 'thisYear':
      return { start: startOfYear(now), end: endOfToday };
    case 'custom':
    default:
      return { start: startOfDay(subDays(now, 29)), end: endOfToday };
  }
}

function calculateComparisonRange(
  dateRange: DateRange,
  compareMode: CompareMode
): DateRange | null {
  if (compareMode === 'none') return null;

  const { start, end } = dateRange;
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  switch (compareMode) {
    case 'previousPeriod':
      // Same length period immediately before
      return {
        start: startOfDay(subDays(start, daysDiff + 1)),
        end: endOfDay(subDays(start, 1)),
      };
    case 'previousMonth':
      return {
        start: startOfDay(subMonths(start, 1)),
        end: endOfDay(subMonths(end, 1)),
      };
    case 'previousYear':
      return {
        start: startOfDay(subYears(start, 1)),
        end: endOfDay(subYears(end, 1)),
      };
    case 'sameLastYear':
      return {
        start: startOfDay(subYears(start, 1)),
        end: endOfDay(subYears(end, 1)),
      };
    default:
      return null;
  }
}

function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const sameDay = sameMonth && start.getDate() === end.getDate();

  if (sameDay) {
    return format(start, 'd MMM yyyy');
  }

  if (sameMonth) {
    return `${format(start, 'd')} - ${format(end, 'd MMM yyyy')}`;
  }

  if (sameYear) {
    return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
  }

  return `${format(start, 'd MMM yyyy')} - ${format(end, 'd MMM yyyy')}`;
}

export function useDateRangeAnalytics(
  defaultPreset: DatePreset = '30d',
  defaultCompareMode: CompareMode = 'none'
): UseDateRangeAnalyticsReturn {
  const [preset, setPresetState] = useState<DatePreset>(defaultPreset);
  const [compareMode, setCompareModeState] = useState<CompareMode>(defaultCompareMode);
  
  const defaultDates = useMemo(() => getPresetDates(defaultPreset), [defaultPreset]);
  const [startDate, setStartDate] = useState<Date>(defaultDates.start);
  const [endDate, setEndDate] = useState<Date>(defaultDates.end);

  const dateRange = useMemo<DateRange>(() => ({
    start: startDate,
    end: endDate,
  }), [startDate, endDate]);

  const comparisonRange = useMemo(() => 
    calculateComparisonRange(dateRange, compareMode),
    [dateRange, compareMode]
  );

  const dateRangeLabel = useMemo(() => 
    formatDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const comparisonLabel = useMemo(() => {
    if (!comparisonRange) return null;
    return formatDateRange(comparisonRange.start, comparisonRange.end);
  }, [comparisonRange]);

  const setPreset = useCallback((newPreset: DatePreset) => {
    setPresetState(newPreset);
    if (newPreset !== 'custom') {
      const dates = getPresetDates(newPreset);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, []);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    setPresetState('custom');
    setStartDate(startOfDay(start));
    setEndDate(endOfDay(end));
  }, []);

  const setCompareMode = useCallback((mode: CompareMode) => {
    setCompareModeState(mode);
  }, []);

  const getDateFilter = useCallback(() => ({
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  }), [startDate, endDate]);

  const getComparisonFilter = useCallback(() => {
    if (!comparisonRange) return null;
    return {
      start: comparisonRange.start.toISOString(),
      end: comparisonRange.end.toISOString(),
    };
  }, [comparisonRange]);

  return {
    preset,
    startDate,
    endDate,
    compareMode,
    dateRange,
    comparisonRange,
    dateRangeLabel,
    comparisonLabel,
    setPreset,
    setCustomRange,
    setCompareMode,
    getDateFilter,
    getComparisonFilter,
  };
}

// Utility function to calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

// Preset options for UI
export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'thisYear', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

export const COMPARE_OPTIONS: { value: CompareMode; label: string }[] = [
  { value: 'none', label: 'No comparison' },
  { value: 'previousPeriod', label: 'Previous period' },
  { value: 'previousMonth', label: 'Previous month' },
  { value: 'previousYear', label: 'Previous year' },
  { value: 'sameLastYear', label: 'Same period last year' },
];
