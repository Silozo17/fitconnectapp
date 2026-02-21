

# Fix: Duplicate JSON Keys Causing Missing Translations on Coach Dashboard

## Root Cause

The `en/coach.json` (and `pl/coach.json`) files have **duplicate top-level `"widgets"` keys**. In JSON, when a key appears twice, the last value wins. This means:

- **First `"widgets"` (line 22):** Contains `emptyStates`, `pipeline`, `connectionRequests`, AND `sections` -- all the keys needed by the dashboard
- **Second `"widgets"` (line 1854):** Contains ONLY `sections` -- this was added during the recent community/navigation update and **silently overwrites** the first block

As a result, all of these are lost at runtime:
- `widgets.emptyStates.recentClients.title` / `.description`
- `widgets.pipeline.title` / `.totalLeads` / `.conversionRate` / `.viewPipeline` / `.stages.*`
- `widgets.connectionRequests.title` / `.emptyTitle` / `.emptyDescription`

The same duplicate exists in `pl/coach.json` (line 22 and line 1847).

## Fix

### Step 1: Merge duplicate `"widgets"` blocks in `en/coach.json`

Remove the second `"widgets"` block (lines 1854-1884) entirely. Its only content (`sections`) already exists in the first `"widgets"` block (lines 74-103), so nothing is lost.

### Step 2: Merge duplicate `"widgets"` blocks in `pl/coach.json`

Same fix -- remove the second duplicate `"widgets"` block.

### Step 3: Fix `viewAll` cross-namespace reference

The `UpcomingSessionsWidget` and `ReviewsWidget` use `t("common:viewAll")`, but `viewAll` in `common.json` is nested at `common.viewAll` (inside a `"common"` object), not at the root. Fix to `t("common:common.viewAll")`.

## Files Changed

| File | Change |
|------|--------|
| `src/i18n/locales/en/coach.json` | Remove duplicate `"widgets"` block (lines 1854-1884) |
| `src/i18n/locales/pl/coach.json` | Remove duplicate `"widgets"` block |
| `src/components/dashboard/coach/widgets/UpcomingSessionsWidget.tsx` | Fix `viewAll` key path |
| `src/components/dashboard/coach/widgets/ReviewsWidget.tsx` | Fix `viewAll` key path |

No database changes. No new files. This is purely a localization fix.
