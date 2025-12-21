/**
 * Unified Share Manager Hook
 * Orchestrates sharing based on environment (Despia vs Web)
 * Components should use this hook instead of importing share modules directly
 */

import { useEnvironment } from './useEnvironment';
import { 
  shareWeb, 
  canUseWebShare,
  triggerWebShare,
  type ShareOptions, 
  type WebSharePlatform 
} from '@/lib/share.web';
import { 
  shareNative, 
  canUseNativeShare 
} from '@/lib/share.native';

export type SharePlatform = 'native' | WebSharePlatform;

export type { ShareOptions };

export function useShareManager() {
  const { isDespia } = useEnvironment();
  
  /**
   * Check if any native share capability is available
   * Returns true if Despia native share OR Web Share API is available
   */
  const canShare = (): boolean => {
    if (isDespia) return canUseNativeShare();
    return canUseWebShare();
  };
  
  /**
   * Share content using the appropriate method based on platform and environment
   */
  const share = async (platform: SharePlatform, options: ShareOptions): Promise<boolean> => {
    // Native platform - use Despia if available, otherwise Web Share API
    if (platform === 'native') {
      if (isDespia) {
        return shareNative(options);
      }
      // Fall back to web native share
      return shareWeb('web-native', options);
    }
    
    // All other platforms use web share
    return shareWeb(platform, options);
  };
  
  /**
   * Determine if a simple native share button should be shown
   * (as opposed to a dropdown menu)
   */
  const shouldShowNativeButton = (): boolean => {
    return isDespia || canUseWebShare();
  };
  
  /**
   * SYNCHRONOUS share trigger for native sharing
   * MUST be called directly from click handler, not in async chain
   * This preserves user gesture context required by Safari iOS
   */
  const triggerNativeShare = (options: ShareOptions): void => {
    if (isDespia) {
      shareNative(options);
      return;
    }
    triggerWebShare(options);
  };
  
  return {
    share,
    triggerNativeShare,
    canShare,
    shouldShowNativeButton,
    isDespia,
  };
}
