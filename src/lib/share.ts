/**
 * DEPRECATED - Use share.web.ts or useShareManager hook instead
 * 
 * This file is maintained for backward compatibility only.
 * New code should import from:
 * - @/lib/share.web for pure web sharing
 * - @/lib/share.native for Despia-only sharing  
 * - @/hooks/useShareManager for unified component usage
 */

export { 
  shareWeb as share,
  canUseWebShare as canUseNativeShare,
  getShareUrl,
  type ShareOptions,
  type WebSharePlatform as SharePlatform
} from './share.web';

// Re-export shareWithFallback for backward compatibility
import { shareWeb, canUseWebShare, type ShareOptions } from './share.web';
import { toast } from 'sonner';

export async function shareWithFallback(options: ShareOptions): Promise<boolean> {
  if (canUseWebShare()) {
    return shareWeb('web-native', options);
  }
  toast.info('Use the share menu to share on your preferred platform');
  return false;
}
