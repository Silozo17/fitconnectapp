

# Feature Plan: Group Classes, Community, and Mixed Event Packages

This is a large set of features. Here is a phased plan to implement all three requests.

---

## Feature 1: Group Classes in Coach Sidebar

**Current state:** Group classes exist in the database (`coach_group_classes`) with full CRUD hooks (`useCoachGroupClasses.ts`), but they can only be managed from Settings > Marketplace > Group Classes. There is no dedicated sidebar menu item or page.

**Changes:**

1. **Add sidebar menu item** in `src/components/dashboard/CoachSidebar.tsx` -- add a "Group Classes" item under the "Products & Pricing" group pointing to `/dashboard/coach/classes`
2. **Add translation keys** for `navigation.coach.groupClasses` in both `en/coach.json` and `pl/coach.json`
3. **Create a dedicated page** `src/pages/dashboard/coach/CoachGroupClasses.tsx` that wraps the existing `CoachGroupClassesManager` component with the standard `DashboardLayout`, section header, and help banner
4. **Register the route** in `App.tsx` as `coach/classes` under the coach dashboard routes

---

## Feature 2: Community / Groups (Full Facebook-style)

This is the largest feature. It requires new database tables, a new page for coaches to create communities, and a new page for clients to participate.

### Database Schema (new tables)

**`communities`** -- Coach-created groups
- `id` (uuid, PK)
- `coach_id` (uuid, FK to coach_profiles)
- `name` (text)
- `description` (text)
- `cover_image_url` (text, nullable)
- `is_active` (boolean, default true)
- `is_public` (boolean, default true) -- whether non-clients can see it
- `member_count` (integer, default 0)
- `created_at`, `updated_at`

**`community_members`** -- Who belongs to each community
- `id` (uuid, PK)
- `community_id` (uuid, FK to communities)
- `user_id` (uuid, FK to auth.users)
- `role` (text: 'admin' | 'moderator' | 'member')
- `joined_at` (timestamptz)
- Unique constraint on (community_id, user_id)

**`community_posts`** -- Feed posts
- `id` (uuid, PK)
- `community_id` (uuid, FK to communities)
- `author_id` (uuid, FK to auth.users)
- `content` (text)
- `image_urls` (text[], nullable)
- `is_pinned` (boolean, default false)
- `is_announcement` (boolean, default false)
- `post_type` (text: 'text' | 'poll' | 'event' | 'file')
- `poll_data` (jsonb, nullable) -- for polls
- `event_data` (jsonb, nullable) -- for events
- `likes_count` (integer, default 0)
- `comments_count` (integer, default 0)
- `created_at`, `updated_at`

**`community_comments`** -- Comments on posts
- `id` (uuid, PK)
- `post_id` (uuid, FK to community_posts)
- `author_id` (uuid, FK to auth.users)
- `content` (text)
- `parent_comment_id` (uuid, nullable, FK to self) -- threaded replies
- `likes_count` (integer, default 0)
- `created_at`

**`community_reactions`** -- Likes/reactions
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `post_id` (uuid, nullable, FK to community_posts)
- `comment_id` (uuid, nullable, FK to community_comments)
- `reaction_type` (text, default 'like')
- `created_at`
- Unique constraint on (user_id, post_id) and (user_id, comment_id)

**`community_poll_votes`** -- Poll responses
- `id` (uuid, PK)
- `post_id` (uuid, FK to community_posts)
- `user_id` (uuid, FK to auth.users)
- `option_index` (integer)
- `created_at`
- Unique constraint on (post_id, user_id)

### RLS Policies
- Communities: visible to members; coaches can create/update their own
- Posts: readable by community members; writable by members; pinning/announcements by admin/moderator only
- Comments/reactions: readable by community members; writable by members
- Members: coaches auto-join as admin; clients join if community is public or they are coach's clients

### Realtime
- Enable realtime on `community_posts` and `community_comments` for live feed updates

### Frontend (Coach Side)
1. **Add sidebar item** "Community" under a new group or under "Client Management" in CoachSidebar
2. **Create page** `src/pages/dashboard/coach/CoachCommunity.tsx` -- list of coach's communities with create/edit/delete
3. **Community detail page** `src/pages/dashboard/coach/CoachCommunityDetail.tsx` -- the feed view with post creation, pinning, announcements, member management, polls, events
4. **Routes** in App.tsx: `coach/community` and `coach/community/:communityId`

### Frontend (Client Side)
1. **Add sidebar item** "Community" in ClientSidebar
2. **Create page** `src/pages/dashboard/client/ClientCommunity.tsx` -- list of communities the client belongs to + discover public ones
3. **Community feed page** `src/pages/dashboard/client/ClientCommunityDetail.tsx` -- view posts, comment, react, vote on polls, join events
4. **Routes** in App.tsx: `client/community` and `client/community/:communityId`

### Key Components
- `CommunityFeed` -- renders post list with infinite scroll
- `CommunityPostCard` -- individual post with reactions, comments toggle
- `CreatePostForm` -- text, image upload, poll creation, event creation
- `CommunityComments` -- threaded comment view
- `CommunityMembersList` -- manage members (coach view)
- `PollWidget` -- vote and see results
- `PinnedPostBanner` -- pinned/announcement display at top

### Hooks
- `useCommunities` -- CRUD for communities
- `useCommunityPosts` -- fetch/create/update/delete posts with pagination
- `useCommunityComments` -- fetch/create comments
- `useCommunityReactions` -- toggle like/reaction
- `useCommunityMembers` -- manage members, join/leave
- `usePollVotes` -- vote on polls

### Translation Keys
- Add `community` section to both `en/coach.json`, `pl/coach.json`, `en/client.json`, `pl/client.json`

---

## Feature 3: Mixed Event Packages (Hybrid In-Person + Online)

**Current state:** `coach_packages` has `session_count`, `price`, `validity_days`, `session_duration_minutes` -- no concept of mixed session types, multi-month billing, or group sizing.

### Database Changes (ALTER `coach_packages`)

New columns:
- `in_person_sessions` (integer, nullable) -- number of in-person sessions per period
- `online_sessions` (integer, nullable) -- number of online sessions per period
- `is_hybrid` (boolean, default false) -- whether this is a mixed package
- `billing_months` (integer, default 1) -- package duration in months (e.g., 2 for a 2-month package)
- `min_group_size` (integer, default 1) -- minimum group size (1 = individual)
- `max_group_size` (integer, default 1) -- maximum group size
- `is_group_package` (boolean, default false) -- whether this is for groups of 2+
- `sessions_per_month` (integer, nullable) -- total sessions per month for recurring packages

### Frontend Changes

1. **Update `CreatePackageModal`** to add:
   - Toggle for "Hybrid Package" which reveals in-person + online session count fields
   - "Group Package" toggle with min/max group size fields
   - "Package Duration" field (months)
   - Sessions per month breakdown display
2. **Update `PackageCard`** in `CoachPackages.tsx` to display hybrid session breakdown and group size info
3. **Update `usePackages` hook** to handle the new fields
4. **Update client-facing package display** to show "2 In-Person + 2 Online per month" style descriptions

### Translation Keys
- Add keys for hybrid package labels, group size labels, monthly breakdown etc.

---

## Implementation Order

Given the dependencies and complexity:

1. **Phase A** (quick win): Group Classes sidebar + dedicated page
2. **Phase B** (medium): Mixed Event Packages schema + UI updates
3. **Phase C** (large): Community feature -- database, hooks, coach pages, client pages

Each phase can be implemented and tested independently.

---

## Summary of Files

| Phase | New/Modified File | Purpose |
|-------|------------------|---------|
| A | `src/components/dashboard/CoachSidebar.tsx` | Add Group Classes menu item |
| A | `src/pages/dashboard/coach/CoachGroupClasses.tsx` | New dedicated page |
| A | `src/App.tsx` | Register new route |
| A | `src/i18n/locales/en/coach.json` + `pl/coach.json` | Translation keys |
| B | Database migration | Add hybrid/group columns to coach_packages |
| B | `src/components/packages/CreatePackageModal.tsx` | Hybrid + group fields |
| B | `src/pages/dashboard/coach/CoachPackages.tsx` | Display hybrid/group info |
| B | `src/hooks/usePackages.ts` | Handle new fields |
| C | Database migration | 6 new community tables + RLS |
| C | `src/pages/dashboard/coach/CoachCommunity.tsx` | Coach community list |
| C | `src/pages/dashboard/coach/CoachCommunityDetail.tsx` | Coach community feed |
| C | `src/pages/dashboard/client/ClientCommunity.tsx` | Client community list |
| C | `src/pages/dashboard/client/ClientCommunityDetail.tsx` | Client community feed |
| C | `src/components/community/*` | 7+ shared components |
| C | `src/hooks/useCommunity*.ts` | 6 new hooks |
| C | `src/components/dashboard/CoachSidebar.tsx` | Add Community item |
| C | `src/components/dashboard/ClientSidebar.tsx` | Add Community item |
| C | Both sidebars + App.tsx + i18n files | Routes and translations |

