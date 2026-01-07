/**
 * Metric Resolution Layer
 * Combines wearable data + manual discipline_events to compute metric values
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  DisciplineMetricConfig, 
  ComputedMetric, 
  DataSource,
  Timeframe,
  MetricFormatter 
} from "@/config/disciplines/types";
import { subDays, startOfDay, endOfDay } from "date-fns";

/**
 * Get date range for a given timeframe
 */
export function getTimeframeRange(timeframe: Timeframe): { startDate: Date; endDate: Date } {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (timeframe) {
    case '7d':
      startDate = startOfDay(subDays(new Date(), 7));
      break;
    case '30d':
      startDate = startOfDay(subDays(new Date(), 30));
      break;
    case '90d':
      startDate = startOfDay(subDays(new Date(), 90));
      break;
    case 'all-time':
      startDate = new Date(2000, 0, 1); // Effectively all time
      break;
    default:
      startDate = startOfDay(subDays(new Date(), 7));
  }

  return { startDate, endDate };
}

/**
 * Fetch discipline events from the database
 */
async function fetchDisciplineEvents(
  userId: string,
  disciplineId: string,
  eventType: string,
  startDate: Date,
  endDate: Date
): Promise<{ value: number; recorded_at: string }[]> {
  const { data, error } = await supabase
    .from('discipline_events')
    .select('value_json, recorded_at')
    .eq('user_id', userId)
    .eq('discipline_id', disciplineId)
    .eq('event_type', eventType)
    .gte('recorded_at', startDate.toISOString())
    .lte('recorded_at', endDate.toISOString())
    .order('recorded_at', { ascending: false });

  if (error || !data) return [];

  return data.map(event => ({
    value: typeof event.value_json === 'object' && event.value_json !== null 
      ? (event.value_json as { value?: number }).value || 0 
      : 0,
    recorded_at: event.recorded_at
  }));
}

/**
 * Fetch health data from wearables
 * Note: Uses wearable_daily_metrics or client_progress tables as fallback
 */
async function fetchWearableData(
  clientId: string,
  wearableTypes: string[],
  startDate: Date,
  endDate: Date
): Promise<number[]> {
  // Try wearable_daily_metrics first
  const { data, error } = await supabase
    .from('wearable_daily_metrics')
    .select('metric_type, value, recorded_date')
    .eq('client_id', clientId)
    .in('metric_type', wearableTypes)
    .gte('recorded_date', startDate.toISOString().split('T')[0])
    .lte('recorded_date', endDate.toISOString().split('T')[0]);

  if (error || !data) return [];

  return data.map(d => Number(d.value) || 0);
}

/**
 * Aggregate values based on compute rule
 */
function aggregateByRule(values: number[], rule: string): number {
  if (values.length === 0) return 0;

  switch (rule) {
    case 'sum':
      return values.reduce((sum, v) => sum + v, 0);
    case 'avg':
      return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    case 'latest':
      return values[0] || 0;
    case 'streak':
      // Calculate streak based on weekly activity
      return calculateStreak(values);
    default:
      return values.reduce((sum, v) => sum + v, 0);
  }
}

/**
 * Calculate training streak in weeks
 */
function calculateStreak(values: number[]): number {
  // Simplified: count consecutive weeks with at least one session
  // For now, return count of sessions as proxy
  return Math.min(Math.floor(values.length / 2), 12);
}

/**
 * Format a metric value for display
 */
export function formatMetricValue(value: number, formatter: MetricFormatter): string {
  if (value === 0 || isNaN(value)) return '—';

  switch (formatter) {
    case 'sessions':
      return value.toString();
    case 'rounds':
      return value.toString();
    case 'min':
      return `${Math.round(value)}`;
    case 'km':
      return value >= 100 ? Math.round(value).toString() : value.toFixed(1);
    case 'bpm':
      return Math.round(value).toString();
    case 'kg':
      return value >= 100 ? Math.round(value).toString() : value.toFixed(1);
    case 'kcal':
      return Math.round(value).toLocaleString();
    case 'weeks':
      return value.toString();
    case 'm':
      return Math.round(value).toLocaleString();
    case 'sets':
      return value.toString();
    case 'pace':
      // Convert to min/km format
      const mins = Math.floor(value);
      const secs = Math.round((value - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    case 'time':
      // Format as mm:ss
      const m = Math.floor(value / 60);
      const s = Math.round(value % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    default:
      return value.toString();
  }
}

/**
 * Get formatter unit suffix
 */
export function getFormatterUnit(formatter: MetricFormatter): string {
  switch (formatter) {
    case 'min':
      return 'min';
    case 'km':
      return 'km';
    case 'bpm':
      return 'bpm';
    case 'kg':
      return 'kg';
    case 'kcal':
      return 'kcal';
    case 'weeks':
      return 'wks';
    case 'm':
      return 'm';
    case 'pace':
      return '/km';
    default:
      return '';
  }
}

/**
 * Main function to compute a single metric value
 */
export async function computeMetricValue(
  metricConfig: DisciplineMetricConfig,
  userId: string,
  clientId: string,
  disciplineId: string
): Promise<ComputedMetric> {
  const { startDate, endDate } = getTimeframeRange(metricConfig.timeframe);
  
  let wearableValue = 0;
  let manualValue = 0;
  let hasWearable = false;
  let hasManual = false;

  // 1. Try wearable sources
  if (metricConfig.sources.wearableTypes?.length) {
    const wearableData = await fetchWearableData(
      clientId, 
      metricConfig.sources.wearableTypes, 
      startDate, 
      endDate
    );
    if (wearableData.length > 0) {
      wearableValue = aggregateByRule(wearableData, metricConfig.computeRule);
      hasWearable = true;
    }
  }

  // 2. Try manual discipline_events
  if (metricConfig.sources.manualEventType) {
    const events = await fetchDisciplineEvents(
      userId, 
      disciplineId,
      metricConfig.sources.manualEventType, 
      startDate, 
      endDate
    );
    if (events.length > 0) {
      const values = events.map(e => e.value);
      manualValue = aggregateByRule(values, metricConfig.computeRule);
      hasManual = true;
    }
  }

  // Determine source and combined value
  let value = 0;
  let source: DataSource = null;

  if (hasWearable && hasManual) {
    value = wearableValue + manualValue;
    source = 'mixed';
  } else if (hasWearable) {
    value = wearableValue;
    source = 'wearable';
  } else if (hasManual) {
    value = manualValue;
    source = 'manual';
  }

  return {
    id: metricConfig.id,
    label: metricConfig.label,
    value,
    formattedValue: formatMetricValue(value, metricConfig.formatter),
    timeframe: metricConfig.timeframe,
    source,
    formatter: metricConfig.formatter,
  };
}

/**
 * Compute all 4 metrics for a discipline
 */
export async function computeAllMetrics(
  metrics: DisciplineMetricConfig[],
  userId: string,
  clientId: string,
  disciplineId: string
): Promise<ComputedMetric[]> {
  const results = await Promise.all(
    metrics.map(metric => computeMetricValue(metric, userId, clientId, disciplineId))
  );
  return results;
}
