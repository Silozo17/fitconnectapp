/**
 * Image Export Utilities
 * Uses html-to-image to convert DOM elements to images for sharing
 */

import { toPng, toBlob } from 'html-to-image';

/**
 * Export a DOM element as a PNG Blob
 */
export async function exportElementAsBlob(
  element: HTMLElement,
  options?: {
    quality?: number;
    pixelRatio?: number;
    backgroundColor?: string;
  }
): Promise<Blob> {
  const { quality = 0.95, pixelRatio = 2, backgroundColor = '#ffffff' } = options || {};

  const blob = await toBlob(element, {
    quality,
    pixelRatio,
    backgroundColor,
    cacheBust: true,
    // Filter out problematic elements
    filter: (node) => {
      // Exclude hidden elements and scripts
      if (node instanceof HTMLElement) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
      }
      return true;
    },
  });

  if (!blob) {
    throw new Error('Failed to export element as blob');
  }

  return blob;
}

/**
 * Export a DOM element as a File object (for sharing)
 */
export async function exportElementAsFile(
  element: HTMLElement,
  filename: string,
  options?: {
    quality?: number;
    pixelRatio?: number;
    backgroundColor?: string;
  }
): Promise<File> {
  const blob = await exportElementAsBlob(element, options);
  return new File([blob], filename, { type: 'image/png' });
}

/**
 * Export a DOM element and trigger download
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string,
  options?: {
    quality?: number;
    pixelRatio?: number;
    backgroundColor?: string;
  }
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: options?.quality ?? 0.95,
      pixelRatio: options?.pixelRatio ?? 2,
      backgroundColor: options?.backgroundColor ?? '#ffffff',
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to download image:', error);
    throw error;
  }
}

/**
 * Check if Web Share API supports files
 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.canShare) return false;
  
  // Test with a dummy file
  const testFile = new File(['test'], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
}
