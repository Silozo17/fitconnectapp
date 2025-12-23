/**
 * Platform detection utilities for iOS/Android native app restrictions
 */

import { getEnvironment } from "@/hooks/useEnvironment";

/**
 * Check if running on iOS inside Despia native app
 */
export const isIOSNative = (): boolean => {
  const env = getEnvironment();
  return env.isDespia && env.isIOS;
};

/**
 * Check if running on Android inside Despia native app  
 */
export const isAndroidNative = (): boolean => {
  const env = getEnvironment();
  return env.isDespia && env.isAndroid;
};

/**
 * Check if running in any native app context (iOS or Android)
 */
export const isNativeApp = (): boolean => {
  const env = getEnvironment();
  return env.isDespia;
};
