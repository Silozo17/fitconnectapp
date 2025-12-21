/**
 * PURE WEB SHARING - NO DESPIA IMPORTS
 * This module handles all web-based sharing functionality
 */

import { toast } from "sonner";

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

export type WebSharePlatform = 'web-native' | 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy';

/**
 * Check if Web Share API is available (browser-only, no Despia check)
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Share using Web Share API only
 */
export async function shareWebNative(options: ShareOptions): Promise<boolean> {
  if (!canUseWebShare()) return false;
  
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
      console.error('Web share failed:', error);
    }
    return false;
  }
}

/**
 * Get the share URL for a specific platform
 */
export function getShareUrl(platform: Exclude<WebSharePlatform, 'web-native' | 'copy'>, options: ShareOptions): string {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedText = encodeURIComponent(options.text);
  const encodedTitle = encodeURIComponent(options.title);
  const fullText = encodeURIComponent(`${options.text}\n\n${options.url}`);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${fullText}`;
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${fullText}`;
    default:
      return options.url;
  }
}

/**
 * Open a share window for a specific platform
 * Facebook and LinkedIn block popups with window features, so use anchor click method
 */
function openShareWindow(url: string, platform: string): void {
  // Email uses mailto: which doesn't need a window
  if (platform === 'email') {
    window.location.href = url;
    return;
  }
  
  // For Facebook, LinkedIn, WhatsApp - use anchor click method
  // This bypasses COOP/COEP blocking that affects window.open
  if (platform === 'facebook' || platform === 'linkedin' || platform === 'whatsapp') {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return;
  }
  
  // Twitter works fine with popups
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
 * Main web share function - handles all web platforms
 */
export async function shareWeb(platform: WebSharePlatform, options: ShareOptions): Promise<boolean> {
  switch (platform) {
    case 'web-native':
      return shareWebNative(options);
    
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
      openShareWindow(shareUrl, platform);
      return true;
  }
}
