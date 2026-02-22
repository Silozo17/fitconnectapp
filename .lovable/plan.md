
# Add Comprehensive Sports Specialties for Coaches

## Overview

The current `COACH_TYPES` in `src/constants/coachTypes.ts` only has 6 categories with ~40 types, missing major sports like football, tennis, basketball, cricket, golf, etc. The discipline catalog (`catalog.ts`) already has many of these for clients, but coaches can't select them during onboarding. This update adds 5 new categories and ~50 new coach specialties.

## Changes

### File: `src/constants/coachTypes.ts`

Add 5 new categories and their corresponding types:

**New Categories:**
- `teamSports` -- "Team Sports" (Trophy icon)
- `racket` -- "Racket Sports" (Target icon)
- `water` -- "Water & Aquatic" (Wind icon)
- `winter` -- "Winter Sports" (Snowflake icon -- new import)
- `outdoor` -- "Outdoor & Adventure" (Mountain icon -- new import)

**New Coach Types (~50 additions):**

| Category | Types |
|----------|-------|
| **Combat** (existing, add 3) | Judo, Taekwondo, Krav Maga |
| **Team Sports** (new) | Football, Basketball, American Football, Rugby, Ice Hockey, Volleyball, Handball, Cricket, Baseball, Softball, Lacrosse, Field Hockey, Netball, Water Polo |
| **Racket Sports** (new) | Tennis, Badminton, Squash, Table Tennis, Padel, Pickleball |
| **Fitness** (existing, add 4) | Cycling, Triathlon, Dance Fitness, Gymnastics |
| **Water & Aquatic** (new) | Swimming, Diving, Surfing, Rowing, Sailing, Kayaking |
| **Winter Sports** (new) | Skiing, Snowboarding, Figure Skating, Speed Skating |
| **Outdoor & Adventure** (new) | Rock Climbing, Hiking, Trail Running, Obstacle Course Racing, Horse Riding, Archery, Fencing, Skateboarding |
| **Specialist** (existing, add 3) | Golf Coach, Esports Performance, Adaptive/Para Sports |

**Icon imports to add:** `Mountain`, `Snowflake`, `Waves` (or reuse `Wind`), `Bike`, `Volleyball` (if available, else `Users`)

Since Lucide doesn't have sport-specific icons for every sport, we'll reuse contextually appropriate icons (e.g., `Trophy` for team sports, `Target` for racket, `Wind`/`Waves` for water).

### File: `src/pages/onboarding/CoachOnboarding.tsx`

No structural changes needed -- the onboarding "Specialties" step already iterates over `COACH_TYPE_CATEGORIES` and renders all types per category dynamically. Adding categories/types to the constants file automatically populates the onboarding UI.

However, with 11 categories and 90+ types, the step will be long. Add a **search/filter input** at the top of the Specialties step so coaches can quickly find their sport:
- A simple text input that filters the displayed types by name
- Categories with no matching types are hidden
- This keeps the step usable despite the large list

### File: `src/components/coach/CoachTypeSelector.tsx`

This component (used in Coach Settings) also iterates over `COACH_TYPE_CATEGORIES`. Verify it handles the new categories -- it should work automatically since it uses the same constants. Add the same search filter here for consistency.

### Translation files

No translation changes needed -- coach type labels are stored as plain English strings in the constants file and displayed directly. The `getCoachTypeDisplayLabel` helper already handles title-casing for any ID.

## Technical Notes

- The `coach_types` column in `coach_profiles` is a text array (`text[]`), so any string value is valid -- no database migration needed
- The `primary_coach_type` field is also `text`, so new IDs work immediately
- Client search filters in `CoachFilters.tsx` also use `COACH_TYPE_CATEGORIES` and will automatically show the new categories
- Existing coaches with old type IDs are unaffected -- no data migration required
- The discipline catalog (for client tracking) is separate from coach types and doesn't need changes here

## Files to Modify

| File | Change |
|------|--------|
| `src/constants/coachTypes.ts` | Add 5 new categories, ~50 new types, new icon imports |
| `src/pages/onboarding/CoachOnboarding.tsx` | Add search filter input to Specialties step |
| `src/components/coach/CoachTypeSelector.tsx` | Add search filter for consistency |
