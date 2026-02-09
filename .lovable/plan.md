
# Remove Duplicate Title and Image from Blog Articles

## Problem
The BabyLoveGrowth API returns `content_html` that starts with an `<h1>` title and a hero image (`<p><img ...></p>`). The blog post page (`BlogPost.tsx`) already renders these separately in the header section, causing them to appear twice.

## Solution

Two-part fix: update the sync function to strip duplicates from future articles, and clean up the 2 existing articles in the database.

### 1. Update Edge Function
**File:** `supabase/functions/sync-babylovegrowth/index.ts`

Add a `removeLeadingTitleAndImage` helper function that:
- Removes the first `<h1>...</h1>` tag from the beginning of the content
- Removes the first `<p><img ...></p>` block that immediately follows

Apply this to the content before saving, alongside the existing `removeAttributionFooter`.

```
content: removeLeadingTitleAndImage(removeAttributionFooter(contentHtml))
```

### 2. Fix Existing Articles
Run a database update to strip the leading `<h1>` and first `<p><img></p>` from the 2 already-imported articles. This uses `REGEXP_REPLACE` to remove:
- The opening `<h1 ...>...</h1>` tag and any whitespace after it
- The `<p><img ...></p>` block and any whitespace after it

### Technical Details

**New helper function:**
```typescript
function removeLeadingTitleAndImage(html: string): string {
  let cleaned = html.trim();
  // Remove leading <h1>...</h1>
  cleaned = cleaned.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  // Remove leading <p><img ...></p>
  cleaned = cleaned.replace(/^\s*<p>\s*<img[^>]*>\s*<\/p>\s*/i, "");
  return cleaned.trim();
}
```

**Database fix SQL:**
```sql
UPDATE blog_posts 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    content,
    '^\s*<h1[^>]*>[\s\S]*?</h1>\s*',
    '',
    'i'
  ),
  '^\s*<p>\s*<img[^>]*>\s*</p>\s*',
  '',
  'i'
)
WHERE external_source = 'babylovegrowth';
```

## Files Modified
- `supabase/functions/sync-babylovegrowth/index.ts` (add helper, apply to content)
- Database: update 2 existing rows
