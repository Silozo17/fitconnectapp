

# Fix BabyLoveGrowth Integration Responsiveness

## Problem Analysis

Based on the screenshot, the BabyLoveGrowth integration card has these mobile issues:

1. **Header row is too cramped** - The title, "Connected" badge, and "Sync Now" button are squeezed horizontally, with the button getting cut off
2. **Stats grid is too tight** - Using `grid-cols-3` forces three columns on mobile, making text overflow
3. **Incorrect schedule text** - Shows "Every 15 min" but the sync is now configured for "Daily 10am UK"

---

## Solution

### File to Modify
`src/pages/dashboard/admin/AdminIntegrations.tsx`

### Changes

**1. Make Header Responsive (lines 269-300)**

Current structure:
```tsx
<div className="flex items-center justify-between mb-4">
  {/* Title + description */}
  {/* Badge + Button */}
</div>
```

Fix: Stack vertically on mobile, row on larger screens:
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
  <div className="flex items-center gap-2">
    {/* Bot icon + Title + Description */}
  </div>
  <div className="flex items-center gap-2 w-full sm:w-auto">
    {/* Badge */}
    <Button className="flex-1 sm:flex-none">Sync Now</Button>
  </div>
</div>
```

**2. Make Stats Grid Responsive (line 303)**

Current:
```tsx
<div className="grid grid-cols-3 gap-4 mb-4">
```

Fix: Stack on mobile, 3 columns on larger screens:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
```

**3. Update Schedule Text (line 325)**

Current:
```tsx
<p className="text-lg font-medium">Every 15 min</p>
```

Fix: Update to reflect new daily schedule:
```tsx
<p className="text-lg font-medium">Daily 10am</p>
```

---

## Visual Result

**Mobile (stacked layout):**
```
┌─────────────────────────────────────┐
│ 🤖 BabyLoveGrowth AI Content       │
│    Automated blog article publishing│
│                                     │
│ [● Connected]  [    Sync Now    ]  │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 📄 Articles Imported            ││
│ │    2                            ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 🕐 Last Sync                    ││
│ │    21 minutes ago               ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 🔄 Schedule                     ││
│ │    Daily 10am                   ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Desktop (side-by-side):**
```
┌──────────────────────────────────────────────────────────────┐
│ 🤖 BabyLoveGrowth AI Content          [Connected] [Sync Now] │
│    Automated blog article publishing                         │
│                                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Articles     │ │ Last Sync    │ │ Schedule     │          │
│ │ 2            │ │ 21 min ago   │ │ Daily 10am   │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

| Line(s) | Change |
|---------|--------|
| 269 | Add `flex-col sm:flex-row sm:items-center sm:justify-between gap-3` |
| 279 | Add `w-full sm:w-auto` wrapper, button gets `flex-1 sm:flex-none` |
| 303 | Change `grid-cols-3` to `grid-cols-1 sm:grid-cols-3` |
| 325 | Update text from "Every 15 min" to "Daily 10am" |

