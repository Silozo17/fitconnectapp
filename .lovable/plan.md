
# Add Gym Account to View Switcher and Fix Login Routing

## Problem

When a gym owner/staff logs in via the unified login page (`/auth`), the system only checks their `user_roles` entry (which is "client" by default for gym registrations). This causes:

1. They get redirected to `/dashboard/client` instead of their gym dashboard
2. The client dashboard tries to load a `client_profiles` record that doesn't exist
3. The ViewSwitcher only shows Admin/Coach/Client -- no Gym option
4. The user gets prompted to "become a client/coach" instead of reaching their gym

## Solution

### 1. Extend ViewMode to include "gym"

**File:** `src/lib/view-restoration.ts`

- Add `'gym'` to the `ViewMode` type: `'admin' | 'coach' | 'client' | 'gym'`
- Update `getDefaultDashboardForRole` to handle gym users (new check)
- Update `validateRouteForRole` to allow gym routes (`/gym-admin/`)

### 2. Extend AdminContext to detect gym profiles

**File:** `src/contexts/AdminContext.tsx`

- Add `gym` to `AvailableProfiles` interface: `gym?: { id: string; name: string }`
- In `fetchProfiles`, also query `gym_profiles` (owned) and `gym_staff` (staff member) to detect gym access
- When `activeProfileType` is `'gym'`, store the gym ID for navigation

### 3. Add Gym option to ViewSwitcher

**File:** `src/components/admin/ViewSwitcher.tsx`

- Add a `Building2` icon "Gym" option in the Select dropdown
- When selected, navigate to `/gym-admin/{gymId}` using the stored gym ID
- If user has multiple gyms, navigate to `/gym-login` (gym selection page)
- No "create gym" option in the switcher (gym registration is a separate flow)

### 4. Fix login redirect flow in Auth.tsx

**File:** `src/pages/Auth.tsx`

In the `handleRedirect` effect (line 143), after checking role, also check if the user owns/staffs any gyms:

```text
if role === "client":
  1. Check gym_profiles WHERE user_id = user.id
  2. Check gym_staff WHERE user_id = user.id AND status = 'active'
  3. If gyms found AND no client_profiles exists:
     -> Redirect to /gym-admin/{gymId} (single gym) or /gym-login (multi)
  4. If both gym AND client profile exist:
     -> Redirect to last saved view (gym or client dashboard)
  5. If only client profile exists:
     -> Existing behavior (client dashboard)
```

### 5. Fix GuestOnlyRoute redirect

**File:** `src/components/auth/GuestOnlyRoute.tsx`

Currently redirects all authenticated users to `/dashboard/client` by default. Update to:
- Check localStorage for `selectedGymId` -- if present and user role is "client", redirect to `/gym-admin/{gymId}` instead
- This handles the case where a gym user refreshes a public page

### 6. Fix DashboardRedirect

**File:** `src/pages/dashboard/DashboardRedirect.tsx`

Update `getBestDashboardRoute` logic or add a gym-aware check:
- If saved view state has viewMode "gym", redirect to `/gym-admin/{gymId}` using stored gym ID
- Otherwise fall through to existing role-based logic

### 7. Translation keys

**Files:** `src/i18n/locales/en/admin.json`, `src/i18n/locales/pl/admin.json`

Add: `viewSwitcher.gymView` = "Gym Dashboard" / "Panel Siłowni"

---

## Technical Details

### View Mode Flow

```text
User logs in
  |
  v
Auth.tsx handleRedirect
  |
  +-- role = admin/manager/staff --> /dashboard/admin
  +-- role = coach --> /dashboard/coach  
  +-- role = client -->
        |
        +-- Has gym_profiles or gym_staff? 
        |     |
        |     +-- YES, no client_profile --> /gym-admin/{id}
        |     +-- YES, has client_profile --> restore saved view (gym or client)
        |     +-- NO --> /dashboard/client (existing behavior)
```

### ViewSwitcher with Gym

The switcher will show up to 4 options:
- Admin (if admin role)
- Coach (or "Become Coach")  
- Client (or "Become Client")
- Gym (if user has gym access -- shows gym name)

When "Gym" is selected and user has multiple gyms, navigate to `/gym-login` (the existing gym selection page). When they have one gym, go directly to `/gym-admin/{gymId}`.

### Files Changed

| File | Change |
|------|--------|
| `src/lib/view-restoration.ts` | Add 'gym' to ViewMode, update route helpers |
| `src/contexts/AdminContext.tsx` | Add gym profile detection to fetchProfiles |
| `src/components/admin/ViewSwitcher.tsx` | Add Gym option with Building2 icon |
| `src/pages/Auth.tsx` | Check gym access in login redirect |
| `src/components/auth/GuestOnlyRoute.tsx` | Handle gym user redirect |
| `src/pages/dashboard/DashboardRedirect.tsx` | Support gym view restoration |
| `src/i18n/locales/en/admin.json` | Add gymView key |
| `src/i18n/locales/pl/admin.json` | Add gymView key (Polish) |

### No Database Changes

All gym data already exists in `gym_profiles` and `gym_staff` tables. No schema changes needed.
