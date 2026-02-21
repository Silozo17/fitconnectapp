

# Video Embeds + Skool-style Community Classroom + Community Pricing

This plan adds three interconnected capabilities:
1. **Video embed support** across the platform (YouTube, Vimeo, etc.)
2. **Community Classroom** (Skool-style) -- structured course/lesson content inside communities
3. **Community pricing** -- paid communities with subscription plans, packages, and discounts

---

## Part 1: Video Embed Support

### Problem
Currently `digital_products` has a `video_url` field and `preview_url`, but the UI only supports direct video files (`<video>` tag) or raw iframes. There is no intelligent YouTube/Vimeo embed detection. Community posts have no video embed capability at all.

### Solution
Create a shared `VideoEmbed` component that:
- Detects YouTube, Vimeo, Loom, Wistia URLs and converts them to proper embed iframes
- Falls back to `<video>` tag for direct file URLs
- Sanitizes embed URLs (only allow known hosts)
- Is reusable across: digital products, community posts, and classroom lessons

### Changes

**New shared component:** `src/components/shared/VideoEmbed.tsx`
- Accepts a `url` string prop
- Parses the URL to detect platform (YouTube, Vimeo, Loom, etc.)
- Renders the appropriate embed iframe with proper sandbox attributes
- Responsive aspect-ratio container (16:9)

**Update `community_posts` table** -- add `embed_url` column (text, nullable) for embedding videos in posts

**Update `CreatePostForm` in both coach and client community detail pages:**
- Add a "Video" post type button alongside existing poll/announcement
- When selected, show an input field for pasting a YouTube/Vimeo/other URL
- Store in `embed_url` column
- Render using the shared `VideoEmbed` component in post cards

**Update `MarketplaceProduct.tsx`:**
- Replace the raw `<video>` / `<iframe>` preview with the new `VideoEmbed` component
- This means YouTube links in `preview_url` or `video_url` will render properly as embeds

**Update `PostCard` components** (both coach and client):
- If post has `embed_url`, render `VideoEmbed` below the text content

### URL Parsing Logic (inside VideoEmbed)
```
YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  -> https://www.youtube.com/embed/ID

Vimeo: vimeo.com/ID
  -> https://player.vimeo.com/video/ID

Loom: loom.com/share/ID
  -> https://www.loom.com/embed/ID

Other: render as <video> with controls, or show link
```

---

## Part 2: Community Classroom (Skool-style)

### Concept
Like Skool, each community gets a "Classroom" tab where the coach organizes structured content into **modules** and **lessons**. Members who join (or pay for) the community get access to all classroom content. This is different from individual digital products -- classroom content is tied to the community membership.

### Database Schema

**`community_modules`** -- Course sections/chapters
- `id` (uuid, PK)
- `community_id` (uuid, FK to communities)
- `title` (text)
- `description` (text, nullable)
- `display_order` (integer, default 0)
- `is_published` (boolean, default true)
- `created_at`, `updated_at`

**`community_lessons`** -- Individual lessons within modules
- `id` (uuid, PK)
- `module_id` (uuid, FK to community_modules)
- `community_id` (uuid, FK to communities) -- denormalized for faster queries
- `title` (text)
- `description` (text, nullable)
- `content` (text, nullable) -- rich text/markdown lesson content
- `video_url` (text, nullable) -- YouTube/Vimeo embed URL
- `file_urls` (text[], nullable) -- downloadable attachments
- `duration_minutes` (integer, nullable)
- `display_order` (integer, default 0)
- `is_published` (boolean, default true)
- `is_free_preview` (boolean, default false) -- allow non-members to preview this lesson
- `created_at`, `updated_at`

**`community_lesson_progress`** -- Track which lessons members have completed
- `id` (uuid, PK)
- `lesson_id` (uuid, FK to community_lessons)
- `user_id` (uuid, FK to auth.users)
- `completed_at` (timestamptz, nullable)
- `last_watched_seconds` (integer, default 0) -- resume position
- Unique constraint on (lesson_id, user_id)

### RLS Policies
- Modules/lessons: readable by community members (or free preview lessons for anyone); writable only by community admin (coach)
- Lesson progress: users can read/write their own progress

### Frontend Changes

**Coach Community Detail page** -- add a "Classroom" tab alongside Feed and Members:
- List modules with drag-and-drop reorder (using existing @dnd-kit)
- Each module expands to show lessons
- "Add Module" / "Add Lesson" buttons
- Lesson editor: title, description, video URL (uses VideoEmbed for preview), content (textarea), file attachments, free preview toggle
- Publish/unpublish toggle per module/lesson

**Client Community Detail page** -- add a "Classroom" tab:
- List modules and lessons in a sidebar/accordion layout
- Click a lesson to view: video embed at top, content below, "Mark Complete" button
- Progress bar showing completion percentage per module and overall
- Free preview lessons accessible even before joining/paying

**New hooks:** `src/hooks/useCommunityClassroom.ts`
- `useCommunityModules(communityId)` -- fetch modules with lesson count
- `useCommunityLessons(moduleId)` -- fetch lessons for a module
- `useCreateModule`, `useUpdateModule`, `useDeleteModule`
- `useCreateLesson`, `useUpdateLesson`, `useDeleteLesson`
- `useReorderModules`, `useReorderLessons`
- `useLessonProgress(communityId)` -- fetch user's progress
- `useMarkLessonComplete` -- toggle completion

---

## Part 3: Community Pricing and Access Control

### Concept
Coaches can set their communities as free or paid. Paid communities require a subscription or one-time payment to join. This transforms communities from simple free groups into monetizable Skool-style products.

### Database Schema Changes

**ALTER `communities`** -- add pricing columns:
- `access_type` (text, default 'free') -- 'free', 'paid', 'subscription'
- `price` (numeric, nullable) -- one-time access price
- `monthly_price` (numeric, nullable) -- recurring monthly subscription
- `currency` (text, default 'GBP')
- `trial_days` (integer, default 0) -- free trial period for subscriptions
- `discount_code` (text, nullable) -- simple discount code
- `discount_percent` (integer, nullable) -- percentage off (0-100)
- `max_members` (integer, nullable) -- cap on membership

**`community_subscriptions`** -- Track paid memberships
- `id` (uuid, PK)
- `community_id` (uuid, FK to communities)
- `user_id` (uuid, FK to auth.users)
- `status` (text: 'active', 'cancelled', 'expired', 'trial')
- `amount_paid` (numeric)
- `currency` (text)
- `started_at` (timestamptz)
- `expires_at` (timestamptz, nullable)
- `cancelled_at` (timestamptz, nullable)
- `stripe_subscription_id` (text, nullable) -- for recurring billing
- `created_at`

### Access Control Logic
- Free communities: anyone can join (existing behavior)
- Paid communities: joining triggers a checkout flow (using the existing Stripe checkout infrastructure)
- Subscription communities: monthly billing via Stripe
- Discount codes: coach sets a code + percentage; client enters at checkout for reduced price
- Trial: for subscription communities, X days free before billing starts

### Frontend Changes

**Coach Community create/edit dialog** -- add pricing fields:
- Access type selector: Free / One-time Payment / Monthly Subscription
- Price field (shown for paid/subscription)
- Trial days (shown for subscription)
- Discount code + percentage fields
- Max members cap

**Client Community discovery/join flow:**
- Free communities: "Join" button (existing)
- Paid communities: "Join" button shows price, redirects to checkout
- Subscription communities: shows monthly price, checkout for subscription
- Discount code input at checkout
- Show "Free Trial: X days" badge

**Coach community dashboard:**
- Revenue summary per community
- Active subscriber count
- Discount code usage stats

### Translation Keys
Add keys for pricing, access types, subscription status, discount codes, trial period, etc. to all 4 locale files (en/pl coach/client).

---

## Implementation Order

| Step | Description | Scope |
|------|------------|-------|
| 1 | `VideoEmbed` shared component + URL parser | Small |
| 2 | Add `embed_url` to `community_posts` + post creation UI | Small |
| 3 | Update `PostCard` (coach + client) to render embeds | Small |
| 4 | Update `MarketplaceProduct` preview to use `VideoEmbed` | Small |
| 5 | Database migration: `community_modules`, `community_lessons`, `community_lesson_progress` | Medium |
| 6 | `useCommunityClassroom` hooks | Medium |
| 7 | Coach Classroom tab: module/lesson CRUD + reorder | Large |
| 8 | Client Classroom tab: lesson viewer + progress tracking | Large |
| 9 | Database migration: pricing columns on `communities` + `community_subscriptions` table | Medium |
| 10 | Coach community pricing UI (create/edit dialog) | Medium |
| 11 | Client join flow with checkout for paid communities | Medium |
| 12 | Translation keys for all new features | Small |

---

## Summary of Files

| File | Change |
|------|--------|
| `src/components/shared/VideoEmbed.tsx` | NEW -- reusable video embed component |
| `src/hooks/useCommunityClassroom.ts` | NEW -- classroom CRUD hooks |
| `src/hooks/useCommunity.ts` | UPDATE -- add embed_url to post types, new subscription hooks |
| `src/pages/dashboard/coach/CoachCommunityDetail.tsx` | UPDATE -- add Classroom tab, video embeds in posts |
| `src/pages/dashboard/client/ClientCommunityDetail.tsx` | UPDATE -- add Classroom tab, video embeds in posts |
| `src/pages/dashboard/coach/CoachCommunity.tsx` | UPDATE -- pricing fields in create/edit dialog |
| `src/pages/dashboard/client/ClientCommunity.tsx` | UPDATE -- paid join flow |
| `src/pages/MarketplaceProduct.tsx` | UPDATE -- use VideoEmbed for previews |
| Database migrations (2-3) | NEW -- embed_url column, classroom tables, pricing columns + subscriptions table |
| `src/i18n/locales/en/coach.json` | UPDATE -- classroom + pricing keys |
| `src/i18n/locales/pl/coach.json` | UPDATE -- classroom + pricing keys |
| `src/i18n/locales/en/client.json` | UPDATE -- classroom + pricing keys |
| `src/i18n/locales/pl/client.json` | UPDATE -- classroom + pricing keys |

