

# Fix Missing Translation Keys, Add Event Types to Classes, and Wire Stripe Checkout for Communities

## Problem Summary

1. **Missing translation keys in `common.json`**: The sidebars use `useTranslation()` which defaults to the `common` namespace. The keys `navigation.coach.groupClasses` and `navigation.coach.community` exist in `coach.json` but are missing from `common.json` (both EN and PL). Similarly `navigation.client.community` is in `client.json` but missing from EN `common.json` and PL `common.json`. This causes raw key strings to display in the sidebar.

2. **Group classes lack event type support**: The `coach_group_classes` table has no `event_type` column. Coaches want to create not just classes but also live events, online events, workshops, etc.

3. **Community Stripe checkout is not wired**: The `handlePaidJoin` in `ClientCommunity.tsx` just calls `joinCommunity.mutateAsync()` directly with a TODO comment. No edge function exists to handle community checkout via Stripe Connect.

---

## Part 1: Fix All Missing Translation Keys

### Files to update

**`src/i18n/locales/en/common.json`** -- Add to `navigation.coach`:
- `"groupClasses": "Group Classes"`
- `"community": "Community"`

Also add to `navigation.client`:
- `"community": "Community"`

**`src/i18n/locales/pl/common.json`** -- Add to `navigation.coach`:
- `"groupClasses": "Zajecia grupowe"`
- `"community": "Spolecznosc"`

Also add to `navigation.client`:
- `"community": "Spolecznosc"`

---

## Part 2: Expand Group Classes to Support Events

### Database Migration

ALTER `coach_group_classes` to add:
- `event_type` (text, default 'class') -- values: 'class', 'workshop', 'live_event', 'online_event', 'seminar', 'bootcamp'
- `event_format` (text, default 'in_person') -- values: 'in_person', 'online', 'hybrid'
- `online_link` (text, nullable) -- Zoom/Meet/etc URL for online events
- `start_date` (timestamptz, nullable) -- for one-off events (not recurring classes)
- `end_date` (timestamptz, nullable)
- `is_recurring` (boolean, default true) -- recurring class vs one-off event
- `community_id` (uuid, nullable, FK to communities) -- link events to a community

### Frontend Changes

**`src/components/coach/CoachGroupClassesManager.tsx`** -- Update the create/edit form:
- Add "Type" dropdown: Class, Workshop, Live Event, Online Event, Seminar, Bootcamp
- Add "Format" toggle: In-Person / Online / Hybrid
- Show "Online Link" field when format is online or hybrid
- Add "One-off Event" toggle that reveals date/time pickers
- Add optional "Link to Community" selector

**`src/hooks/useCoachGroupClasses.ts`** -- Update the `GroupClass` interface and CRUD operations to include the new fields

**Update display components** -- Show event type badges and format indicators on class/event cards

### Rename sidebar label

Update the sidebar item label from "Group Classes" to "Classes & Events" in both EN and PL:
- `en/common.json`: `"groupClasses": "Classes & Events"`
- `pl/common.json`: `"groupClasses": "Zajecia i wydarzenia"`
- `en/coach.json` navigation: same
- `pl/coach.json` navigation: same

### Translation Keys

Add keys for event types, formats, online link labels, date pickers, etc. to coach locale files.

---

## Part 3: Wire Stripe Checkout for Paid Communities

### New Edge Function: `community-checkout`

Create `supabase/functions/community-checkout/index.ts` that:
1. Authenticates the user
2. Fetches the community to get pricing (`access_type`, `price`, `monthly_price`, `currency`)
3. Fetches the coach's Stripe Connect account from `coach_profiles`
4. Validates discount code if provided
5. Creates a Stripe Checkout session:
   - `mode: "payment"` for one-time paid communities
   - `mode: "subscription"` for subscription communities (with `trial_period_days` if configured)
   - Uses `application_fee_amount` / `application_fee_percent` with `transfer_data.destination` pointing to coach's Stripe Connect account (same pattern as `stripe-checkout`)
6. Returns the checkout session URL (or clientSecret for embedded mode)

### Frontend Changes

**`src/pages/dashboard/client/ClientCommunity.tsx`**:
- Update `handlePaidJoin` to invoke `supabase.functions.invoke('community-checkout', ...)` instead of directly joining
- Pass `communityId`, `discountCode` (if entered), and `returnUrl`
- On success, redirect to Stripe checkout URL
- After successful payment return, the webhook or return-URL logic adds the member

### Webhook Handling

Update `supabase/functions/stripe-webhook/index.ts` (or the relevant webhook handler) to:
- Detect `checkout.session.completed` events with metadata `type: "community_access"` or `type: "community_subscription"`
- Insert a row into `community_members` with role `member`
- Insert a row into `community_subscriptions` with appropriate status
- Update `communities.member_count`

---

## Implementation Order

| Step | Description | Size |
|------|-------------|------|
| 1 | Add missing translation keys to EN + PL `common.json` | Small |
| 2 | Database migration: add event columns to `coach_group_classes` | Small |
| 3 | Update `CoachGroupClassesManager` UI for event types + formats | Medium |
| 4 | Update `useCoachGroupClasses` hook for new fields | Small |
| 5 | Create `community-checkout` edge function | Medium |
| 6 | Update `ClientCommunity.tsx` to use Stripe checkout for paid joins | Small |
| 7 | Update stripe webhook to handle community payments | Medium |
| 8 | Add all new translation keys (event types, checkout, etc.) | Small |

## Files Summary

| File | Change |
|------|--------|
| `src/i18n/locales/en/common.json` | Add missing nav keys |
| `src/i18n/locales/pl/common.json` | Add missing nav keys |
| `src/i18n/locales/en/coach.json` | Rename groupClasses label + event type keys |
| `src/i18n/locales/pl/coach.json` | Same in Polish |
| Database migration | Add event columns to `coach_group_classes` |
| `src/hooks/useCoachGroupClasses.ts` | Add new fields to interface + queries |
| `src/components/coach/CoachGroupClassesManager.tsx` | Event type/format UI |
| `supabase/functions/community-checkout/index.ts` | NEW -- Stripe Connect checkout for communities |
| `src/pages/dashboard/client/ClientCommunity.tsx` | Wire paid join to checkout function |
| `supabase/functions/stripe-webhook/index.ts` | Handle community payment completion |

