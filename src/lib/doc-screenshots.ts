// Documentation screenshot mappings
// These map docId to image paths in the public/images/docs folder

export const DOC_SCREENSHOT_IDS = {
  'client-profile-form': '/images/docs/client-profile-form.png',
  'client-settings-page': '/images/docs/client-settings-page.png',
  'coach-marketplace': '/images/docs/coach-marketplace.png',
  'coach-card': '/images/docs/coach-card.png',
  'booking-calendar': '/images/docs/booking-calendar.png',
  'sessions-dashboard': '/images/docs/sessions-dashboard.png',
  'coach-info-form': '/images/docs/coach-info-form.png',
  'availability-settings': '/images/docs/availability-settings.png',
  'card-image-upload': '/images/docs/card-image-upload.png',
  'stripe-connect-status': '/images/docs/stripe-connect-status.png',
  'earnings-dashboard': '/images/docs/earnings-dashboard.png',
  'leaderboard-privacy': '/images/docs/leaderboard-privacy.png',
} as const;

export type DocScreenshotId = keyof typeof DOC_SCREENSHOT_IDS;

export function getDocScreenshotUrl(docId: DocScreenshotId): string {
  return DOC_SCREENSHOT_IDS[docId];
}
