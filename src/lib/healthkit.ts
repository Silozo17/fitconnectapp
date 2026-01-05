/**
 * Clean HealthKit Integration Module
 * 
 * Direct Despia SDK calls - no wrappers, no complexity.
 * Mirrors the working debug page pattern exactly.
 */

import despia from 'despia-native';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if HealthKit is available (iOS native in Despia)
 */
export const isHealthKitAvailable = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('despia') && (ua.includes('iphone') || ua.includes('ipad'));
};

/**
 * Connect to HealthKit - triggers iOS permission dialog
 * Returns true if permission was granted
 */
export const connectHealthKit = async (): Promise<boolean> => {
  if (!isHealthKitAvailable()) return false;
  
  // Direct SDK call - triggers permission dialog on first read
  const response = await despia(
    'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=1',
    ['healthkitResponse']
  );
  
  // undefined = no permission, any other response = success
  return (response as Record<string, unknown>)?.healthkitResponse !== undefined;
};

/**
 * Sync HealthKit data to database
 * Direct SDK call just like the debug page
 * 
 * @param clientId - The client profile ID to sync data for
 * @param days - Number of days to sync (default 7)
 * @returns Number of data points synced
 */
export const syncHealthKit = async (clientId: string, days = 7): Promise<number> => {
  if (!isHealthKitAvailable()) return 0;
  
  // Direct SDK call - exactly like debug page
  const response = await despia(
    `healthkit://read?types=HKQuantityTypeIdentifierStepCount,HKQuantityTypeIdentifierActiveEnergyBurned,HKQuantityTypeIdentifierDistanceWalkingRunning&days=${days}`,
    ['healthkitResponse']
  );
  
  const data = (response as Record<string, unknown>)?.healthkitResponse;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 0;
  
  // Map HealthKit types to our database types
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
      
      // Sum values (for cumulative metrics like steps)
      aggregated[dateStr][dataType] += Number(reading.value) || 0;
    }
  }
  
  // Build entries for database
  const entries = [];
  for (const [dateStr, types] of Object.entries(aggregated)) {
    for (const [dataType, value] of Object.entries(types)) {
      // Round appropriately
      let finalValue = dataType === 'distance' 
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
  
  if (entries.length === 0) return 0;
  
  // Upsert to database
  const { error } = await supabase
    .from('health_data_sync')
    .upsert(entries, {
      onConflict: 'client_id,data_type,recorded_at,source',
      ignoreDuplicates: false,
    });
  
  if (error) {
    console.error('[healthkit] Upsert error:', error);
    return 0;
  }
  
  // Trigger achievement and challenge checks (fire and forget)
  supabase.functions.invoke('check-health-achievements', { body: { clientId } }).catch(() => {});
  supabase.functions.invoke('sync-challenge-progress', { body: { clientId } }).catch(() => {});
  
  return entries.length;
};
