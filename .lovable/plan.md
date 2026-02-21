

# Community Management Enhancements: Invites, Packages, Events, and Secure Video Embeds

## Overview

This plan adds coach community management features (member invites, free access grants, linked packages/classes), and upgrades the classroom lesson editor with preview images and secure embedded video (no YouTube branding, restricted controls).

---

## Part 1: Database Schema Changes

### New table: `community_invitations`
Tracks invite links and direct email invitations coaches send for their communities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| community_id | uuid FK | |
| coach_id | uuid FK | |
| invite_code | text UNIQUE | Short unique code for invite link |
| email | text nullable | For direct email invites |
| is_free_access | boolean default false | Grant free access to paid communities |
| max_uses | int nullable | null = unlimited |
| uses_count | int default 0 | |
| expires_at | timestamptz nullable | |
| created_at | timestamptz | |

### New table: `community_linked_packages`
Links existing coach_packages to a community so members get them free.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| community_id | uuid FK | |
| package_id | uuid FK to coach_packages | |
| is_free_for_members | boolean default true | |
| created_at | timestamptz | |
| UNIQUE(community_id, package_id) | | |

### New table: `community_linked_products`
Links existing digital_products to a community.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| community_id | uuid FK | |
| product_id | uuid FK to digital_products | |
| is_free_for_members | boolean default true | |
| created_at | timestamptz | |
| UNIQUE(community_id, product_id) | | |

### ALTER `community_lessons`
- Add `preview_image_url` (text, nullable) -- thumbnail/preview image for the lesson
- Add `embed_mode` (text, default 'standard') -- 'standard' or 'restricted' (controls off)

### ALTER `community_modules`
- Add `preview_image_url` (text, nullable) -- thumbnail for the module

### RLS Policies
- `community_invitations`: coach can CRUD own invitations; anyone can SELECT by invite_code (for redemption)
- `community_linked_packages`: coach can CRUD for own communities; members can SELECT
- `community_linked_products`: same pattern

---

## Part 2: Invite System (Coach Side)

### CoachCommunityDetail.tsx -- New "Settings" tab

Add a 4th tab alongside Feed, Classroom, Members called **"Settings"** (or expand Members tab) with:

1. **Invite Link Generator**
   - "Create Invite Link" button
   - Options: max uses, expiry, grant free access toggle
   - Displays generated link (e.g., `https://fitconnectapp.lovable.app/invite/{code}`)
   - Copy-to-clipboard button
   - List of active invites with usage stats

2. **Direct Email Invite**
   - Email input field
   - "Grant free access" toggle (bypasses Stripe for paid communities)
   - Sends invite (inserts row + could send notification)

3. **Member Management** (enhance existing Members tab)
   - Show member names (currently shows truncated user_id)
   - Role dropdown: member / moderator / admin
   - "Remove Member" button
   - "Grant Free Access" toggle per member

### New Hook: `useCommunityInvitations`
- `useCreateInvite`, `useInvites`, `useDeleteInvite`, `useRedeemInvite`

### Invite Redemption Flow
- New route `/invite/:code` that:
  1. Looks up the invite
  2. If user is logged in, redeems it (adds to community_members, increments uses_count)
  3. If `is_free_access` is true on invite, bypasses payment for paid communities
  4. If not logged in, redirects to auth with return URL

---

## Part 3: Link Packages, Products, and Classes to Community

### CoachCommunityDetail.tsx -- New "Content" or "Resources" sub-section in Settings tab

1. **Link Existing Packages**
   - Dropdown listing coach's `coach_packages` (from existing query)
   - "Add to Community" button
   - Toggle: "Free for members" (default on)
   - Shows list of linked packages with remove button

2. **Link Existing Digital Products**
   - Same pattern using `digital_products`
   - "Free for members" toggle

3. **Link Classes/Events**
   - The `coach_group_classes` table already has `community_id` FK
   - Show a picker to link existing classes or create new ones tied to this community
   - Classes linked to community are visible in the community feed/classroom

### Client-side display
- In `ClientCommunityDetail.tsx`, add a **"Resources"** tab showing:
  - Linked packages (with "Claim" button if free for members, or "View" button)
  - Linked digital products (same)
  - Linked classes/events (with booking/join capability)

### New Hooks
- `useCommunityLinkedPackages(communityId)` -- fetches from `community_linked_packages` joined with `coach_packages`
- `useLinkPackage`, `useUnlinkPackage`
- Same for products: `useCommunityLinkedProducts`, etc.

---

## Part 4: Classroom Lesson Enhancements

### Preview Image for Lessons and Modules

1. **Database**: `preview_image_url` column added (Part 1)

2. **Coach Add/Edit Lesson Dialog** (`CoachCommunityDetail.tsx` ModuleCard):
   - Add "Preview Image" field with URL input
   - Show image thumbnail preview when URL is provided
   - Update `useCreateLesson` / `useUpdateLesson` to include `preview_image_url`

3. **Client Lesson List** (`ClientCommunityDetail.tsx`):
   - Show preview image thumbnail next to lesson title in the module listing
   - Show larger preview image at top of LessonViewer

### Secure Video Embed (Restricted Mode)

Update `VideoEmbed` component to support a `restricted` prop:

```text
When restricted=true:
- YouTube: append ?modestbranding=1&rel=0&controls=0&disablekb=1&fs=0 to embed URL
  Add CSS overlay to block right-click / YouTube logo click
  Only show custom play/pause, volume, and seek controls
- Vimeo: append ?title=0&byline=0&portrait=0&controls=0
- Direct video: use controlsList="nodownload nofullscreen noremoteplayback"
```

Implementation approach:
- Add `restricted?: boolean` prop to `VideoEmbed`
- For YouTube in restricted mode: use `?modestbranding=1&rel=0&controls=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3` + wrap iframe in a container with pointer-events overlay that blocks interaction with YouTube branding while allowing the embedded player's basic controls
- For Vimeo: similar restricted params
- For direct video: use native `<video>` with `controlsList="nodownload"` and custom minimal controls (play/pause, volume, seekbar)
- In classroom context, always pass `restricted={true}` for lessons
- In feed posts, keep standard embeds (coach choice)

### Lesson Edit Dialog Updates
- Add "Video Embed" section with:
  - URL input (existing)
  - Live preview of embedded video (existing but enhance)
  - "Restricted mode" toggle (default on for classroom content)
- Add "Preview Image URL" input with thumbnail preview

---

## Part 5: Translation Keys

Add to `en/coach.json` and `pl/coach.json` under `community`:
- `inviteMembers`, `createInviteLink`, `inviteCode`, `maxUses`, `unlimited`, `expiresAt`, `grantFreeAccess`, `grantFreeAccessDesc`, `copyLink`, `linkCopied`, `activeInvites`, `noInvites`, `deleteInvite`
- `inviteByEmail`, `emailPlaceholder`, `sendInvite`, `inviteSent`
- `linkedPackages`, `linkPackage`, `unlinkPackage`, `freeForMembers`, `noLinkedPackages`
- `linkedProducts`, `linkProduct`, `unlinkProduct`, `noLinkedProducts`
- `linkedClasses`, `linkClass`
- `settings`, `resources`
- `previewImage`, `previewImageUrl`, `previewImagePlaceholder`
- `restrictedVideo`, `restrictedVideoDesc`
- `manageMember`, `changeRole`, `removeMember`, `removeConfirm`

Add to `en/client.json` and `pl/client.json`:
- `community.resources`, `community.claimPackage`, `community.viewProduct`, `community.joinClass`
- `community.inviteRedeemed`, `community.inviteExpired`, `community.inviteInvalid`

---

## Implementation Order

| Step | Description | Size |
|------|-------------|------|
| 1 | Database migration: new tables + ALTER lessons/modules | Medium |
| 2 | VideoEmbed restricted mode | Medium |
| 3 | Invite system: hooks + coach UI + redemption route | Large |
| 4 | Link packages/products/classes: hooks + coach UI | Medium |
| 5 | Classroom preview images: lesson editor + client display | Small |
| 6 | Client-side Resources tab + claim/view flows | Medium |
| 7 | Member management: names, roles, remove | Medium |
| 8 | All translation keys | Small |

## Files Summary

| File | Change |
|------|--------|
| Database migration | New tables + ALTER community_lessons/modules |
| `src/components/shared/VideoEmbed.tsx` | Add `restricted` prop with YouTube/Vimeo restricted params + overlay |
| `src/hooks/useCommunityInvitations.ts` | NEW -- invite CRUD + redemption hooks |
| `src/hooks/useCommunityLinkedContent.ts` | NEW -- link/unlink packages, products, classes |
| `src/hooks/useCommunity.ts` | Add member role update + remove mutations |
| `src/hooks/useCommunityClassroom.ts` | Add preview_image_url + embed_mode to types and mutations |
| `src/pages/dashboard/coach/CoachCommunityDetail.tsx` | Add Settings tab with invite system, linked content, member management |
| `src/pages/dashboard/client/ClientCommunityDetail.tsx` | Add Resources tab, preview images in classroom, restricted video |
| `src/pages/InviteRedeem.tsx` | NEW -- invite code redemption page |
| `src/i18n/locales/en/coach.json` | New community management keys |
| `src/i18n/locales/pl/coach.json` | Same in Polish |
| `src/i18n/locales/en/client.json` | Resource + invite keys |
| `src/i18n/locales/pl/client.json` | Same in Polish |
| App router | Add `/invite/:code` route |

