# FitConnect Design System

## Card Components

### When to Use Which Component

| Component | Use Case | Color Themes |
|-----------|----------|--------------|
| `ContentSection` | Dashboard sections, widgets, grouped content | primary, blue, green, orange, red, purple, cyan, yellow, muted |
| `AccentCard` | Metric cards, stat displays, highlighted data | Same as ContentSection |
| `ThemedCard` | Standalone themed cards (transformations, reviews) | green, purple, orange |

### ContentSection Usage

```tsx
import { ContentSection } from "@/components/shared/ContentSection";

<ContentSection colorTheme="blue" padding="default">
  {/* Your content */}
</ContentSection>
```

**Props:**
- `colorTheme`: Color variant (default: "primary")
- `withAccent`: Show top accent line (default: true)
- `padding`: "none" | "sm" | "default" | "lg"

---

## Icon Badges

Use `IconBadge` for consistent icon backgrounds:

```tsx
import { IconBadge } from "@/components/shared/IconBadge";
import { Activity } from "lucide-react";

<IconBadge icon={Activity} size="default" color="primary" />
```

**Sizes:** sm (28px), default (36px), lg (44px)

---

## CSS Utility Classes

Available in `index.css`:

### Card Accents
- `.card-accent-primary`, `.card-accent-blue`, `.card-accent-green`, etc.

### Card Gradients
- `.card-gradient-primary`, `.card-gradient-blue`, etc.

### Combined Themed Cards
- `.card-themed-primary`, `.card-themed-blue`, etc.

### Icon Badges
- `.icon-badge-sm`, `.icon-badge-default`, `.icon-badge-lg`
- `.icon-badge-primary`, `.icon-badge-blue`, etc.

---

## Performance Requirements

### Memoization

All dashboard widgets MUST be wrapped with `memo()`:

```tsx
import { memo } from "react";

export const MyWidget = memo(function MyWidget(props) {
  // Component logic
});
```

### Computed Values

Use `useMemo` for expensive calculations:

```tsx
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);
```

### Callbacks

Use `useCallback` for event handlers passed to children:

```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

---

## Component Export Pattern

```tsx
// Named export with memo
export const ComponentName = memo(function ComponentName(props) {
  return <div>...</div>;
});

// Set displayName for DevTools
ComponentName.displayName = "ComponentName";
```

---

## Deprecated Components

These components are deprecated and should not be used in new code:

- `SectionHeader` → Use `ContentSectionHeader`
- `ContentCard` → Use `ContentSection`
- `StatCard` → Use `AccentCard` or `ContentSection`

---

## Color Theme Reference

| Theme | Background | Border | Accent |
|-------|------------|--------|--------|
| primary | primary/5 → accent/5 | border/50 | primary/60 → accent/40 |
| blue | blue-500/10 → blue-600/5 | blue-500/20 | blue-400/60 → blue-500/40 |
| green | green-500/10 → green-600/5 | green-500/20 | green-400/60 → green-500/40 |
| orange | orange-500/10 → orange-600/5 | orange-500/20 | orange-400/60 → orange-500/40 |
| red | red-500/10 → pink-600/5 | red-500/20 | red-400/60 → pink-400/40 |
| purple | purple-500/10 → indigo-600/5 | purple-500/20 | purple-400/60 → indigo-400/40 |
| cyan | cyan-500/10 → cyan-600/5 | cyan-500/20 | cyan-400/60 → cyan-500/40 |
| yellow | yellow-500/10 → amber-600/5 | yellow-500/20 | yellow-400/60 → amber-400/40 |
| muted | muted/30 → muted/20 | border/50 | muted-foreground/30 → muted-foreground/20 |
