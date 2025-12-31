# SEO Verification Checklist

This document provides manual verification steps and automated checks to ensure FitConnect's public website is properly configured for search engine and AI crawler accessibility.

## Quick Verification Commands

### 1. Robots.txt Accessibility

```bash
# Verify robots.txt is accessible
curl -I https://getfitconnect.co.uk/robots.txt

# Expected: HTTP 200, Content-Type: text/plain
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `text/plain`
- Contains `User-agent: Googlebot` and `Allow: /`
- Contains `Sitemap: https://getfitconnect.co.uk/sitemap.xml`

### 2. Sitemap Accessibility

```bash
# Verify sitemap.xml is accessible
curl -I https://getfitconnect.co.uk/sitemap.xml

# Verify dynamic sitemap endpoint
curl -I https://getfitconnect.co.uk/api/sitemap
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `application/xml`
- Contains valid XML with `<urlset>` or `<sitemapindex>`

### 3. OG Image Accessibility

```bash
# Verify OG image loads (primary PNG)
curl -I https://getfitconnect.co.uk/og-image.png

# Expected: HTTP 200, Content-Type: image/png
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `image/png`
- Dimensions: 1200×630 pixels
- File size ~50-300KB (optimal for sharing)

### 4. Social Sharing Validators

Use these tools to verify OG images display correctly:

| Platform | Tool URL | How to Use |
|----------|----------|------------|
| Facebook | https://developers.facebook.com/tools/debug/ | Paste URL, click "Debug". Use "Scrape Again" to refresh cache |
| LinkedIn | https://www.linkedin.com/post-inspector/ | Paste URL, click "Inspect" |
| Twitter/X | https://cards-dev.twitter.com/validator | Paste URL (requires login) |
| WhatsApp | Send link to yourself on mobile | Check preview appears correctly |
| Slack | Paste link in any channel | Check unfurl preview shows image |
| Discord | Paste link in any channel | Check embed preview shows image |

**Verification Checklist:**
- [ ] Image loads (not broken/missing)
- [ ] Correct 1200×630 dimensions displayed
- [ ] Title and description appear correctly
- [ ] No mixed-content warnings
- [ ] HTTPS URL used throughout

## Page-Level Verification

### Public Pages (Should be INDEXED)

For each public page, verify:

1. **Title Tag**: Present, under 60 characters, contains target keyword
2. **Meta Description**: Present, under 160 characters
3. **Canonical URL**: Present and correct
4. **Robots Meta**: Either absent (defaults to index) or `index, follow`
5. **OG Tags**: `og:title`, `og:description`, `og:image` present
6. **Twitter Tags**: `twitter:card`, `twitter:title`, `twitter:image` present

**Key Public Pages to Check:**

| Page | Path | Expected Title Pattern |
|------|------|------------------------|
| Homepage | `/` | "FitConnect - Find Your Perfect Fitness Coach" |
| Coaches | `/coaches` | "Find Fitness Coaches..." |
| Blog | `/blog` | "Fitness Blog..." |
| Docs | `/docs` | "Documentation..." |
| Marketplace | `/marketplace` | "Fitness Marketplace..." |

### Private Pages (Should be NOINDEX)

For each private page, verify:

1. **Robots Meta**: Contains `noindex, nofollow`
2. **Not in Sitemap**: Path not listed in sitemap.xml

**Private Pages to Check:**

| Page | Path | Robots Directive |
|------|------|------------------|
| Client Dashboard | `/dashboard/client` | `noindex, nofollow` |
| Coach Dashboard | `/dashboard/coach` | `noindex, nofollow` |
| Admin Dashboard | `/admin/*` | `noindex, nofollow` |
| Checkout | `/checkout` | `noindex, nofollow` |
| Auth | `/auth` | `noindex, nofollow` |
| Onboarding | `/onboarding/*` | `noindex, nofollow` |

## Automated Check Script

```javascript
// Run in browser console on any page
function checkSEO() {
  const results = {
    title: document.title,
    titleLength: document.title.length,
    metaDescription: document.querySelector('meta[name="description"]')?.content,
    metaDescriptionLength: document.querySelector('meta[name="description"]')?.content?.length,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    robots: document.querySelector('meta[name="robots"]')?.content,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    twitterCard: document.querySelector('meta[name="twitter:card"]')?.content,
    twitterImage: document.querySelector('meta[name="twitter:image"]')?.content,
  };
  
  console.table(results);
  
  // Validation
  const issues = [];
  if (!results.title) issues.push('Missing title');
  if (results.titleLength > 60) issues.push('Title too long (>60 chars)');
  if (!results.metaDescription) issues.push('Missing meta description');
  if (results.metaDescriptionLength > 160) issues.push('Description too long (>160 chars)');
  if (!results.canonical) issues.push('Missing canonical URL');
  if (!results.ogImage) issues.push('Missing OG image');
  
  if (issues.length > 0) {
    console.warn('SEO Issues Found:', issues);
  } else {
    console.log('✓ All basic SEO checks passed');
  }
  
  return results;
}

checkSEO();
```

## Crawler Testing Tools

### Google Search Console
- URL: https://search.google.com/search-console
- Use "URL Inspection" tool to verify indexing status
- Check "Coverage" report for indexing errors

### Bing Webmaster Tools
- URL: https://www.bing.com/webmasters
- Use "URL Inspection" for Bing-specific crawling

### Google Rich Results Test
- URL: https://search.google.com/test/rich-results
- Test JSON-LD schema markup

### Mobile-Friendly Test
- URL: https://search.google.com/test/mobile-friendly
- Verify mobile rendering

## Indexable Routes (Allow List)

These routes MUST be indexable:

```
/
/coaches
/coaches/personal-trainers
/coaches/nutritionists
/coaches/boxing
/coaches/mma
/coaches/bodybuilding
/coaches/{username}  (dynamic - verified coaches only)
/marketplace
/marketplace/{slug}  (dynamic - published products only)
/blog
/blog/{slug}  (dynamic - published posts only)
/docs
/docs/getting-started
/docs/client/*
/docs/coach/*
/docs/integrations/*
/for-coaches
/how-it-works
/success-stories
/community
/about
/pricing
/faq
/contact
/install
/privacy
/terms
```

## NoIndex Routes (Block List)

These routes MUST NOT be indexed:

```
/auth
/auth/*
/login
/signup
/reset-password
/verify-email
/dashboard
/dashboard/*
/onboarding
/onboarding/*
/checkout
/checkout/*
/subscribe
/subscribe/*
/admin
/admin/*
/docs/admin/*
/api/*
/payment/*
```

## Locale/Hreflang Verification

For multi-locale pages, verify hreflang tags:

```html
<!-- Expected for /coaches page -->
<link rel="alternate" hreflang="en-GB" href="https://getfitconnect.co.uk/gb-en/coaches" />
<link rel="alternate" hreflang="en-US" href="https://getfitconnect.co.uk/us-en/coaches" />
<link rel="alternate" hreflang="pl" href="https://getfitconnect.co.uk/pl-pl/coaches" />
<link rel="alternate" hreflang="x-default" href="https://getfitconnect.co.uk/coaches" />
```

## AI Crawler Verification

Verify AI crawlers can access the site:

```bash
# Test with common AI crawler user agents
curl -A "GPTBot" -I https://getfitconnect.co.uk/
curl -A "ClaudeBot" -I https://getfitconnect.co.uk/
curl -A "PerplexityBot" -I https://getfitconnect.co.uk/

# Expected: HTTP 200 for all
```

## Maintenance Schedule

- **Weekly**: Check Google Search Console for crawl errors
- **Monthly**: Run full SEO audit on key pages
- **After Deploys**: Verify robots.txt and sitemap accessibility
- **Quarterly**: Review and update AI crawler list in robots.txt

## Contact

For SEO issues, contact the FitConnect development team.

---

*Last Updated: 2025-01-01*
