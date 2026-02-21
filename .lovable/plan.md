
# Embed Videos Platform-Wide and Fix Missing Translation Keys

## Problem

Several areas of the platform still use raw `<a href>` links or bare `<video>` tags for video content, which directs users away from the platform. The `VideoEmbed` component (with its `restricted` mode) should be used everywhere videos appear. Additionally, the `ClientMarketplaceProduct.tsx` page has multiple hardcoded English strings instead of translation keys.

## Locations Requiring VideoEmbed Integration

### 1. Exercise Video in Workout Plan View
**File:** `src/components/plans/WorkoutPlanView.tsx` (lines 97-106)

Currently renders a plain `<a>` link ("Watch demo") that opens YouTube in a new tab. Replace with `<VideoEmbed url={exercise.video_url} restricted />` to embed the video inline.

### 2. Exercise Video in Sortable Exercise Item (Plan Builder)
**File:** `src/components/planbuilder/SortableExerciseItem.tsx` (lines 50-62)

Same issue -- a plain `<a>` link with "Watch video" text. Replace with a small inline `<VideoEmbed>` or a clickable thumbnail that expands to show the embedded video (a collapsible/dialog approach works best here since the item is compact).

### 3. Exercise Creation Modal -- Video Preview
**File:** `src/components/planbuilder/CreateExerciseModal.tsx` (lines 142-153)

The video URL input has no preview. Add a `<VideoEmbed>` preview below the input when a URL is entered (same pattern as the community lesson editor).

### 4. Client Library -- Streaming Video
**File:** `src/pages/dashboard/client/ClientLibrary.tsx` (lines 164-170)

The "Watch" button opens `product.video_url` in a new tab. Replace with a dialog/modal containing `<VideoEmbed url={product.video_url} restricted />` so users watch within the platform.

### 5. Marketplace Product Page (Public) -- Preview Video
**File:** `src/pages/MarketplaceProduct.tsx` (lines 257-262, 431-437)

Uses raw `<video src={product.preview_url}>` tags. Replace both the inline preview and the preview dialog with `<VideoEmbed url={product.preview_url} />`.

### 6. Client Marketplace Product Page -- Preview Video
**File:** `src/pages/dashboard/client/ClientMarketplaceProduct.tsx` (lines 218-223, 391-397)

Same issue as above -- raw `<video>` tags. Replace with `<VideoEmbed>`.

### 7. Create Product Modal -- Video URL Preview
**File:** `src/components/marketplace/CreateProductModal.tsx` (lines 715-743)

The "Trial/Preview Video URL" and "Streaming URL" inputs have no live preview. Add `<VideoEmbed>` preview when a URL is entered.

## Missing Translation Keys

### `src/pages/dashboard/client/ClientMarketplaceProduct.tsx`
This file has many hardcoded English strings that need translation keys:

| Hardcoded String | Suggested Key |
|-----------------|---------------|
| "Preview" (CardTitle) | `product.preview` |
| "View Preview" | `product.viewPreview` |
| "Preview: {title}" (dialog title) | `product.preview` (reuse) |
| Several other inline strings | Audit needed |

The public `MarketplaceProduct.tsx` already uses `t('product.preview')` etc. from the `marketplace` namespace. The client version should do the same.

### `src/components/marketplace/CreateProductModal.tsx`
Contains hardcoded labels like "Trial/Preview Video URL", "Streaming URL", "Free preview so buyers can see what they're getting". These should use translation keys from the `coach` namespace.

### `src/components/planbuilder/SortableExerciseItem.tsx`
"Watch video" text is hardcoded -- should use `t("workoutBuilder.watchVideo")`.

### `src/components/plans/WorkoutPlanView.tsx`
"Watch demo" text is hardcoded -- should use `t("workoutBuilder.watchDemo")`.

## Implementation Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/plans/WorkoutPlanView.tsx` | Replace `<a>` link with `<VideoEmbed restricted />` |
| `src/components/planbuilder/SortableExerciseItem.tsx` | Replace `<a>` link with expandable `<VideoEmbed restricted />` |
| `src/components/planbuilder/CreateExerciseModal.tsx` | Add `<VideoEmbed>` preview below video URL input |
| `src/pages/dashboard/client/ClientLibrary.tsx` | Replace "Watch" button with in-app dialog using `<VideoEmbed restricted />` |
| `src/pages/MarketplaceProduct.tsx` | Replace raw `<video>` with `<VideoEmbed>` in preview section and preview dialog |
| `src/pages/dashboard/client/ClientMarketplaceProduct.tsx` | Replace raw `<video>` with `<VideoEmbed>`, add translation keys |
| `src/components/marketplace/CreateProductModal.tsx` | Add `<VideoEmbed>` preview for video URL inputs, add translation keys |
| `src/i18n/locales/en/coach.json` | Add keys: `workoutBuilder.watchDemo`, `workoutBuilder.watchVideo`, marketplace product modal labels |
| `src/i18n/locales/pl/coach.json` | Polish equivalents |
| `src/i18n/locales/en/client.json` | No changes needed if reusing `marketplace` namespace keys |
| `src/i18n/locales/pl/client.json` | Same |

### Approach for Compact Contexts (Exercise Items)

For the plan builder's sortable exercise items, where space is limited, the approach will be:
- Replace the external link with a small "Play" button
- Clicking it opens a dialog/collapsible section with the `<VideoEmbed restricted />` component
- This keeps the UI compact while keeping users on-platform

### No Database Changes Required

All changes are frontend-only -- using the existing `VideoEmbed` component in more places and adding missing translation keys.
