/**
 * Simplified HealthKit Integration Module
 * 
 * Per Despia SDK: Request all types in ONE call.
 * iOS shows ONE unified permission dialog.
 */

import despia from 'despia-native';
import { supabase } from '@/integrations/supabase/client';

// All HealthKit types we need - request together for single permission dialog
const HEALTHKIT_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
].join(',');

/**
 * Check if HealthKit is available (iOS native in Despia)
 */
export const isHealthKitAvailable = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('despia') && (ua.includes('iphone') || ua.includes('ipad'));
};

/**
 * Connect and sync HealthKit in ONE call
 * 
 * Per Despia SDK: Single call with all types = single permission dialog
 * Returns connection status and number of data points synced
 */
export const connectAndSyncHealthKit = async (
  clientId: string,
  days = 7
): Promise<{ connected: boolean; dataPoints: number }> => {
  if (!isHealthKitAvailable()) {
    return { connected: false, dataPoints: 0 };
  }

  // ONE call with ALL types - triggers SINGLE permission dialog
  const response = await despia(
    `healthkit://read?types=${HEALTHKIT_TYPES}&days=${days}`,
    ['healthkitResponse']
  );

  const data = (response as Record<string, unknown>)?.healthkitResponse;

  // undefined = no permission granted
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { connected: false, dataPoints: 0 };
  }

  // Permission granted - process and save data
  const typeMap: Record<string, string> = {
    'HKQuantityTypeIdentifierStepCount': 'steps',
    'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
    'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
  };

  const unitMap: Record<string, string> = {
    'steps': 'count',
    'calories': 'kcal',
    'distance': 'meters',
  };

  // Aggregate by date (HealthKit returns multiple readings per day)
  const aggregated: Record<string, Record<string, number>> = {};

  for (const [hkType, readings] of Object.entries(data)) {
    const dataType = typeMap[hkType];
    if (!dataType || !Array.isArray(readings)) continue;

    for (const reading of readings) {
      if (!reading?.date || reading?.value == null) continue;

      const dateStr = String(reading.date).split('T')[0];
      if (!aggregated[dateStr]) aggregated[dateStr] = {};
      if (!aggregated[dateStr][dataType]) aggregated[dateStr][dataType] = 0;

      aggregated[dateStr][dataType] += Number(reading.value) || 0;
    }
  }

  // Build entries for database
  const entries = [];
  for (const [dateStr, types] of Object.entries(aggregated)) {
    for (const [dataType, value] of Object.entries(types)) {
      const finalValue = dataType === 'distance'
        ? Math.round(value * 10) / 10
        : Math.round(value);

      entries.push({
        client_id: clientId,
        data_type: dataType,
        recorded_at: dateStr,
        value: finalValue,
        unit: unitMap[dataType] || 'count',
        source: 'apple_health' as const,
        wearable_connection_id: null,
      });
    }
  }

  if (entries.length === 0) {
    return { connected: true, dataPoints: 0 };
  }

  // Upsert to database
  const { error } = await supabase
    .from('health_data_sync')
    .upsert(entries, {
      onConflict: 'client_id,data_type,recorded_at,source',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('[healthkit] Upsert error:', error);
    return { connected: true, dataPoints: 0 };
  }

  // Trigger achievement and challenge checks (fire and forget)
  supabase.functions.invoke('check-health-achievements', { body: { clientId } }).catch(() => {});
  supabase.functions.invoke('sync-challenge-progress', { body: { clientId } }).catch(() => {});

  return { connected: true, dataPoints: entries.length };
};

/**
 * Sync HealthKit data (alias for connectAndSyncHealthKit for re-syncing)
 */
export const syncHealthKit = async (clientId: string, days = 7): Promise<number> => {
  const result = await connectAndSyncHealthKit(clientId, days);
  return result.dataPoints;
};
