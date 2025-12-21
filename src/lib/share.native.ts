/**
 * DESPIA NATIVE SHARING ONLY
 * This module handles all Despia-specific sharing functionality
 * NO web fallbacks - use share.web.ts for web sharing
 */

import { isDespia, nativeShare as despiaNativeShare } from './despia';

export interface NativeShareOptions {
  title: string;
  text: string;
  url: string;
}

/**
 * Check if Despia native sharing is available
 */
export function canUseNativeShare(): boolean {
  return isDespia();
}

/**
 * Share using Despia native share sheet
 * @returns true if share was initiated, false if not in Despia environment
 */
export function shareNative(options: NativeShareOptions): boolean {
  if (!isDespia()) return false;
  
  return despiaNativeShare({
    message: `${options.title}\n\n${options.text}`,
    url: options.url,
  });
}
