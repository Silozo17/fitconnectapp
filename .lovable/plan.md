

# Fix Coach Dashboard Translation Keys + Broken Plan Creation Route

## Problem Summary

Two distinct bugs reported by coaches:

1. **Raw translation keys visible on dashboard** - Section headers and widget labels showing raw i18n key strings like `widgets.pipeline.title`, `widgets.emptyStates.recentClients.title`, `widgets.connectionRequests.title`
2. **"Create Plan" navigates to non-existent `/new` page** - Coaches land on `https://getfitconnect.co.uk/new` (404) when trying to create a training plan

---

## Root Cause Analysis

### Issue 1: Missing Translation Keys

The coach dashboard (`CoachOverview.tsx`) renders section headers using:
```
t('widgets.sections.activity.title')
t('widgets.sections.activity.description')
```

These keys reference a `widgets.sections` object in `coach.json` that **does not exist**. The section keys needed are: `stats`, `clients`, `activity`, `actions`, `engagement`, `intelligence`, `business`.

The individual widget keys (pipeline, connection requests, recent clients) DO exist in `coach.json` and work correctly. The raw strings visible in the screenshot are specifically the **section headers** wrapping those widgets.

### Issue 2: Broken Route for Plan Creation

`CoachPlans.tsx` has links pointing to:
- `/dashboard/coach/plans/new` (workout)
- `/dashboard/coach/plans/nutrition/new` (nutrition)

But `App.tsx` only registers these routes:
- `/dashboard/coach/plans/builder` (workout builder)
- `/dashboard/coach/plans/builder/:planId` (edit workout)
- `/dashboard/coach/nutrition` (nutrition builder)
- `/dashboard/coach/nutrition/:planId` (edit nutrition)

The `/new` routes were never registered, causing coaches to land on a 404/blank page.

---

## Fix Plan

### Step 1: Add missing `widgets.sections` translation keys

**File:** `src/i18n/locales/en/coach.json`

Add a `sections` object inside the existing `widgets` key with titles and descriptions for all 7 section keys:

```json
"sections": {
  "stats": {
    "title": "Quick Stats",
    "description": "Your key performance metrics"
  },
  "clients": {
    "title": "Your Clients",
    "description": "Active client overview"
  },
  "activity": {
    "title": "Client Activity",
    "description": "Client activity and sessions"
  },
  "actions": {
    "title": "Quick Actions",
    "description": "Common tasks"
  },
  "engagement": {
    "title": "Engagement",
    "description": "Client engagement and reviews"
  },
  "intelligence": {
    "title": "AI Insights",
    "description": "Smart recommendations for your business"
  },
  "business": {
    "title": "Business",
    "description": "Revenue, packages and subscriptions"
  }
}
```

**File:** `src/i18n/locales/pl/coach.json`

Add the same structure with Polish translations.

### Step 2: Fix plan creation routes

**Option chosen:** Update the links in `CoachPlans.tsx` and `AssignPlanModal.tsx` to point to the existing registered routes.

**File:** `src/pages/dashboard/coach/CoachPlans.tsx`

| Current Link | Fixed Link |
|-------------|-----------|
| `/dashboard/coach/plans/new` | `/dashboard/coach/plans/builder` |
| `/dashboard/coach/plans/nutrition/new` | `/dashboard/coach/nutrition` |
| `/dashboard/coach/plans/new?duplicate=ID` | `/dashboard/coach/plans/builder?duplicate=ID` |
| `/dashboard/coach/plans/nutrition/new?duplicate=ID` | `/dashboard/coach/nutrition?duplicate=ID` |

**File:** `src/components/dashboard/clients/AssignPlanModal.tsx`

| Current | Fixed |
|---------|-------|
| `/dashboard/coach/plans/new` | `/dashboard/coach/plans/builder` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/i18n/locales/en/coach.json` | Add `widgets.sections` with 7 section title/description pairs |
| `src/i18n/locales/pl/coach.json` | Add Polish `widgets.sections` translations |
| `src/pages/dashboard/coach/CoachPlans.tsx` | Fix 5 links from `/plans/new` and `/plans/nutrition/new` to `/plans/builder` and `/nutrition` |
| `src/components/dashboard/clients/AssignPlanModal.tsx` | Fix 1 link from `/plans/new` to `/plans/builder` |
