/**
 * Canonical Health Data Types
 * 
 * Consolidates health data type definitions to eliminate duplicates
 * across health hooks and privacy settings.
 */

/**
 * Core health metrics from wearables.
 * Used by useHealthData and useHealthAggregation.
 */
export type CoreHealthDataType = 
  | "steps" 
  | "heart_rate" 
  | "sleep" 
  | "calories" 
  | "distance" 
  | "active_minutes";

/**
 * Extended health data types including weight.
 * Used by health data sharing and privacy settings.
 */
export type ExtendedHealthDataType = CoreHealthDataType | "weight";

/**
 * Health data type with "all" option for bulk operations.
 * Used by useHealthDataSharing for toggle-all functionality.
 */
export type HealthDataTypeWithAll = "all" | ExtendedHealthDataType;

/**
 * Client-generated data types (non-wearable).
 * Used by useUnifiedDataPrivacy.
 */
export type ClientDataType = "progress_photos" | "meal_logs" | "training_logs";

/**
 * Combined data type for unified privacy settings.
 * Includes both client-generated and health data types.
 */
export type UnifiedDataType = ClientDataType | ExtendedHealthDataType;

/**
 * All client data types as an array for iteration.
 */
export const CLIENT_DATA_TYPES: ClientDataType[] = [
  "progress_photos",
  "meal_logs",
  "training_logs",
];

/**
 * Core health data types array (wearable metrics).
 */
export const CORE_HEALTH_DATA_TYPES: CoreHealthDataType[] = [
  "steps",
  "heart_rate",
  "sleep",
  "calories",
  "distance",
  "active_minutes",
];

/**
 * Extended health data types array (includes weight).
 */
export const EXTENDED_HEALTH_DATA_TYPES: ExtendedHealthDataType[] = [
  ...CORE_HEALTH_DATA_TYPES,
  "weight",
];

/**
 * All data types for unified privacy settings.
 */
export const ALL_UNIFIED_DATA_TYPES: UnifiedDataType[] = [
  ...CLIENT_DATA_TYPES,
  ...EXTENDED_HEALTH_DATA_TYPES,
];
