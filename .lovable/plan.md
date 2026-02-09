

# Comprehensive PageSpeed, Accessibility, Best Practices & SEO Fix Plan

## Complete Page Inventory

Below is every public-facing page on the FitConnect website (dashboard/admin pages are excluded as they are `noindex`):

### Core Pages
1. `/` - Homepage (Index)
2. `/get-started` - Get Started
3. `/about` - About
4. `/faq` - FAQ
5. `/pricing` - Pricing
6. `/for-coaches` - For Coaches
7. `/how-it-works` - How It Works
8. `/contact` - Contact
9. `/community` - Community
10. `/install` - Install / Download App
11. `/trust-and-verification` - Trust & Verification

### Coach Discovery
12. `/coaches` - Browse All Coaches
13. `/coaches/:id` - Individual Coach Profile
14. `/coaches/personal-trainers` - Personal Trainers Landing
15. `/coaches/nutritionists` - Nutritionists Landing
16. `/coaches/boxing` - Boxing Coaches Landing
17. `/coaches/mma` - MMA Coaches Landing

### Blog
18. `/blog` - Blog Listing
19. `/blog/:slug` - Individual Blog Post

### Marketplace
20. `/marketplace` - Digital Products Marketplace
21. `/marketplace/:productId` - Product Detail
22. `/marketplace/bundles/:bundleId` - Bundle Detail

### Legal & Info
23. `/privacy` - Privacy Policy
24. `/terms` - Terms of Service
25. `/eula` - End User License Agreement
26. `/success-stories` - Success Stories
27. `/checkout` - Checkout

### Auth (limited SEO relevance but still affects scores)
28. `/auth` - Login / Signup
29. `/reset-password` - Reset Password
30. `/subscribe` - Coach Subscription
31. `/subscribe/success` - Subscription Success

### Documentation (50+ pages)
32-80+. `/docs/*` - All documentation pages

### Locale-prefixed variants
All above pages can also be accessed via `/:locale/` prefix (e.g., `/gb-en/coaches`)

---

## Issues Identified (from PageSpeed Insights Screenshots + Code Audit)

### 1. PERFORMANCE Issues

| Issue | Impact | Affected Pages |
|-------|--------|----------------|
| Images missing `width` and `height` attributes | Layout shifts (CLS) | All pages with dynamic images |
| Hero phone image loaded eagerly but large | Blocks LCP | Homepage |
| Coach card images missing dimensions | CLS | Homepage, `/coaches`, category pages |
| Testimonial images missing dimensions | CLS | Homepage |
| Avatar images missing dimensions | CLS | Homepage |
| Blog featured images missing dimensions | CLS | Blog post pages |
| No source maps in production | Best Practices score | All pages |
| Large network payload (~5,657 KiB) | Performance | All pages |
| Render-blocking requests (fonts) | FCP delay ~800ms | All pages |
| Unused CSS (~34 KiB) | Performance | All pages |
| Unused JavaScript (~240 KiB) | Performance | All pages |

### 2. ACCESSIBILITY Issues

| Issue | Impact | Location |
|-------|--------|----------|
| Navbar dropdown buttons missing `aria-label` | Buttons without accessible names | `Navbar.tsx` line 109, 167 |
| `user-scalable=no` and `maximum-scale=1.0` in viewport | Prevents zoom for visually impaired users | `index.html` line 5 |
| Heading elements not sequential | Navigation accessibility | Various pages - need audit of h1/h2/h3 order |
| Identical links with same purpose | Link clarity | Footer, Navbar (multiple coach links) |

### 3. BEST PRACTICES Issues

| Issue | Impact | Location |
|-------|--------|----------|
| CORS error: `getfitconnect.co.uk` calling `fitconnectapp.lovable.app/-api/analytics` | Console errors in production | Lovable's built-in analytics (not in our code) |
| Missing source maps for large JS files | Debugging, Lighthouse penalty | `vite.config.ts` - sourcemap only in dev mode |

### 4. SEO Issues

| Issue | Impact | Location |
|-------|--------|----------|
| Conflicting canonical URLs | Multiple URLs resolving to same content | `index.html` has `canonical` for `/`, but SEOHead also sets canonical - results in duplicates |
| Blog posts: canonical set to `/blog/:slug` but page accessed via `getfitconnect.co.uk` while canonical in HTML head points to root | Conflicting canonicals | `BlogPost.tsx` + `index.html` |
| Duplicate meta tags | index.html has static og:title, og:description that conflict with Helmet-injected ones | `index.html` lines 267-270 |

---

## Fix Plan (Ordered by Priority)

### Phase 1: Quick Wins (High Impact, Low Effort)

**1.1 Fix viewport meta to allow user scaling (Accessibility)**
- File: `index.html`
- Change: Remove `maximum-scale=1.0, user-scalable=no` from viewport meta
- New: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
- Impact: Fixes "user-scalable=no" accessibility warning

**1.2 Add `aria-label` to Navbar buttons (Accessibility)**
- File: `src/components/layout/Navbar.tsx`
- Add `aria-label` to the "Find Coaches" dropdown button (line 109)
- Add `aria-label` to the "For Coaches" dropdown button (line ~167)
- Add `aria-label` to the "Resources" dropdown button
- The mobile hamburger already has `sr-only` text - that is correct

**1.3 Remove duplicate static meta tags from index.html (SEO)**
- File: `index.html`
- Remove lines 267-270 (the duplicate `og:title`, `twitter:title`, `og:description`, `twitter:description`) because these are dynamically managed by `SEOHead` component via react-helmet-async
- These cause "conflicting" canonical/meta issues in Lighthouse

**1.4 Add `width` and `height` to all `<img>` elements (Performance + CLS)**
- Files to update:
  - `src/components/landing/Hero.tsx` - hero phones image (add `width={500} height={600}`)
  - `src/components/landing/Hero.tsx` - app store badges (add `width={280} height={40}`)
  - `src/components/landing/FeaturedCoaches.tsx` - coach card images (add `width={400} height={400}`)
  - `src/components/landing/Testimonials.tsx` - testimonial avatars (add `width={48} height={48}`)
  - `src/components/landing/AvatarShowcase.tsx` - avatar images (add dimensions)
  - `src/pages/BlogPost.tsx` - featured image (add `width={1200} height={675}`)
  - `src/components/blog/BlogCard.tsx` - blog card images (add dimensions)

### Phase 2: Performance Optimisation

**2.1 Enable source maps in production (Best Practices)**
- File: `vite.config.ts`
- Change: `sourcemap: mode === "development"` to `sourcemap: true`
- This generates source maps for production builds, fixing the "Missing source maps" warning

**2.2 Lazy load below-the-fold images (Performance)**
- Files: `FeaturedCoaches.tsx`, `Testimonials.tsx`, `AvatarShowcase.tsx`, `BlogSection.tsx`
- Add `loading="lazy"` to all images that are not in the initial viewport
- The Hero phones image already has `loading="eager"` which is correct

**2.3 Add `fetchpriority="high"` to LCP image (Performance)**
- File: `src/components/landing/Hero.tsx`
- Add `fetchpriority="high"` to the hero phones image (line 139-143) since this is likely the LCP element

**2.4 Preload LCP hero image (Performance)**
- File: `index.html`
- Add: `<link rel="preload" as="image" href="/src/assets/hero-phones.webp" fetchpriority="high" />`
- Note: Since this is a Vite-bundled asset, the actual path will be hashed. Consider moving this to `public/` folder or using a preload link in the component.

### Phase 3: SEO Hardening

**3.1 Fix canonical URL conflicts across all pages**
- The root issue: `index.html` has a static `<link rel="canonical" href="https://getfitconnect.co.uk/">` that stays on every page
- `SEOHead` component also injects a canonical via react-helmet-async
- Fix: Remove the static canonical from `index.html` (line 17) and rely solely on the dynamic `SEOHead` component which sets the correct canonical per page
- This resolves the "Multiple conflicting URLs" SEO warning

**3.2 Ensure all pages pass canonicalPath to SEOHead**
- Audit every page component to confirm it provides `canonicalPath` prop
- `BlogPost.tsx` already does: `canonicalPath={/blog/${post.slug}}`
- Check: `About.tsx`, `FAQ.tsx`, `Pricing.tsx`, `ForCoaches.tsx`, `HowItWorks.tsx`, `Contact.tsx`, `Community.tsx`, `Coaches.tsx`, coach category pages, etc.

**3.3 Fix heading hierarchy on all pages**
- Audit each page to ensure headings go h1 -> h2 -> h3 in order (no skipping levels)
- Common issue: Pages using h3 inside hero without an h2 parent, or blog content having inconsistent heading levels

### Phase 4: Remaining Best Practices

**4.1 CORS analytics error (Best Practices)**
- The error `Access to XMLHttpRequest at 'https://fitconnectapp.lovable.app/-api/analytics' from origin 'https://getfitconnect.co.uk' has been blocked by CORS` is caused by Lovable's built-in analytics trying to call the Lovable preview URL from the custom domain
- This is a Lovable platform issue, not something fixable in our code
- Impact: Minor - only affects Best Practices score by a few points
- We can note this as a known limitation

---

## Technical Summary of All File Changes

| File | Changes |
|------|---------|
| `index.html` | Remove `user-scalable=no, maximum-scale=1.0` from viewport; remove duplicate og/twitter meta tags (lines 267-270); remove static canonical link (line 17) |
| `src/components/layout/Navbar.tsx` | Add `aria-label` to 3 dropdown trigger buttons |
| `src/components/landing/Hero.tsx` | Add `width`/`height` to phone and badge images; add `fetchpriority="high"` to hero image |
| `src/components/landing/FeaturedCoaches.tsx` | Add `width`/`height` to coach images; add `loading="lazy"` |
| `src/components/landing/Testimonials.tsx` | Add `width`/`height` to avatar images; add `loading="lazy"` |
| `src/components/landing/AvatarShowcase.tsx` | Add `width`/`height` to avatar images; add `loading="lazy"` |
| `src/pages/BlogPost.tsx` | Add `width`/`height` to featured image |
| `src/components/blog/BlogCard.tsx` | Add `width`/`height` to card images; add `loading="lazy"` |
| `vite.config.ts` | Enable source maps in production (`sourcemap: true`) |

### Expected Score Improvements

| Category | Current | Expected |
|----------|---------|----------|
| Performance | Low (red) | 70-85+ (image dims, lazy loading, LCP preload) |
| Accessibility | 88 | 95+ (viewport fix, aria-labels, heading order) |
| Best Practices | 96 | 96-100 (source maps fix; CORS is platform-level) |
| SEO | 92 | 98-100 (canonical fix, meta dedup) |

