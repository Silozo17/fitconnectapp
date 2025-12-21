/**
 * Despia Native Runtime Setup
 * 
 * This module provides environment detection and access to the Despia native runtime.
 * Only invoke native features when running inside the Despia environment.
 */

import despia from 'despia-native';

/**
 * Check if the app is running inside the Despia native environment
 */
export const isDespia = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('despia');
};

/**
 * Get the Despia runtime instance (only use when isDespia() returns true)
 */
export const getDespiaRuntime = () => {
  if (!isDespia()) {
    console.warn('Despia runtime accessed outside of Despia environment');
    return null;
  }
  return despia;
};

/**
 * Safe wrapper to execute Despia-only code
 * @param callback Function to execute if in Despia environment
 * @param fallback Optional fallback for non-Despia environments
 */
export const withDespia = <T>(
  callback: (runtime: typeof despia) => T,
  fallback?: () => T
): T | undefined => {
  if (isDespia()) {
    return callback(despia);
  }
  return fallback?.();
};

/**
 * Haptic feedback patterns available in Despia
 */
export type HapticPattern = 'light' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback on the device
 * @param pattern The haptic pattern to trigger
 */
export const triggerHaptic = (pattern: HapticPattern): void => {
  if (!isDespia()) return;
  
  const commands: Record<HapticPattern, string> = {
    light: 'lighthaptic://',
    heavy: 'heavyhaptic://',
    success: 'successhaptic://',
    warning: 'warninghaptic://',
    error: 'errorhaptic://',
  };
  
  try {
    despia(commands[pattern]);
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
  }
};

/**
 * Native share options for Despia
 */
export interface DespiaShareOptions {
  message: string;
  url: string;
}

/**
 * Trigger native share sheet on Despia devices
 * Uses the shareapp:// protocol with properly encoded message and URL
 * @param options Share options with message and URL
 * @returns true if share was triggered, false otherwise
 */
export const nativeShare = (options: DespiaShareOptions): boolean => {
  if (!isDespia()) return false;
  
  try {
    const encodedMessage = encodeURIComponent(options.message);
    const encodedUrl = encodeURIComponent(options.url);
    despia(`shareapp://message?=${encodedMessage}&url=${encodedUrl}`);
    return true;
  } catch (e) {
    console.warn('Native share failed:', e);
    return false;
  }
};

export default despia;
