import { toast } from "sonner";

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

export type SharePlatform = 'native' | 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'copy';

/**
 * Check if the Web Share API is available
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Share content using the native Web Share API
 */
async function shareNative(options: ShareOptions): Promise<boolean> {
  if (!canUseNativeShare()) return false;
  
  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return true;
  } catch (error) {
    // User cancelled or share failed
    if ((error as Error).name !== 'AbortError') {
      console.error('Native share failed:', error);
    }
    return false;
  }
}

/**
 * Get the share URL for a specific platform
 */
export function getShareUrl(platform: Exclude<SharePlatform, 'native' | 'copy'>, options: ShareOptions): string {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedText = encodeURIComponent(options.text);
  const fullText = encodeURIComponent(`${options.text}\n\n${options.url}`);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case 'facebook':
      // Facebook no longer supports custom text via sharer
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'linkedin':
      // LinkedIn only supports URL parameter now
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${fullText}`;
    default:
      return options.url;
  }
}

/**
 * Open a share popup for a specific platform
 */
function openSharePopup(url: string, platform: string): void {
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,status=no`
  );
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Main share function - handles all platforms
 */
export async function share(platform: SharePlatform, options: ShareOptions): Promise<boolean> {
  switch (platform) {
    case 'native':
      return shareNative(options);
    
    case 'copy':
      const copied = await copyToClipboard(`${options.text}\n\n${options.url}`);
      if (copied) {
        toast.success('Copied to clipboard!');
      } else {
        toast.error('Failed to copy');
      }
      return copied;
    
    default:
      const shareUrl = getShareUrl(platform, options);
      openSharePopup(shareUrl, platform);
      return true;
  }
}

/**
 * Share with native API if available, otherwise show a toast to use the dropdown
 */
export async function shareWithFallback(options: ShareOptions): Promise<boolean> {
  if (canUseNativeShare()) {
    return shareNative(options);
  }
  toast.info('Use the share menu to share on your preferred platform');
  return false;
}
