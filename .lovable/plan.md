

# BabyLoveGrowth.ai Integration Implementation Plan

## Overview

Implement a fully automated content sync from BabyLoveGrowth.ai API to auto-publish blog articles. The system will fetch new articles every 15 minutes and publish them directly to your blog.

---

## Step 1: Database Schema Updates

Add columns and table to track imported articles and sync history.

**Migration SQL:**
```sql
-- Add external tracking columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS external_source TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_external_id ON blog_posts(external_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_external_source ON blog_posts(external_source);

-- Create sync log table to track import history
CREATE TABLE IF NOT EXISTS integration_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  articles_imported INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for sync log (admin only)
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON integration_sync_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert sync logs"
  ON integration_sync_log FOR INSERT
  WITH CHECK (true);
```

---

## Step 2: Create Edge Function

**File:** `supabase/functions/sync-babylovegrowth/index.ts`

The function will:
1. Fetch articles from BabyLoveGrowth API using `X-API-Key` header
2. Filter to only new articles (created after last sync)
3. Upsert each article into `blog_posts` with `is_published = true`
4. Log the sync result to `integration_sync_log`
5. Handle pagination for large article sets

**Key features:**
- Duplicate prevention via `external_id` unique constraint
- Reading time calculation from content length
- Slug generation from title if not provided
- Excerpt extraction from meta_description or content

**Config update** (`supabase/config.toml`):
```toml
[functions.sync-babylovegrowth]
verify_jwt = false
```

---

## Step 3: Create React Hook

**File:** `src/hooks/useBabyLoveGrowthSync.ts`

Hook providing:
- `syncHistory` - Last 10 sync attempts with status
- `lastSync` - Most recent successful sync timestamp
- `importedCount` - Total articles imported
- `triggerSync` - Mutation to manually trigger sync
- `isConnected` - Whether API key is configured

---

## Step 4: Update Admin Integrations Page

**File:** `src/pages/dashboard/admin/AdminIntegrations.tsx`

Add BabyLoveGrowth section with:
- Connection status indicator
- Last sync timestamp
- Total articles imported count
- "Sync Now" button for manual trigger
- Recent sync history table
- Link to configure API key

---

## Step 5: Set Up Automated Sync (pg_cron)

After implementation, run this SQL to enable 15-minute auto-sync:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule sync every 15 minutes
SELECT cron.schedule(
  'babylovegrowth-sync',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ntgfihgneyoxxbwmtceq.supabase.co/functions/v1/sync-babylovegrowth',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Field Mapping

| BabyLoveGrowth | blog_posts | Notes |
|----------------|------------|-------|
| `id` | `external_id` | String, unique |
| `title` | `title` | Direct |
| `slug` | `slug` | Generate if missing |
| `content_html` | `content` | Primary content |
| `meta_description` | `meta_description`, `excerpt` | SEO + excerpt |
| `hero_image_url` | `featured_image` | Image URL |
| `keywords` | `keywords` | Array |
| `seedKeyword` | `category` | Category fallback |
| — | `author` | "BabyLoveGrowth AI" |
| — | `is_published` | `true` (auto-publish) |
| — | `external_source` | "babylovegrowth" |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/sync-babylovegrowth/index.ts` | Create |
| `supabase/config.toml` | Modify (add function config) |
| `src/hooks/useBabyLoveGrowthSync.ts` | Create |
| `src/pages/dashboard/admin/AdminIntegrations.tsx` | Modify |
| Database migration | Create |

---

## Required Secret

You will need to provide your BabyLoveGrowth API key:

**Secret Name:** `BABYLOVEGROWTH_API_KEY`

**Where to get it:** BabyLoveGrowth Dashboard → Settings → Integrations → API → Generate API key

I will prompt you to enter this after creating the edge function.

---

## Result

Once complete:
- Every 15 minutes, new BabyLoveGrowth articles are automatically fetched and published
- Admin dashboard shows sync status and history
- Manual "Sync Now" button for immediate imports
- No duplicates thanks to external_id tracking
- Full autopilot - BabyLoveGrowth decides content, your platform publishes

