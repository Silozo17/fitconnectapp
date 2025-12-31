import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://getfitconnect.co.uk";
const SITE_NAME = "FitConnect";

// Escape HTML entities for safe output
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Truncate text to a maximum length
function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// Generate base HTML template
function baseTemplate({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  schema,
  content,
  keywords = [],
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
  content: string;
  keywords?: string[];
}): string {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const safeDescription = escapeHtml(truncate(description, 155));
  const fullUrl = `${BASE_URL}${canonicalUrl}`;
  const defaultOgImage = `${BASE_URL}/og-image.webp`;
  
  const schemaScripts = schema
    ? (Array.isArray(schema) ? schema : [schema])
        .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
        .join("\n    ")
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="canonical" href="${fullUrl}">
    ${keywords.length > 0 ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}">` : ""}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(fullTitle)}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:image" content="${ogImage || defaultOgImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${SITE_NAME}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${ogImage || defaultOgImage}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="${BASE_URL}/favicon.ico">
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Structured Data -->
    ${schemaScripts}
    
    <!-- Basic styles for pre-rendered content -->
    <style>
      :root {
        --background: 0 0% 3.9%;
        --foreground: 0 0% 98%;
        --primary: 142 76% 36%;
        --muted: 0 0% 63.9%;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        margin: 0;
        padding: 0;
        line-height: 1.6;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
      h1 { font-size: 2.5rem; margin-bottom: 1rem; }
      h2 { font-size: 1.75rem; margin-top: 2rem; }
      p { margin-bottom: 1rem; }
      a { color: hsl(var(--primary)); }
      .text-muted { color: hsl(var(--muted)); }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    </style>
</head>
<body>
    <noscript>
        <p>This website works best with JavaScript enabled.</p>
    </noscript>
    ${content}
    
    <!-- Hydration redirect for JavaScript-enabled browsers -->
    <script>
      // Redirect to the SPA for full interactivity
      // This preserves the pre-rendered content for crawlers
      // while giving users the full React experience
    </script>
</body>
</html>`;
}

// Generate Organization schema
function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/lovable-uploads/efc34768-5546-42b4-800e-49f717901d9e.png`,
    description: "Connect with elite personal trainers, nutritionists, and fitness coaches",
    sameAs: [
      "https://www.instagram.com/fitconnect",
      "https://www.twitter.com/fitconnect"
    ]
  };
}

// Generate WebSite schema
function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/coaches?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate Article schema
function articleSchema(post: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description,
    image: post.featured_image || `${BASE_URL}/og-image.webp`,
    author: {
      "@type": "Person",
      name: post.author || SITE_NAME
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/lovable-uploads/efc34768-5546-42b4-800e-49f717901d9e.png`
      }
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`
    }
  };
}

// Generate LocalBusiness/Person schema for coach
function coachSchema(coach: any, avgRating?: number, reviewCount?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.display_name,
    description: coach.bio,
    image: coach.profile_image_url,
    url: `${BASE_URL}/coaches/${coach.username}`,
    jobTitle: coach.coach_types?.join(", ") + " Coach",
    ...(avgRating && reviewCount ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviewCount
      }
    } : {})
  };
}

// Generate Breadcrumb schema
function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`
    }))
  };
}

// ================== PAGE RENDERERS ==================

// Homepage
function renderHomepage(): string {
  return baseTemplate({
    title: "Find Your Perfect Fitness Coach",
    description: "Connect with elite personal trainers, nutritionists, boxing coaches, and MMA instructors. Book sessions, track progress, and achieve your fitness goals with FitConnect.",
    canonicalUrl: "/",
    schema: [organizationSchema(), websiteSchema()],
    keywords: ["personal trainer", "fitness coach", "nutritionist", "boxing coach", "MMA coach", "online fitness"],
    content: `
    <main class="container">
      <h1>Find Your Perfect Fitness Coach</h1>
      <p>Connect with elite personal trainers, nutritionists, and fitness coaches who can help you achieve your goals.</p>
      
      <section>
        <h2>Why Choose FitConnect?</h2>
        <ul>
          <li>Verified professionals with real credentials</li>
          <li>Personalised workout and nutrition plans</li>
          <li>Book sessions online or in-person</li>
          <li>Track your progress with our app</li>
          <li>Connect wearable devices for automatic syncing</li>
        </ul>
      </section>
      
      <section>
        <h2>Find Coaches By Specialty</h2>
        <ul>
          <li><a href="/coaches/personal-trainers">Personal Trainers</a></li>
          <li><a href="/coaches/nutritionists">Nutritionists</a></li>
          <li><a href="/coaches/boxing">Boxing Coaches</a></li>
          <li><a href="/coaches/mma">MMA Coaches</a></li>
          <li><a href="/coaches/bodybuilding">Bodybuilding Coaches</a></li>
        </ul>
      </section>
      
      <section>
        <h2>Start Your Fitness Journey Today</h2>
        <p>Join thousands of clients who have transformed their lives with FitConnect coaches.</p>
        <a href="/coaches">Browse All Coaches</a>
      </section>
    </main>`
  });
}

// Blog listing
async function renderBlogListing(supabase: any): Promise<string> {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, featured_image, category, author, published_at, reading_time_minutes")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  const postsList = posts?.map((post: any) => `
    <article>
      <h2><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h2>
      <p class="text-muted">${escapeHtml(post.category)} • ${post.reading_time_minutes} min read • By ${escapeHtml(post.author || SITE_NAME)}</p>
      <p>${escapeHtml(post.excerpt)}</p>
    </article>
  `).join("\n") || "";

  return baseTemplate({
    title: "Fitness Blog - Tips, Guides & Inspiration",
    description: "Expert fitness advice, workout tips, nutrition guides, and success stories from FitConnect coaches and clients.",
    canonicalUrl: "/blog",
    schema: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" }
      ])
    ],
    keywords: ["fitness blog", "workout tips", "nutrition advice", "fitness guides"],
    content: `
    <main class="container">
      <h1>FitConnect Blog</h1>
      <p>Expert fitness advice, workout tips, and nutrition guides from our community of coaches.</p>
      
      <section>
        ${postsList || "<p>No posts available.</p>"}
      </section>
    </main>`
  });
}

// Individual blog post
async function renderBlogPost(supabase: any, slug: string): Promise<string> {
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    return render404("Blog post not found");
  }

  // Strip HTML tags for plain text content
  const plainContent = post.content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";

  return baseTemplate({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    canonicalUrl: `/blog/${slug}`,
    ogImage: post.featured_image,
    ogType: "article",
    schema: [
      articleSchema(post),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${slug}` }
      ])
    ],
    keywords: post.keywords || [],
    content: `
    <main class="container">
      <nav class="text-muted">
        <a href="/">Home</a> › <a href="/blog">Blog</a> › ${escapeHtml(post.title)}
      </nav>
      
      <article>
        <header>
          <p class="text-muted">${escapeHtml(post.category)}</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="text-muted">
            Published ${new Date(post.published_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
            • ${post.reading_time_minutes} min read
            • By ${escapeHtml(post.author || SITE_NAME)}
          </p>
        </header>
        
        ${post.featured_image ? `<img src="${post.featured_image}" alt="${escapeHtml(post.title)}" style="max-width:100%;border-radius:1rem;">` : ""}
        
        <div>
          ${post.content || `<p>${escapeHtml(plainContent)}</p>`}
        </div>
      </article>
      
      <section>
        <h2>Ready to Start Your Fitness Journey?</h2>
        <p>Connect with expert coaches who can help you achieve your goals.</p>
        <a href="/coaches">Find a Coach</a>
      </section>
    </main>`
  });
}

// Coach listing
async function renderCoachesListing(supabase: any): Promise<string> {
  const { data: coaches } = await supabase
    .from("coach_profiles")
    .select("username, display_name, coach_types, bio, hourly_rate, city, county, country")
    .eq("is_verified", true)
    .eq("onboarding_completed", true)
    .eq("marketplace_visible", true)
    .limit(50);

  const coachesList = coaches?.map((coach: any) => `
    <article>
      <h2><a href="/coaches/${coach.username}">${escapeHtml(coach.display_name)}</a></h2>
      <p class="text-muted">${escapeHtml(coach.coach_types?.join(", ") || "Fitness")} Coach</p>
      <p>${escapeHtml(truncate(coach.bio || "", 150))}</p>
      <p class="text-muted">${[coach.city, coach.county, coach.country].filter(Boolean).join(", ")}</p>
    </article>
  `).join("\n") || "";

  return baseTemplate({
    title: "Find Fitness Coaches",
    description: "Browse verified personal trainers, nutritionists, boxing coaches, and MMA instructors. Book online or in-person sessions.",
    canonicalUrl: "/coaches",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Find Fitness Coaches",
        description: "Browse and book verified fitness professionals",
        url: `${BASE_URL}/coaches`,
        provider: organizationSchema()
      },
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Find Coaches", url: "/coaches" }
      ])
    ],
    keywords: ["find personal trainer", "fitness coach", "nutritionist UK", "boxing coach", "MMA coach"],
    content: `
    <main class="container">
      <h1>Find Your Perfect Fitness Coach</h1>
      <p>Browse verified personal trainers, nutritionists, and fitness professionals.</p>
      
      <section>
        <h2>Browse by Specialty</h2>
        <ul>
          <li><a href="/coaches/personal-trainers">Personal Trainers</a></li>
          <li><a href="/coaches/nutritionists">Nutritionists</a></li>
          <li><a href="/coaches/boxing">Boxing Coaches</a></li>
          <li><a href="/coaches/mma">MMA Coaches</a></li>
        </ul>
      </section>
      
      <section>
        <h2>Featured Coaches</h2>
        ${coachesList || "<p>No coaches available.</p>"}
      </section>
    </main>`
  });
}

// Individual coach profile
async function renderCoachProfile(supabase: any, username: string): Promise<string> {
  const { data: coach } = await supabase
    .from("coach_profiles")
    .select("*")
    .eq("username", username)
    .eq("is_verified", true)
    .single();

  if (!coach) {
    return render404("Coach not found");
  }

  // Get reviews for rating
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("coach_id", coach.id);

  const avgRating = reviews?.length 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
    : 0;

  const location = [coach.city, coach.county, coach.country].filter(Boolean).join(", ");
  const coachTypes = coach.coach_types?.join(", ") || "Fitness";

  return baseTemplate({
    title: `${coach.display_name} - ${coachTypes} Coach`,
    description: truncate(coach.bio || `Connect with ${coach.display_name}, a verified ${coachTypes.toLowerCase()} coach on FitConnect.`, 155),
    canonicalUrl: `/coaches/${username}`,
    ogImage: coach.profile_image_url,
    ogType: "profile",
    schema: [
      coachSchema(coach, avgRating, reviews?.length),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Coaches", url: "/coaches" },
        { name: coach.display_name, url: `/coaches/${username}` }
      ])
    ],
    keywords: [
      `${coachTypes.toLowerCase()} coach`,
      "personal trainer",
      location ? `fitness coach ${location}` : "online fitness coach",
      "book personal trainer"
    ],
    content: `
    <main class="container">
      <nav class="text-muted">
        <a href="/">Home</a> › <a href="/coaches">Coaches</a> › ${escapeHtml(coach.display_name)}
      </nav>
      
      <article>
        <header>
          ${coach.profile_image_url ? `<img src="${coach.profile_image_url}" alt="${escapeHtml(coach.display_name)}" style="width:150px;height:150px;border-radius:50%;object-fit:cover;">` : ""}
          <h1>${escapeHtml(coach.display_name)}</h1>
          <p class="text-muted">${escapeHtml(coachTypes)} Coach</p>
          ${location ? `<p class="text-muted">${escapeHtml(location)}</p>` : ""}
          ${avgRating > 0 ? `<p>⭐ ${avgRating.toFixed(1)} (${reviews?.length} reviews)</p>` : ""}
        </header>
        
        <section>
          <h2>About</h2>
          <p>${escapeHtml(coach.bio || "No bio available.")}</p>
        </section>
        
        ${coach.who_i_work_with ? `
        <section>
          <h2>Who I Work With</h2>
          <p>${escapeHtml(coach.who_i_work_with)}</p>
        </section>
        ` : ""}
        
        <section>
          <h2>Services</h2>
          <ul>
            ${coach.online_available ? "<li>Online Sessions Available</li>" : ""}
            ${coach.in_person_available ? "<li>In-Person Sessions Available</li>" : ""}
          </ul>
          ${coach.hourly_rate ? `<p>From £${coach.hourly_rate} per session</p>` : ""}
        </section>
        
        <section>
          <h2>Book a Session</h2>
          <p>Ready to start your fitness journey with ${escapeHtml(coach.display_name)}?</p>
          <a href="/auth?tab=register&role=client">Sign up to connect</a>
        </section>
      </article>
    </main>`
  });
}

// Documentation pages - generic handler
function renderDocsPage(path: string, title: string, description: string, content: string): string {
  const pathParts = path.split("/").filter(Boolean);
  const breadcrumbs = [{ name: "Home", url: "/" }];
  
  let currentPath = "";
  for (const part of pathParts) {
    currentPath += `/${part}`;
    breadcrumbs.push({
      name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      url: currentPath
    });
  }

  return baseTemplate({
    title,
    description,
    canonicalUrl: path,
    schema: [breadcrumbSchema(breadcrumbs)],
    keywords: ["fitconnect help", "fitness app guide", title.toLowerCase()],
    content: `
    <main class="container">
      <nav class="text-muted">
        ${breadcrumbs.map(b => `<a href="${b.url}">${escapeHtml(b.name)}</a>`).join(" › ")}
      </nav>
      
      <article>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        ${content}
      </article>
    </main>`
  });
}

// Docs hub
function renderDocsHub(): string {
  return renderDocsPage(
    "/docs",
    "Help Center",
    "Find guides, tutorials, and answers to help you get the most out of FitConnect.",
    `
    <section>
      <h2>Getting Started</h2>
      <p><a href="/docs/getting-started">New to FitConnect? Start here</a></p>
    </section>
    
    <section>
      <h2>For Clients</h2>
      <ul>
        <li><a href="/docs/client/booking">Booking Sessions</a></li>
        <li><a href="/docs/client/coaches">Finding Coaches</a></li>
        <li><a href="/docs/client/plans">Workout & Nutrition Plans</a></li>
        <li><a href="/docs/client/progress">Tracking Progress</a></li>
        <li><a href="/docs/client/wearables">Connecting Wearables</a></li>
      </ul>
    </section>
    
    <section>
      <h2>For Coaches</h2>
      <ul>
        <li><a href="/docs/coach/onboarding">Getting Started as a Coach</a></li>
        <li><a href="/docs/coach/clients">Managing Clients</a></li>
        <li><a href="/docs/coach/plans">Creating Plans</a></li>
        <li><a href="/docs/coach/payments">Payments & Pricing</a></li>
        <li><a href="/docs/coach/marketing">Marketing Tools</a></li>
      </ul>
    </section>
    
    <section>
      <h2>Integrations</h2>
      <ul>
        <li><a href="/docs/integrations/apple-health">Apple Health</a></li>
        <li><a href="/docs/integrations/google-fit">Google Fit</a></li>
        <li><a href="/docs/integrations/fitbit">Fitbit</a></li>
        <li><a href="/docs/integrations/garmin">Garmin</a></li>
        <li><a href="/docs/integrations/stripe">Stripe Payments</a></li>
      </ul>
    </section>
    `
  );
}

// Static pages
function renderAbout(): string {
  return baseTemplate({
    title: "About FitConnect",
    description: "Learn about FitConnect's mission to connect fitness enthusiasts with elite coaches and transform lives through personalised training.",
    canonicalUrl: "/about",
    schema: [organizationSchema()],
    content: `
    <main class="container">
      <h1>About FitConnect</h1>
      <p>FitConnect is the UK's leading platform connecting fitness enthusiasts with verified personal trainers, nutritionists, and coaches.</p>
      
      <section>
        <h2>Our Mission</h2>
        <p>We believe everyone deserves access to quality fitness coaching. Our platform makes it easy to find, book, and work with the perfect coach for your goals.</p>
      </section>
      
      <section>
        <h2>Why FitConnect?</h2>
        <ul>
          <li>All coaches are verified with checked credentials</li>
          <li>Personalised matching based on your goals</li>
          <li>Integrated progress tracking and wearable sync</li>
          <li>Secure payments and booking</li>
        </ul>
      </section>
    </main>`
  });
}

function renderPricing(): string {
  return baseTemplate({
    title: "Pricing - Plans for Coaches",
    description: "Explore FitConnect subscription plans for coaches. Start free, upgrade as you grow. Tools to manage clients, payments, and marketing.",
    canonicalUrl: "/pricing",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Pricing", url: "/pricing" }])],
    content: `
    <main class="container">
      <h1>Pricing for Coaches</h1>
      <p>Choose the plan that fits your coaching business.</p>
      
      <section>
        <h2>Starter</h2>
        <p>Free - Up to 5 clients</p>
        <ul>
          <li>Basic profile</li>
          <li>Client messaging</li>
          <li>Session booking</li>
        </ul>
      </section>
      
      <section>
        <h2>Professional</h2>
        <p>£29/month - Up to 25 clients</p>
        <ul>
          <li>Everything in Starter</li>
          <li>AI workout and nutrition planning</li>
          <li>Progress analytics</li>
          <li>Marketing tools</li>
        </ul>
      </section>
      
      <section>
        <h2>Enterprise</h2>
        <p>£79/month - Unlimited clients</p>
        <ul>
          <li>Everything in Professional</li>
          <li>White-label branding</li>
          <li>Priority support</li>
          <li>API access</li>
        </ul>
      </section>
    </main>`
  });
}

function renderFAQ(): string {
  return baseTemplate({
    title: "FAQ - Frequently Asked Questions",
    description: "Find answers to common questions about FitConnect, booking coaches, payments, and using our fitness platform.",
    canonicalUrl: "/faq",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I find a coach?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Browse our marketplace at /coaches, filter by specialty, location, and price, then view profiles and book directly."
            }
          },
          {
            "@type": "Question",
            name: "Are coaches verified?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, all coaches go through a verification process where we check their qualifications and credentials."
            }
          },
          {
            "@type": "Question",
            name: "Can I do online sessions?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, many coaches offer online sessions via video call. Look for the 'Online Available' badge on profiles."
            }
          }
        ]
      }
    ],
    content: `
    <main class="container">
      <h1>Frequently Asked Questions</h1>
      
      <section>
        <h2>How do I find a coach?</h2>
        <p>Browse our marketplace at <a href="/coaches">/coaches</a>, filter by specialty, location, and price, then view profiles and book directly.</p>
      </section>
      
      <section>
        <h2>Are coaches verified?</h2>
        <p>Yes, all coaches go through a verification process where we check their qualifications and credentials.</p>
      </section>
      
      <section>
        <h2>Can I do online sessions?</h2>
        <p>Yes, many coaches offer online sessions via video call. Look for the 'Online Available' badge on profiles.</p>
      </section>
      
      <section>
        <h2>How do payments work?</h2>
        <p>Payments are processed securely through Stripe. You pay when booking and coaches receive payouts automatically.</p>
      </section>
      
      <section>
        <h2>Can I cancel a booking?</h2>
        <p>Cancellation policies vary by coach. Check the coach's profile for their specific policy before booking.</p>
      </section>
    </main>`
  });
}

// Community page
async function renderCommunity(supabase: any): Promise<string> {
  return baseTemplate({
    title: "Community - Leaderboards & Avatars",
    description: "Join the FitConnect community. Compete on leaderboards, earn XP, unlock avatars, and connect with fellow fitness enthusiasts.",
    canonicalUrl: "/community",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Community", url: "/community" }])],
    keywords: ["fitness community", "fitness leaderboard", "workout challenges", "fitness avatars"],
    content: `
    <main class="container">
      <h1>FitConnect Community</h1>
      <p>Compete, connect, and celebrate your fitness journey with the FitConnect community.</p>
      
      <section>
        <h2>Leaderboards</h2>
        <p>Compete with fitness enthusiasts around the world. Track your ranking globally, by country, county, or city.</p>
        <ul>
          <li>Global Leaderboard</li>
          <li>Country Rankings</li>
          <li>Local Competition</li>
        </ul>
      </section>
      
      <section>
        <h2>Earn XP & Level Up</h2>
        <p>Complete workouts, log habits, and achieve goals to earn XP and climb the ranks.</p>
      </section>
      
      <section>
        <h2>Unlock Avatars</h2>
        <p>Collect unique avatars by completing challenges and reaching milestones. Show off your achievements!</p>
      </section>
      
      <section>
        <h2>Join the Community</h2>
        <a href="/auth?tab=register&role=client">Create Your Account</a>
      </section>
    </main>`
  });
}

// Marketplace
async function renderMarketplace(supabase: any): Promise<string> {
  const { data: products } = await supabase
    .from("digital_products")
    .select("id, slug, title, short_description, price, currency, content_type, category")
    .eq("is_published", true)
    .limit(20);

  const productsList = products?.map((p: any) => `
    <article>
      <h3><a href="/marketplace/${p.slug || p.id}">${escapeHtml(p.title)}</a></h3>
      <p class="text-muted">${escapeHtml(p.content_type?.replace("_", " "))} • ${escapeHtml(p.category)}</p>
      <p>${escapeHtml(p.short_description || "")}</p>
      <p>${p.price === 0 ? "Free" : `£${p.price}`}</p>
    </article>
  `).join("\n") || "";

  return baseTemplate({
    title: "Marketplace - Digital Content",
    description: "Discover e-books, video courses, workout templates, and more from top fitness professionals on FitConnect.",
    canonicalUrl: "/marketplace",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Marketplace", url: "/marketplace" }])],
    keywords: ["fitness ebooks", "workout templates", "nutrition guides", "fitness courses"],
    content: `
    <main class="container">
      <h1>Digital Content Marketplace</h1>
      <p>Level up your training with expert resources from top fitness professionals.</p>
      
      <section>
        <h2>Featured Content</h2>
        ${productsList || "<p>No products available.</p>"}
      </section>
    </main>`
  });
}

// 404 page
function render404(message = "Page not found"): string {
  return baseTemplate({
    title: "Page Not Found",
    description: message,
    canonicalUrl: "/404",
    content: `
    <main class="container" style="text-align:center;padding:4rem 1rem;">
      <h1>404 - Page Not Found</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="/">Return to Homepage</a></p>
    </main>`
  });
}

// ================== MAIN HANDLER ==================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    
    console.log(`[prerender] Rendering path: ${path}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let html: string;

    // Route matching
    if (path === "/") {
      html = renderHomepage();
    } else if (path === "/blog") {
      html = await renderBlogListing(supabase);
    } else if (path.startsWith("/blog/")) {
      const slug = path.replace("/blog/", "");
      html = await renderBlogPost(supabase, slug);
    } else if (path === "/coaches") {
      html = await renderCoachesListing(supabase);
    } else if (path.match(/^\/coaches\/[a-zA-Z0-9_-]+$/)) {
      const username = path.replace("/coaches/", "");
      // Skip category pages
      if (["personal-trainers", "nutritionists", "boxing", "mma", "bodybuilding"].includes(username)) {
        html = renderDocsPage(path, `${username.replace("-", " ")} Coaches`, `Find ${username.replace("-", " ")} coaches on FitConnect`, "<p>Browse our verified coaches.</p>");
      } else {
        html = await renderCoachProfile(supabase, username);
      }
    } else if (path === "/about") {
      html = renderAbout();
    } else if (path === "/pricing") {
      html = renderPricing();
    } else if (path === "/faq") {
      html = renderFAQ();
    } else if (path === "/community") {
      html = await renderCommunity(supabase);
    } else if (path === "/marketplace") {
      html = await renderMarketplace(supabase);
    } else if (path === "/docs") {
      html = renderDocsHub();
    } else if (path.startsWith("/docs/")) {
      // Generic docs handler
      const title = path.split("/").pop()?.replace(/-/g, " ") || "Documentation";
      html = renderDocsPage(path, title.charAt(0).toUpperCase() + title.slice(1), `Learn about ${title} on FitConnect.`, "<p>Documentation content.</p>");
    } else {
      html = render404();
    }

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[prerender] Error:", error);
    return new Response(render404("An error occurred"), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
      status: 500,
    });
  }
});
