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
  noIndex = false,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
  content: string;
  keywords?: string[];
  noIndex?: boolean;
}): string {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const safeDescription = escapeHtml(truncate(description, 155));
  const fullUrl = `${BASE_URL}${canonicalUrl}`;
  const defaultOgImage = `${BASE_URL}/og-image.png`;
  
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
    ${noIndex ? '<meta name="robots" content="noindex, nofollow">' : ''}
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
      h3 { font-size: 1.25rem; margin-top: 1.5rem; }
      p { margin-bottom: 1rem; }
      a { color: hsl(var(--primary)); }
      ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
      li { margin-bottom: 0.5rem; }
      .text-muted { color: hsl(var(--muted)); }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
      .tip { background: hsla(var(--primary), 0.1); border-left: 4px solid hsl(var(--primary)); padding: 1rem; margin: 1rem 0; border-radius: 0.5rem; }
      .warning { background: hsla(45, 100%, 50%, 0.1); border-left: 4px solid hsl(45, 100%, 50%); padding: 1rem; margin: 1rem 0; border-radius: 0.5rem; }
      .step { display: flex; gap: 1rem; margin-bottom: 1rem; }
      .step-number { background: hsl(var(--primary)); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
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
    image: post.featured_image || `${BASE_URL}/og-image.png`,
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

// Generate Product schema for marketplace items
function productSchema(product: any, coach?: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.short_description,
    image: product.cover_image_url,
    url: `${BASE_URL}/marketplace/${product.slug || product.id}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "GBP",
      availability: "https://schema.org/InStock"
    },
    ...(coach ? {
      brand: {
        "@type": "Person",
        name: coach.display_name
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

// ================== DOCUMENTATION CONTENT MAP ==================

const DOCS_CONTENT: Record<string, { title: string; description: string; content: string; keywords?: string[]; noIndex?: boolean }> = {
  // ============ CLIENT DOCS ============
  "/docs/client/getting-started": {
    title: "Getting Started as a Client",
    description: "Learn how to create your FitConnect account, find coaches, and book your first session.",
    keywords: ["getting started", "new user", "client guide", "first session"],
    content: `
      <section>
        <h2>Welcome to FitConnect</h2>
        <p>FitConnect connects you with verified fitness professionals including personal trainers, nutritionists, boxing coaches, and MMA instructors. Here's how to get started.</p>
      </section>
      <section>
        <h2>Create Your Account</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Sign up</strong> - Visit the registration page and enter your email and password.</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Complete your profile</strong> - Add your fitness goals, current fitness level, and any health considerations.</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Connect wearables</strong> - Optionally sync Apple Health, Google Fit, Fitbit, or Garmin for automatic progress tracking.</div></div>
      </section>
      <section>
        <h2>Find Your Coach</h2>
        <p>Browse our <a href="/coaches">coach marketplace</a> to find professionals who match your goals. Filter by specialty, location, price, and availability.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Read coach reviews and check their credentials before booking your first session.</div>
    `
  },
  "/docs/client/booking": {
    title: "Booking Sessions",
    description: "Learn how to find coaches, view availability, book sessions, and manage your appointments on FitConnect.",
    keywords: ["book session", "schedule", "appointment", "availability"],
    content: `
      <section>
        <h2>Finding Available Sessions</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Browse coaches</strong> - Visit the <a href="/coaches">coach marketplace</a> and use filters to narrow your search.</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>View profile</strong> - Click on a coach to see their bio, services, and reviews.</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Check availability</strong> - View the coach's calendar to see open time slots.</div></div>
        <div class="step"><span class="step-number">4</span><div><strong>Book session</strong> - Select your preferred date, time, and session type (online or in-person).</div></div>
      </section>
      <section>
        <h2>Session Types</h2>
        <ul>
          <li><strong>Consultation</strong> - Initial meeting to discuss goals and assess needs</li>
          <li><strong>One-off session</strong> - Single training or coaching session</li>
          <li><strong>Package sessions</strong> - Discounted bundles of multiple sessions</li>
          <li><strong>Subscription</strong> - Ongoing coaching with regular sessions</li>
        </ul>
      </section>
      <section>
        <h2>Managing Bookings</h2>
        <p>View, reschedule, or cancel bookings from your dashboard. Check each coach's cancellation policy before booking.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Book your next session immediately after completing one to maintain consistency.</div>
    `
  },
  "/docs/client/coaches": {
    title: "Finding Coaches",
    description: "How to search, filter, and find the perfect fitness coach for your goals on FitConnect.",
    keywords: ["find coach", "search", "filter", "coach types"],
    content: `
      <section>
        <h2>Using the Coach Marketplace</h2>
        <p>The <a href="/coaches">coach marketplace</a> helps you discover verified fitness professionals. Use filters to find coaches that match your specific needs.</p>
      </section>
      <section>
        <h2>Filter Options</h2>
        <ul>
          <li><strong>Specialty</strong> - Personal Training, Nutrition, Boxing, MMA, Bodybuilding</li>
          <li><strong>Location</strong> - Find coaches near you or filter by country/city</li>
          <li><strong>Price range</strong> - Set minimum and maximum hourly rates</li>
          <li><strong>Session type</strong> - Online only, in-person only, or both</li>
          <li><strong>Availability</strong> - See coaches with open slots</li>
        </ul>
      </section>
      <section>
        <h2>Coach Profiles</h2>
        <p>Each profile includes the coach's bio, qualifications, client reviews, services offered, and pricing. Look for the verified badge to confirm credentials have been checked.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Save coaches to your favorites for easy access later.</div>
    `
  },
  "/docs/client/plans": {
    title: "Workout & Nutrition Plans",
    description: "Access and follow your personalized workout and nutrition plans created by your coach.",
    keywords: ["workout plan", "nutrition plan", "meal plan", "training program"],
    content: `
      <section>
        <h2>Accessing Your Plans</h2>
        <p>Once your coach assigns a plan, you'll find it in your dashboard under the Plans section. You'll receive a notification when a new plan is available.</p>
      </section>
      <section>
        <h2>Workout Plans</h2>
        <div class="step"><span class="step-number">1</span><div><strong>View today's workout</strong> - See exercises, sets, reps, and rest times</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Watch exercise demos</strong> - Video guides for proper form</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Log completion</strong> - Mark exercises as complete and track your progress</div></div>
      </section>
      <section>
        <h2>Nutrition Plans</h2>
        <p>View daily meals with macro targets, calories, and portion guidance. Generate shopping lists from your meal plan and integrate with UK supermarkets.</p>
      </section>
      <section>
        <h2>Requesting Changes</h2>
        <p>If you need modifications (injuries, dietary restrictions, schedule changes), message your coach directly through the app.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Always consult your coach before modifying your plan significantly.</div>
    `
  },
  "/docs/client/progress": {
    title: "Tracking Progress",
    description: "Learn how to log your progress, upload photos, and track your fitness journey over time.",
    keywords: ["progress tracking", "measurements", "progress photos", "weight log"],
    content: `
      <section>
        <h2>Logging Measurements</h2>
        <div class="step"><span class="step-number">1</span><div>Go to <strong>Progress</strong> from your dashboard</div></div>
        <div class="step"><span class="step-number">2</span><div>Click <strong>Log Progress</strong> to add a new entry</div></div>
        <div class="step"><span class="step-number">3</span><div>Enter weight, body fat percentage, and measurements</div></div>
      </section>
      <section>
        <h2>Progress Photos</h2>
        <p>Upload photos regularly to track visual changes. Photos are private and only visible to you and your coach. Use the comparison view to see your transformation over time.</p>
      </section>
      <section>
        <h2>Viewing Charts</h2>
        <p>Progress charts show your weight, measurements, and strength gains over time. Export your data for personal records or to share with healthcare providers.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Log measurements at the same time each day for consistency. Focus on weekly averages rather than daily fluctuations.</div>
    `
  },
  "/docs/client/sessions": {
    title: "Managing Sessions",
    description: "Join online sessions, prepare for in-person training, and get the most from your coaching.",
    keywords: ["online sessions", "video call", "in-person training", "session prep"],
    content: `
      <section>
        <h2>Before Your Session</h2>
        <ul>
          <li>Review any notes or exercises from previous sessions</li>
          <li>Prepare questions for your coach</li>
          <li>Have water and equipment ready</li>
          <li>For online: test your camera and internet connection</li>
        </ul>
      </section>
      <section>
        <h2>Joining Online Sessions</h2>
        <p>Click the session link in your dashboard or calendar at the scheduled time. Sessions use integrated video conferencing with Zoom or Google Meet.</p>
      </section>
      <section>
        <h2>After Your Session</h2>
        <p>Your coach may send follow-up notes or updated plans. Review any feedback and prepare for your next session.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Arrive 5 minutes early for online sessions to test your setup.</div>
    `
  },
  "/docs/client/messages": {
    title: "Messaging Your Coach",
    description: "Communicate with your coach through the in-app messaging system.",
    keywords: ["messages", "chat", "communication", "coach contact"],
    content: `
      <section>
        <h2>Using Messages</h2>
        <p>The messaging system allows you to communicate directly with your coach. Send questions, share updates, and receive guidance between sessions.</p>
      </section>
      <section>
        <h2>What to Message About</h2>
        <ul>
          <li>Questions about your workout or nutrition plan</li>
          <li>Updates on your progress or challenges</li>
          <li>Scheduling or rescheduling requests</li>
          <li>Injury or health updates</li>
        </ul>
      </section>
      <section>
        <h2>Response Times</h2>
        <p>Response times vary by coach and their subscription tier. Premium coaching packages often include faster response times.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Be specific in your messages to get the most helpful responses.</div>
    `
  },
  "/docs/client/habits": {
    title: "Habit Tracking",
    description: "Track daily habits like water intake, sleep, and steps to build consistency.",
    keywords: ["habits", "daily tracking", "streaks", "consistency"],
    content: `
      <section>
        <h2>Setting Up Habits</h2>
        <p>Your coach can assign habits for you to track daily. Common habits include water intake, sleep hours, step count, and supplement timing.</p>
      </section>
      <section>
        <h2>Tracking Daily</h2>
        <p>Check off habits as you complete them throughout the day. Build streaks to stay motivated and earn XP for consistency.</p>
      </section>
      <section>
        <h2>Viewing Your Streaks</h2>
        <p>The habits dashboard shows your current streaks, longest streaks, and completion rates. Share achievements with your coach.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Set reminders to log habits at the same time each day.</div>
    `
  },
  "/docs/client/wearables": {
    title: "Connecting Wearables",
    description: "Sync fitness trackers and health apps to automatically import your activity data.",
    keywords: ["wearables", "fitness tracker", "Apple Health", "Fitbit", "Garmin"],
    content: `
      <section>
        <h2>Supported Devices</h2>
        <ul>
          <li><a href="/docs/integrations/apple-health">Apple Health</a> (iPhone, Apple Watch)</li>
          <li><a href="/docs/integrations/health-connect">Health Connect</a> (Android)</li>
          <li><a href="/docs/integrations/fitbit">Fitbit</a></li>
          <li><a href="/docs/integrations/garmin">Garmin</a></li>
        </ul>
      </section>
      <section>
        <h2>Connecting Your Device</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations</div></div>
        <div class="step"><span class="step-number">2</span><div>Select your device or app</div></div>
        <div class="step"><span class="step-number">3</span><div>Authorize the connection</div></div>
        <div class="step"><span class="step-number">4</span><div>Choose what data to sync</div></div>
      </section>
      <section>
        <h2>Synced Data</h2>
        <p>Depending on your device, we sync steps, heart rate, calories burned, sleep data, workouts, and weight measurements.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Keep your wearable app updated for the best sync experience.</div>
    `
  },
  "/docs/client/achievements": {
    title: "Achievements & Leaderboards",
    description: "Earn XP, unlock badges and avatars, and compete on local and global leaderboards.",
    keywords: ["achievements", "XP", "leaderboards", "badges", "avatars"],
    content: `
      <section>
        <h2>XP & Leveling System</h2>
        <p>Earn XP by completing workouts, maintaining habit streaks, logging progress, and hitting milestones. Level up to unlock new avatars and compete on leaderboards.</p>
      </section>
      <section>
        <h2>Badges</h2>
        <p>Earn badges for achievements like completing your first workout, maintaining a 7-day streak, or reaching weight goals. Badges are displayed on your profile.</p>
      </section>
      <section>
        <h2>Avatars</h2>
        <p>Unlock unique avatars based on your achievements. Rarer avatars require more challenging goals. Visit the <a href="/community?tab=avatars">avatar gallery</a> to see all available avatars.</p>
      </section>
      <section>
        <h2>Leaderboards</h2>
        <p>Compete with other FitConnect users on global, country, county, and city leaderboards. Rankings are based on XP earned.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Opt into leaderboards from your privacy settings to appear in rankings.</div>
    `
  },
  "/docs/client/challenges": {
    title: "Fitness Challenges",
    description: "Join platform-wide challenges to compete with others and earn exclusive rewards.",
    keywords: ["challenges", "competitions", "rewards", "community"],
    content: `
      <section>
        <h2>Finding Challenges</h2>
        <p>Browse active challenges from your dashboard or the <a href="/community">community page</a>. Challenges may target steps, workouts, habits, or custom goals.</p>
      </section>
      <section>
        <h2>Joining a Challenge</h2>
        <div class="step"><span class="step-number">1</span><div>View the challenge details and requirements</div></div>
        <div class="step"><span class="step-number">2</span><div>Click Join to participate</div></div>
        <div class="step"><span class="step-number">3</span><div>Complete the target before the deadline</div></div>
      </section>
      <section>
        <h2>Rewards</h2>
        <p>Completing challenges earns bonus XP, exclusive badges, and limited-edition avatars not available elsewhere.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Check back regularly for seasonal challenges with special rewards.</div>
    `
  },
  "/docs/client/leaderboard": {
    title: "Leaderboard Guide",
    description: "Understand how leaderboard rankings work and how to climb the ranks.",
    keywords: ["leaderboard", "ranking", "XP", "competition"],
    content: `
      <section>
        <h2>How Rankings Work</h2>
        <p>Leaderboard rankings are based on total XP earned. XP is gained through workouts, habits, progress logging, and challenge completion.</p>
      </section>
      <section>
        <h2>Scope Options</h2>
        <ul>
          <li><strong>Global</strong> - All FitConnect users worldwide</li>
          <li><strong>Country</strong> - Users in your country</li>
          <li><strong>County</strong> - Users in your county/region</li>
          <li><strong>City</strong> - Users in your city</li>
        </ul>
      </section>
      <section>
        <h2>Privacy</h2>
        <p>Leaderboard participation is opt-in. Enable or disable your appearance in rankings from Settings → Privacy.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Consistency beats intensity – daily activity accumulates more XP over time.</div>
    `
  },
  "/docs/client/grocery": {
    title: "Shopping Lists",
    description: "Generate shopping lists from your meal plan and integrate with UK supermarkets.",
    keywords: ["shopping list", "grocery", "meal plan", "supermarket"],
    content: `
      <section>
        <h2>Creating a Shopping List</h2>
        <p>Generate lists manually or automatically from your nutrition plan.</p>
      </section>
      <section>
        <h2>Generate from Meal Plan</h2>
        <div class="step"><span class="step-number">1</span><div>Open your active nutrition plan</div></div>
        <div class="step"><span class="step-number">2</span><div>Click <strong>Generate Shopping List</strong></div></div>
        <div class="step"><span class="step-number">3</span><div>Select the number of days to include</div></div>
        <div class="step"><span class="step-number">4</span><div>Review and edit the generated list</div></div>
      </section>
      <section>
        <h2>Supermarket Integration</h2>
        <p>Connect to Tesco, Sainsbury's, or Asda to compare prices and add items directly to your online basket.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Check items off as you shop to track what you've picked up.</div>
    `
  },
  "/docs/client/library": {
    title: "Digital Library",
    description: "Access purchased e-books, courses, and digital content from your coaches.",
    keywords: ["library", "ebooks", "courses", "digital content"],
    content: `
      <section>
        <h2>Your Digital Library</h2>
        <p>All purchased digital products appear in your library. Access e-books, video courses, workout templates, and audio content anytime.</p>
      </section>
      <section>
        <h2>Content Types</h2>
        <ul>
          <li><strong>E-Books & PDFs</strong> - Read online or download for offline</li>
          <li><strong>Video Courses</strong> - Stream lessons with progress tracking</li>
          <li><strong>Templates</strong> - Downloadable workout and meal plan templates</li>
          <li><strong>Audio</strong> - Meditation, motivation, and coaching audio</li>
        </ul>
      </section>
      <section>
        <h2>Downloading Content</h2>
        <p>Download content for offline access. Downloaded files remain available even if your subscription expires.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Downloaded files remain yours permanently, even if a product is later removed from sale.</div>
    `
  },
  "/docs/client/marketplace": {
    title: "Marketplace Guide",
    description: "Browse and purchase digital fitness products from verified coaches.",
    keywords: ["marketplace", "buy", "digital products", "ebooks", "courses"],
    content: `
      <section>
        <h2>Browsing the Marketplace</h2>
        <p>The <a href="/marketplace">marketplace</a> features e-books, video courses, workout templates, and more from verified coaches.</p>
      </section>
      <section>
        <h2>Making a Purchase</h2>
        <div class="step"><span class="step-number">1</span><div>Find a product you're interested in</div></div>
        <div class="step"><span class="step-number">2</span><div>Click to view details, previews, and reviews</div></div>
        <div class="step"><span class="step-number">3</span><div>Click <strong>Buy Now</strong> and complete payment</div></div>
        <div class="step"><span class="step-number">4</span><div>Access your purchase in your <a href="/docs/client/library">library</a></div></div>
      </section>
      <section>
        <h2>Bundles</h2>
        <p>Save money with product bundles that combine multiple items at a discounted price.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Free products are a great way to sample a coach's content before purchasing.</div>
    `
  },

  // ============ COACH DOCS ============
  "/docs/coach/onboarding": {
    title: "Coach Onboarding",
    description: "Complete your coach profile setup and get verified to start accepting clients.",
    keywords: ["coach setup", "onboarding", "verification", "profile"],
    content: `
      <section>
        <h2>Getting Started as a Coach</h2>
        <p>Welcome to FitConnect! Follow these steps to set up your coaching business on our platform.</p>
      </section>
      <section>
        <h2>Onboarding Steps</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Complete your profile</strong> - Add your bio, specialties, and experience</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Upload credentials</strong> - Submit certifications and insurance for verification</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Set your services</strong> - Define session types and pricing</div></div>
        <div class="step"><span class="step-number">4</span><div><strong>Configure availability</strong> - Set your working hours and calendar</div></div>
        <div class="step"><span class="step-number">5</span><div><strong>Connect payments</strong> - Link your Stripe account to receive payouts</div></div>
      </section>
      <section>
        <h2>Verification</h2>
        <p>Once submitted, our team reviews your documents. Verification typically takes 1-3 business days. Learn more about <a href="/docs/coach/verification">verification requirements</a>.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Complete profiles with professional photos receive 3x more booking requests.</div>
    `
  },
  "/docs/coach/clients": {
    title: "Managing Clients",
    description: "View client profiles, track their progress, and manage your coaching relationships.",
    keywords: ["client management", "roster", "client profiles", "coaching"],
    content: `
      <section>
        <h2>Your Client Roster</h2>
        <p>Access all your clients from the Clients dashboard. View profiles, progress, and communication history in one place.</p>
      </section>
      <section>
        <h2>Client Profiles</h2>
        <p>Each client profile shows their goals, health data, assigned plans, session history, and engagement metrics. Use tags and notes to organize your roster.</p>
      </section>
      <section>
        <h2>Engagement Scores</h2>
        <p>Monitor client engagement through our AI-powered scoring system. Identify at-risk clients who may need extra attention or motivation.</p>
      </section>
      <section>
        <h2>Client Notes</h2>
        <p>Add private notes to client profiles to track important information, session observations, and follow-up items.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Regular check-ins with at-risk clients can significantly improve retention.</div>
    `
  },
  "/docs/coach/plans": {
    title: "Creating Plans",
    description: "Build and assign workout and nutrition plans using our drag-and-drop builder.",
    keywords: ["workout builder", "nutrition plans", "program design", "coaching tools"],
    content: `
      <section>
        <h2>Workout Plan Builder</h2>
        <p>Create custom training programs with our drag-and-drop workout builder. Choose from our exercise library or add custom exercises with video demos.</p>
      </section>
      <section>
        <h2>Building a Workout Plan</h2>
        <div class="step"><span class="step-number">1</span><div>Create a new plan and set the duration (weeks)</div></div>
        <div class="step"><span class="step-number">2</span><div>Add training days and name each session</div></div>
        <div class="step"><span class="step-number">3</span><div>Add exercises with sets, reps, tempo, and rest</div></div>
        <div class="step"><span class="step-number">4</span><div>Set progression rules (weekly increases)</div></div>
        <div class="step"><span class="step-number">5</span><div>Assign to clients</div></div>
      </section>
      <section>
        <h2>Nutrition Plan Builder</h2>
        <p>Create meal plans with macro targets. Use our food database or AI suggestions to build balanced meals.</p>
      </section>
      <section>
        <h2>Templates</h2>
        <p>Save plans as templates to quickly assign to new clients with similar goals.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Use AI to generate initial plans, then customize for each client.</div>
    `
  },
  "/docs/coach/nutrition": {
    title: "Nutrition Builder",
    description: "Create personalized meal plans with macro tracking and AI-powered suggestions.",
    keywords: ["nutrition planning", "meal plans", "macros", "diet coaching"],
    content: `
      <section>
        <h2>Nutrition Plan Features</h2>
        <ul>
          <li>Daily meal plans with breakfast, lunch, dinner, and snacks</li>
          <li>Macro and calorie targets per meal</li>
          <li>Food database with 650,000+ items</li>
          <li>AI meal suggestions based on client preferences</li>
          <li>Shopping list generation</li>
        </ul>
      </section>
      <section>
        <h2>Creating a Nutrition Plan</h2>
        <div class="step"><span class="step-number">1</span><div>Set client's calorie and macro targets</div></div>
        <div class="step"><span class="step-number">2</span><div>Add meals or use AI suggestions</div></div>
        <div class="step"><span class="step-number">3</span><div>Adjust portions to meet targets</div></div>
        <div class="step"><span class="step-number">4</span><div>Account for allergies and preferences</div></div>
        <div class="step"><span class="step-number">5</span><div>Assign to client</div></div>
      </section>
      <section>
        <h2>AI Meal Suggestions</h2>
        <p>Our AI can generate complete meal plans based on client goals, dietary restrictions, and food preferences. Review and modify suggestions before assigning.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Clients can generate shopping lists from their meal plans and order from UK supermarkets.</div>
    `
  },
  "/docs/coach/schedule": {
    title: "Schedule & Availability",
    description: "Set your working hours, manage bookings, and sync with external calendars.",
    keywords: ["schedule", "availability", "calendar", "booking management"],
    content: `
      <section>
        <h2>Setting Your Availability</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Schedule</div></div>
        <div class="step"><span class="step-number">2</span><div>Set your weekly working hours</div></div>
        <div class="step"><span class="step-number">3</span><div>Block off time for holidays or personal commitments</div></div>
      </section>
      <section>
        <h2>Managing Bookings</h2>
        <p>Review incoming booking requests, accept or decline, and manage your session calendar. Set buffer time between sessions automatically.</p>
      </section>
      <section>
        <h2>Calendar Sync</h2>
        <p>Connect <a href="/docs/integrations/google-calendar">Google Calendar</a> or <a href="/docs/integrations/apple-calendar">Apple Calendar</a> for two-way sync. Busy times from your personal calendar automatically block availability.</p>
      </section>
      <section>
        <h2>Online Sessions</h2>
        <p>Enable online sessions to generate automatic Zoom or Google Meet links for booked appointments.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Leave 10-15 minute buffer between sessions for notes and transitions.</div>
    `
  },
  "/docs/coach/messaging": {
    title: "Messaging & Templates",
    description: "Communicate with clients and use message templates for efficient outreach.",
    keywords: ["messaging", "templates", "client communication", "automation"],
    content: `
      <section>
        <h2>Messaging Clients</h2>
        <p>Send individual messages or broadcast to multiple clients. Attach files, images, and links to provide resources and guidance.</p>
      </section>
      <section>
        <h2>Message Templates</h2>
        <p>Create reusable templates for common messages like welcome emails, check-ins, and motivational messages. Use variables to personalize automatically.</p>
      </section>
      <section>
        <h2>Quick Actions</h2>
        <ul>
          <li>Send check-in prompts</li>
          <li>Request progress photos</li>
          <li>Share workout modifications</li>
          <li>Celebrate achievements</li>
        </ul>
      </section>
      <section>
        <h2>Automation</h2>
        <p>Set up automated messages for milestones, check-ins, and at-risk client outreach. Learn more about <a href="/docs/coach/automations">automation features</a>.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Respond to client messages within 24-48 hours to maintain engagement.</div>
    `
  },
  "/docs/coach/packages": {
    title: "Packages & Subscriptions",
    description: "Create session packages and subscription plans for recurring revenue.",
    keywords: ["packages", "subscriptions", "pricing", "session bundles"],
    content: `
      <section>
        <h2>Session Packages</h2>
        <p>Create bundles of sessions at a discounted rate. Packages encourage commitment and provide predictable income.</p>
      </section>
      <section>
        <h2>Creating a Package</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Services → Packages</div></div>
        <div class="step"><span class="step-number">2</span><div>Set package name and number of sessions</div></div>
        <div class="step"><span class="step-number">3</span><div>Set total price (with implicit discount)</div></div>
        <div class="step"><span class="step-number">4</span><div>Set expiry period (e.g., 3 months)</div></div>
      </section>
      <section>
        <h2>Subscription Plans</h2>
        <p>Offer monthly or weekly subscriptions for ongoing coaching. Include sessions, messaging access, and plan updates in your tiers.</p>
      </section>
      <section>
        <h2>Tracking Usage</h2>
        <p>Monitor session usage and expiring packages from your dashboard. Send reminders to clients with unused sessions.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Offer a 10-20% discount on packages vs single sessions to encourage commitment.</div>
    `
  },
  "/docs/coach/earnings": {
    title: "Earnings & Payouts",
    description: "Track your revenue, view payout history, and manage your Stripe connection.",
    keywords: ["earnings", "payouts", "revenue", "Stripe", "payments"],
    content: `
      <section>
        <h2>Earnings Dashboard</h2>
        <p>View your total earnings, pending payouts, and revenue breakdown by service type. Filter by date range for detailed analysis.</p>
      </section>
      <section>
        <h2>Payout Schedule</h2>
        <p>Payouts are processed automatically via Stripe. Funds typically arrive 2-7 business days after a session is completed.</p>
      </section>
      <section>
        <h2>Stripe Connection</h2>
        <p>Connect your Stripe account during onboarding to receive payouts. Update your bank details or switch accounts from Settings → Payments.</p>
      </section>
      <section>
        <h2>Invoices & Tax</h2>
        <p>Download invoices and earnings reports for tax purposes. Consult a tax professional for guidance on self-employment income.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Set aside a portion of each payment for tax obligations.</div>
    `
  },
  "/docs/coach/reviews": {
    title: "Managing Reviews",
    description: "View and respond to client reviews on your profile.",
    keywords: ["reviews", "ratings", "feedback", "reputation"],
    content: `
      <section>
        <h2>Your Reviews</h2>
        <p>Clients can leave reviews after completing sessions. Reviews appear on your public profile and influence your visibility in search results.</p>
      </section>
      <section>
        <h2>Responding to Reviews</h2>
        <p>You can respond publicly to any review. Professional responses to both positive and negative feedback builds trust with potential clients.</p>
      </section>
      <section>
        <h2>Impact on Visibility</h2>
        <p>Coaches with more positive reviews rank higher in search results. Encourage satisfied clients to leave reviews after their sessions.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Respond to every review within 48 hours to show you're engaged and professional.</div>
    `
  },
  "/docs/coach/verification": {
    title: "Coach Verification",
    description: "Learn about the verification process and required documents.",
    keywords: ["verification", "credentials", "certifications", "insurance"],
    content: `
      <section>
        <h2>Why Get Verified?</h2>
        <ul>
          <li><strong>Verified badge</strong> - Display on your profile</li>
          <li><strong>Higher visibility</strong> - Appear higher in search results</li>
          <li><strong>Client trust</strong> - Clients prefer verified coaches</li>
          <li><strong>Exclusive avatar</strong> - Unlock verification-exclusive avatar</li>
        </ul>
      </section>
      <section>
        <h2>Required Documents</h2>
        <ul>
          <li><strong>Government ID</strong> - Passport or driving licence</li>
          <li><strong>Professional Certifications</strong> - REPs, CIMSPA, or equivalent</li>
          <li><strong>Insurance Certificate</strong> - Public liability insurance</li>
          <li><strong>Additional Qualifications</strong> - Optional specialist certifications</li>
        </ul>
      </section>
      <section>
        <h2>Verification Process</h2>
        <div class="step"><span class="step-number">1</span><div>Submit documents through Settings</div></div>
        <div class="step"><span class="step-number">2</span><div>Initial automated review (24 hours)</div></div>
        <div class="step"><span class="step-number">3</span><div>Manual review by our team (1-3 days)</div></div>
        <div class="step"><span class="step-number">4</span><div>Approval notification and badge activation</div></div>
      </section>
      <div class="tip"><strong>Tip:</strong> Ensure documents are clear, legible photos or scans. Blurry images delay verification.</div>
    `
  },
  "/docs/coach/boost": {
    title: "Coach Boost",
    description: "Increase your visibility in search results with the Boost marketing feature.",
    keywords: ["boost", "marketing", "visibility", "promotion"],
    content: `
      <section>
        <h2>What is Boost?</h2>
        <p>Boost is a paid marketing feature that increases your profile visibility in search results. Boosted profiles appear at the top with a "Featured" label.</p>
      </section>
      <section>
        <h2>Pricing</h2>
        <ul>
          <li><strong>Activation fee</strong> - One-time fee to start Boost</li>
          <li><strong>Commission</strong> - Percentage of first booking from new clients acquired through Boost</li>
          <li><strong>Minimum/Maximum fees</strong> - Floor and ceiling on commission amounts</li>
        </ul>
      </section>
      <section>
        <h2>How It Works</h2>
        <div class="step"><span class="step-number">1</span><div>Purchase Boost from your dashboard</div></div>
        <div class="step"><span class="step-number">2</span><div>Your profile appears at top of search results</div></div>
        <div class="step"><span class="step-number">3</span><div>New clients book with you</div></div>
        <div class="step"><span class="step-number">4</span><div>Pay commission on first booking from each new client</div></div>
      </section>
      <section>
        <h2>Duration</h2>
        <p>Boost lasts 30 days from purchase. It does not auto-renew – purchase again when expired.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Optimize your profile with photos and reviews before boosting for best results.</div>
    `
  },
  "/docs/coach/products": {
    title: "Digital Products",
    description: "Create and sell e-books, courses, and templates through the marketplace.",
    keywords: ["digital products", "ebooks", "courses", "passive income"],
    content: `
      <section>
        <h2>Selling Digital Products</h2>
        <p>Create passive income by selling digital products on the <a href="/marketplace">marketplace</a>. Products include e-books, video courses, workout templates, and audio content.</p>
      </section>
      <section>
        <h2>Product Types</h2>
        <ul>
          <li><strong>E-Books & PDFs</strong> - Training guides, recipe books, educational content</li>
          <li><strong>Video Courses</strong> - Multi-lesson programs with progress tracking</li>
          <li><strong>Templates</strong> - Workout plans, meal plans, tracking sheets</li>
          <li><strong>Audio</strong> - Meditations, motivational content, podcasts</li>
        </ul>
      </section>
      <section>
        <h2>Creating a Product</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Products → Create New</div></div>
        <div class="step"><span class="step-number">2</span><div>Upload your content files</div></div>
        <div class="step"><span class="step-number">3</span><div>Add title, description, and cover image</div></div>
        <div class="step"><span class="step-number">4</span><div>Set your price</div></div>
        <div class="step"><span class="step-number">5</span><div>Publish to marketplace</div></div>
      </section>
      <div class="warning"><strong>iOS App Store:</strong> Paid digital products cannot be purchased through the iOS app due to Apple's policies. Direct clients to the website for purchases.</div>
    `
  },
  "/docs/coach/profile": {
    title: "Profile Setup",
    description: "Optimize your coach profile to attract more clients.",
    keywords: ["profile", "bio", "photos", "branding"],
    content: `
      <section>
        <h2>Profile Elements</h2>
        <ul>
          <li><strong>Profile Photo</strong> - Professional headshot or action photo</li>
          <li><strong>Cover Image</strong> - Banner image for your profile</li>
          <li><strong>Bio</strong> - Your story, experience, and approach</li>
          <li><strong>Specialties</strong> - Coach types and focus areas</li>
          <li><strong>Credentials</strong> - Certifications and qualifications</li>
          <li><strong>Portfolio</strong> - Client transformations (with permission)</li>
        </ul>
      </section>
      <section>
        <h2>Writing Your Bio</h2>
        <p>Include your background, training philosophy, who you work best with, and what clients can expect. Be authentic and personable.</p>
      </section>
      <section>
        <h2>Portfolio & Case Studies</h2>
        <p>Showcase client success stories with before/after photos and testimonials. Always get written consent before sharing client information.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Profiles with professional photos receive significantly more booking inquiries.</div>
    `
  },
  "/docs/coach/ai": {
    title: "AI Tools for Coaches",
    description: "Use AI to generate workout plans, nutrition suggestions, and client insights.",
    keywords: ["AI", "automation", "workout generator", "meal planner"],
    content: `
      <section>
        <h2>Available AI Features</h2>
        <ul>
          <li><a href="/docs/coach/ai/workout-generator">Workout Plan Generator</a> - Create customized training programs</li>
          <li><a href="/docs/coach/ai/nutrition-generator">Meal Plan Suggestions</a> - Generate balanced meal plans</li>
          <li><a href="/docs/coach/ai/macro-calculator">Macro Calculator</a> - Calculate personalized macro targets</li>
          <li><a href="/docs/coach/ai/client-summary">Client Summary</a> - AI-generated progress reports</li>
          <li><a href="/docs/coach/ai/progress-insights">Progress Insights</a> - Analyze client trends</li>
        </ul>
      </section>
      <section>
        <h2>AI Client Analysis</h2>
        <p>Generate comprehensive reports analyzing client progress, engagement, and recommendations for program adjustments.</p>
      </section>
      <div class="tip"><strong>Important:</strong> AI suggestions are starting points. Always review and customize for each client's specific needs.</div>
    `
  },
  "/docs/coach/group-classes": {
    title: "Group Classes",
    description: "Create and manage group training sessions with multiple participants.",
    keywords: ["group classes", "group training", "bootcamp", "classes"],
    content: `
      <section>
        <h2>Creating Group Classes</h2>
        <p>Offer group training sessions to multiple clients at once. Set capacity limits and pricing different from individual sessions.</p>
      </section>
      <section>
        <h2>Class Setup</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Services → Group Classes</div></div>
        <div class="step"><span class="step-number">2</span><div>Create class with name, description, and duration</div></div>
        <div class="step"><span class="step-number">3</span><div>Set maximum participants</div></div>
        <div class="step"><span class="step-number">4</span><div>Set pricing per person</div></div>
        <div class="step"><span class="step-number">5</span><div>Schedule recurring or one-time sessions</div></div>
      </section>
      <section>
        <h2>Managing Participants</h2>
        <p>View who's registered, send group messages, and manage waitlists for popular classes.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Group classes can supplement one-on-one coaching for additional revenue.</div>
    `
  },
  "/docs/coach/pipeline": {
    title: "Sales Pipeline",
    description: "Track leads and convert inquiries into paying clients.",
    keywords: ["sales", "leads", "pipeline", "conversions"],
    content: `
      <section>
        <h2>Pipeline Overview</h2>
        <p>The sales pipeline helps you track potential clients from first inquiry to booking. Move leads through stages as they progress.</p>
      </section>
      <section>
        <h2>Pipeline Stages</h2>
        <ul>
          <li><strong>New Lead</strong> - Initial inquiry received</li>
          <li><strong>Contacted</strong> - You've responded to their inquiry</li>
          <li><strong>Offer Sent</strong> - You've sent pricing/package details</li>
          <li><strong>Closed</strong> - Lead converted to client (or lost)</li>
        </ul>
      </section>
      <section>
        <h2>Managing Leads</h2>
        <p>Add notes, set follow-up reminders, and track conversion rates to optimize your sales process.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Follow up within 24 hours to maximize conversion rates.</div>
    `
  },
  "/docs/coach/automations": {
    title: "Automations Overview",
    description: "Set up automated messages, check-ins, and client engagement workflows.",
    keywords: ["automation", "workflows", "automated messages", "engagement"],
    content: `
      <section>
        <h2>Available Automations</h2>
        <ul>
          <li><a href="/docs/coach/automations/reminder">Reminder Messages</a> - Automated session and habit reminders</li>
          <li><a href="/docs/coach/automations/scheduled-checkins">Scheduled Check-ins</a> - Regular progress check-ins</li>
          <li><a href="/docs/coach/automations/milestone">Milestone Celebrations</a> - Auto-celebrate achievements</li>
          <li><a href="/docs/coach/automations/dropoff-rescue">Drop-off Rescue</a> - Re-engage inactive clients</li>
        </ul>
      </section>
      <section>
        <h2>How Automations Work</h2>
        <p>Automations trigger based on client behavior or schedules. You define the conditions and message content, and the system sends automatically.</p>
      </section>
      <section>
        <h2>Best Practices</h2>
        <p>Automations save time but should complement, not replace, personal communication. Use them for routine outreach and reminders.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Start with one or two automations and expand as you see results.</div>
    `
  },
  "/docs/coach/showcase": {
    title: "Client Showcases",
    description: "Create compelling case studies to demonstrate your coaching results.",
    keywords: ["case studies", "testimonials", "portfolio", "results"],
    content: `
      <section>
        <h2>Creating Showcases</h2>
        <p>Showcases display client transformations with permission. Include before/after photos, testimonials, and journey narratives.</p>
      </section>
      <section>
        <h2>What to Include</h2>
        <ul>
          <li>Client's starting point and goals</li>
          <li>The program and approach used</li>
          <li>Progress photos (with permission)</li>
          <li>Key metrics and achievements</li>
          <li>Client testimonial</li>
        </ul>
      </section>
      <section>
        <h2>AI Narrative Generation</h2>
        <p>Our AI can generate compelling narratives from your client data and notes. Review and edit before publishing.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Always get written consent from clients before creating showcases.</div>
    `
  },
  "/docs/coach/integrations": {
    title: "Coach Integrations",
    description: "Connect external tools and calendars with your coaching dashboard.",
    keywords: ["integrations", "calendar sync", "Zoom", "Google Meet"],
    content: `
      <section>
        <h2>Available Integrations</h2>
        <ul>
          <li><a href="/docs/integrations/google-calendar">Google Calendar</a> - Two-way sync</li>
          <li><a href="/docs/integrations/apple-calendar">Apple Calendar</a> - Two-way sync</li>
          <li><a href="/docs/integrations/zoom">Zoom</a> - Auto-generate meeting links</li>
          <li><a href="/docs/integrations/google-meet">Google Meet</a> - Auto-generate meeting links</li>
        </ul>
      </section>
      <section>
        <h2>Calendar Sync</h2>
        <p>Sync your coaching calendar with personal calendars to prevent double-booking. Busy times automatically block availability.</p>
      </section>
      <section>
        <h2>Video Conferencing</h2>
        <p>Connect Zoom or Google Meet to automatically generate unique meeting links for online sessions.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Use a dedicated calendar for coaching to keep work and personal commitments separate.</div>
    `
  },
  "/docs/coach/settings": {
    title: "Coach Settings",
    description: "Configure your notification preferences, payment settings, and account options.",
    keywords: ["settings", "preferences", "notifications", "account"],
    content: `
      <section>
        <h2>Account Settings</h2>
        <ul>
          <li><strong>Profile</strong> - Update bio, photos, and contact info</li>
          <li><strong>Notifications</strong> - Email and push notification preferences</li>
          <li><strong>Payments</strong> - Stripe connection and payout settings</li>
          <li><strong>Integrations</strong> - Connected apps and calendars</li>
          <li><strong>Privacy</strong> - Data sharing and visibility settings</li>
        </ul>
      </section>
      <section>
        <h2>Business Settings</h2>
        <ul>
          <li><strong>Services</strong> - Session types and pricing</li>
          <li><strong>Availability</strong> - Working hours and calendar</li>
          <li><strong>Booking Rules</strong> - Lead time, cancellation policy</li>
          <li><strong>Automations</strong> - Message templates and workflows</li>
        </ul>
      </section>
      <div class="tip"><strong>Tip:</strong> Review your settings monthly to ensure they reflect your current business needs.</div>
    `
  },

  // ============ AI TOOLS DOCS ============
  "/docs/coach/ai/workout-generator": {
    title: "AI Workout Generator",
    description: "Generate personalized workout plans using AI based on client goals and equipment.",
    keywords: ["AI workout", "program generator", "training plan", "automation"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>The AI Workout Generator creates customized training programs based on client data, goals, available equipment, and training experience.</p>
      </section>
      <section>
        <h2>How It Works</h2>
        <div class="step"><span class="step-number">1</span><div>Select a client from your roster</div></div>
        <div class="step"><span class="step-number">2</span><div>Specify goals, training days, and equipment</div></div>
        <div class="step"><span class="step-number">3</span><div>Generate the AI plan</div></div>
        <div class="step"><span class="step-number">4</span><div>Review, customize, and assign</div></div>
      </section>
      <section>
        <h2>Customization</h2>
        <p>AI-generated plans are starting points. Always review exercises, volumes, and progressions before assigning to clients.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> The more client data you provide (goals, experience, injuries), the better the AI suggestions.</div>
    `
  },
  "/docs/coach/ai/nutrition-generator": {
    title: "AI Nutrition Generator",
    description: "Generate personalized meal plans that meet macro targets and dietary preferences.",
    keywords: ["AI nutrition", "meal generator", "diet plan", "macros"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>The AI Nutrition Generator creates balanced meal plans based on calorie and macro targets, dietary restrictions, and food preferences.</p>
      </section>
      <section>
        <h2>How It Works</h2>
        <div class="step"><span class="step-number">1</span><div>Set client's calorie and macro targets</div></div>
        <div class="step"><span class="step-number">2</span><div>Specify dietary restrictions and preferences</div></div>
        <div class="step"><span class="step-number">3</span><div>Generate meal suggestions</div></div>
        <div class="step"><span class="step-number">4</span><div>Review, swap items, and assign</div></div>
      </section>
      <section>
        <h2>Food Database</h2>
        <p>Access over 650,000 food items with nutritional data. Add custom recipes and branded products.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Generate multiple options and let clients choose meals they'll actually enjoy.</div>
    `
  },
  "/docs/coach/ai/macro-calculator": {
    title: "AI Macro Calculator",
    description: "Automatically calculate personalized calorie and macro targets for clients.",
    keywords: ["macro calculator", "calories", "TDEE", "nutrition targets"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>The AI Macro Calculator determines optimal calorie and macronutrient targets based on client data and goals.</p>
      </section>
      <section>
        <h2>Input Data</h2>
        <ul>
          <li>Age, gender, height, weight</li>
          <li>Activity level (sedentary to very active)</li>
          <li>Goal (fat loss, maintenance, muscle gain)</li>
          <li>Training frequency</li>
        </ul>
      </section>
      <section>
        <h2>Calculation Methods</h2>
        <ul>
          <li><strong>Mifflin-St Jeor</strong> - Standard BMR calculation</li>
          <li><strong>Katch-McArdle</strong> - Uses lean body mass when available</li>
          <li><strong>Adaptive</strong> - Adjusts based on progress data over time</li>
        </ul>
      </section>
      <div class="tip"><strong>Tip:</strong> Recalculate targets every 4-6 weeks or when significant weight changes occur.</div>
    `
  },
  "/docs/coach/ai/client-summary": {
    title: "AI Client Summary",
    description: "Generate comprehensive AI reports summarizing client progress and recommendations.",
    keywords: ["client summary", "progress report", "AI analysis", "recommendations"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Generate AI-powered summaries that analyze client progress, engagement, and provide actionable recommendations.</p>
      </section>
      <section>
        <h2>What's Included</h2>
        <ul>
          <li>Progress toward goals</li>
          <li>Workout completion rates</li>
          <li>Habit compliance</li>
          <li>Engagement trends</li>
          <li>Recommendations for adjustments</li>
        </ul>
      </section>
      <section>
        <h2>Using Summaries</h2>
        <p>Share summaries with clients to celebrate progress and discuss next steps. Use insights to adjust their programs.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Schedule weekly summaries to stay proactive with client communication.</div>
    `
  },
  "/docs/coach/ai/progress-insights": {
    title: "AI Progress Insights",
    description: "Analyze client trends and get AI-powered insights for program optimization.",
    keywords: ["progress insights", "trends", "analysis", "optimization"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Progress Insights analyzes client data over time to identify trends, plateaus, and opportunities for improvement.</p>
      </section>
      <section>
        <h2>Insights Provided</h2>
        <ul>
          <li>Weight and measurement trends</li>
          <li>Strength progression analysis</li>
          <li>Compliance patterns</li>
          <li>Plateau detection</li>
          <li>Recovery indicators</li>
        </ul>
      </section>
      <section>
        <h2>Taking Action</h2>
        <p>Use insights to make data-driven decisions about program adjustments, deloads, and goal revisions.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Review insights before client check-ins to come prepared with specific observations.</div>
    `
  },
  "/docs/coach/ai/exercise-alternatives": {
    title: "AI Exercise Alternatives",
    description: "Get AI suggestions for exercise substitutions based on equipment or limitations.",
    keywords: ["exercise alternatives", "substitutions", "modifications"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>When clients can't perform a prescribed exercise due to equipment or injury, the AI suggests suitable alternatives that target the same muscle groups.</p>
      </section>
      <section>
        <h2>How to Use</h2>
        <p>From any exercise in a workout plan, click "Find Alternative" to get AI-powered suggestions. Filter by available equipment.</p>
      </section>
      <section>
        <h2>Considerations</h2>
        <p>Alternatives maintain training stimulus while accommodating limitations. Review suggestions to ensure they're appropriate for your client.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Save commonly used alternatives as templates for quick swaps.</div>
    `
  },
  "/docs/coach/ai/food-substitutions": {
    title: "AI Food Substitutions",
    description: "Get AI suggestions for food swaps that maintain nutritional targets.",
    keywords: ["food substitutions", "meal swaps", "alternatives", "dietary"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>When clients need to swap foods due to preferences, availability, or allergies, the AI suggests alternatives with similar macros and calories.</p>
      </section>
      <section>
        <h2>How to Use</h2>
        <p>From any food item in a meal plan, click "Find Substitute" to get nutritionally similar options. Filter by dietary requirements.</p>
      </section>
      <section>
        <h2>Smart Matching</h2>
        <p>Suggestions prioritize similar protein, carb, and fat ratios while respecting dietary restrictions and preferences.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Encourage clients to explore substitutes to find foods they enjoy within their plan.</div>
    `
  },
  "/docs/coach/ai/plan-recommendations": {
    title: "AI Plan Recommendations",
    description: "Get AI-powered suggestions for optimizing client workout and nutrition plans.",
    keywords: ["plan recommendations", "optimization", "adjustments", "AI suggestions"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>The AI analyzes client progress and generates recommendations for plan adjustments, progressions, and optimizations.</p>
      </section>
      <section>
        <h2>Types of Recommendations</h2>
        <ul>
          <li><strong>Volume adjustments</strong> - Increase or decrease training volume</li>
          <li><strong>Exercise progressions</strong> - Move to harder variations</li>
          <li><strong>Calorie adjustments</strong> - Based on weight trends</li>
          <li><strong>Deload suggestions</strong> - When recovery indicators decline</li>
        </ul>
      </section>
      <section>
        <h2>Applying Recommendations</h2>
        <p>Review AI suggestions and apply those that fit your coaching strategy. All changes require your approval.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Combine AI recommendations with your coaching expertise for best results.</div>
    `
  },
  "/docs/coach/ai/check-in-composer": {
    title: "AI Check-in Composer",
    description: "Generate personalized check-in messages for clients using AI.",
    keywords: ["check-in", "messages", "AI composer", "client communication"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>The Check-in Composer uses AI to draft personalized messages based on client progress, recent activity, and upcoming goals.</p>
      </section>
      <section>
        <h2>How It Works</h2>
        <div class="step"><span class="step-number">1</span><div>Select a client</div></div>
        <div class="step"><span class="step-number">2</span><div>Choose check-in type (weekly, motivational, progress)</div></div>
        <div class="step"><span class="step-number">3</span><div>Generate AI draft</div></div>
        <div class="step"><span class="step-number">4</span><div>Edit and personalize</div></div>
        <div class="step"><span class="step-number">5</span><div>Send to client</div></div>
      </section>
      <section>
        <h2>Personalization</h2>
        <p>AI drafts reference specific client achievements, struggles, and data points. Always review and add your personal touch.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Use AI drafts as starting points – your personal voice builds stronger client relationships.</div>
    `
  },

  // ============ AUTOMATION DOCS ============
  "/docs/coach/automations/reminder": {
    title: "Reminder Automations",
    description: "Set up automated reminders for sessions, workouts, and habit logging.",
    keywords: ["reminders", "notifications", "automation", "scheduling"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Reminder automations send timely notifications to clients for upcoming sessions, daily workouts, and habit tracking.</p>
      </section>
      <section>
        <h2>Reminder Types</h2>
        <ul>
          <li><strong>Session reminders</strong> - 24 hours and 1 hour before sessions</li>
          <li><strong>Workout reminders</strong> - Daily prompt to complete training</li>
          <li><strong>Habit reminders</strong> - Daily reminder at set times</li>
          <li><strong>Progress logging</strong> - Weekly prompt to log measurements</li>
        </ul>
      </section>
      <section>
        <h2>Configuration</h2>
        <p>Set reminder times, message templates, and which clients receive each reminder type.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Don't over-notify – choose the most impactful reminders for each client.</div>
    `
  },
  "/docs/coach/automations/scheduled-checkins": {
    title: "Scheduled Check-ins",
    description: "Automate regular progress check-ins with your clients.",
    keywords: ["check-ins", "scheduled messages", "progress", "automation"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Scheduled check-ins automatically send progress prompts to clients at regular intervals (weekly, biweekly, monthly).</p>
      </section>
      <section>
        <h2>Setting Up</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Automations → Scheduled Check-ins</div></div>
        <div class="step"><span class="step-number">2</span><div>Set frequency (weekly, biweekly, monthly)</div></div>
        <div class="step"><span class="step-number">3</span><div>Choose day and time</div></div>
        <div class="step"><span class="step-number">4</span><div>Customize the message template</div></div>
        <div class="step"><span class="step-number">5</span><div>Select which clients to include</div></div>
      </section>
      <section>
        <h2>Best Practices</h2>
        <p>Keep check-in questions specific and easy to answer. Follow up personally when clients respond.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Schedule check-ins at times when clients are most likely to respond.</div>
    `
  },
  "/docs/coach/automations/milestone": {
    title: "Milestone Celebrations",
    description: "Automatically celebrate client achievements and milestones.",
    keywords: ["milestones", "celebrations", "achievements", "motivation"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Milestone automations send celebratory messages when clients achieve significant goals or hit key targets.</p>
      </section>
      <section>
        <h2>Tracked Milestones</h2>
        <ul>
          <li>First workout completed</li>
          <li>Streak achievements (7, 30, 100 days)</li>
          <li>Weight goals reached</li>
          <li>Strength PRs</li>
          <li>Session counts (10, 25, 50, 100)</li>
        </ul>
      </section>
      <section>
        <h2>Customization</h2>
        <p>Customize messages for each milestone type. Include emojis, GIFs, or links to badges earned.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Personal follow-up after automated celebrations makes them more meaningful.</div>
    `
  },
  "/docs/coach/automations/dropoff-rescue": {
    title: "Drop-off Rescue",
    description: "Re-engage clients who have become inactive or disengaged.",
    keywords: ["retention", "re-engagement", "inactive clients", "drop-off"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Drop-off Rescue identifies clients who have become inactive and automatically sends re-engagement messages.</p>
      </section>
      <section>
        <h2>Detection Triggers</h2>
        <ul>
          <li>No workout logged in X days</li>
          <li>Missed scheduled sessions</li>
          <li>No app activity in X days</li>
          <li>Broken habit streaks</li>
        </ul>
      </section>
      <section>
        <h2>Rescue Stages</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Soft check-in</strong> - Friendly "checking in" message</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Support offer</strong> - Ask if they need help</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Coach alert</strong> - Notify you for personal outreach</div></div>
      </section>
      <div class="tip"><strong>Tip:</strong> Personal outreach after automated messages significantly improves recovery rates.</div>
    `
  },

  // ============ INTEGRATION DOCS ============
  "/docs/integrations/wearables": {
    title: "Wearables Overview",
    description: "Connect fitness trackers and health apps to sync your activity data.",
    keywords: ["wearables", "fitness trackers", "health apps", "sync"],
    content: `
      <section>
        <h2>Supported Integrations</h2>
        <ul>
          <li><a href="/docs/integrations/apple-health">Apple Health</a> - iPhone and Apple Watch</li>
          <li><a href="/docs/integrations/health-connect">Health Connect</a> - Android devices</li>
          <li><a href="/docs/integrations/fitbit">Fitbit</a> - Fitbit devices and app</li>
          <li><a href="/docs/integrations/garmin">Garmin</a> - Garmin watches and app</li>
        </ul>
      </section>
      <section>
        <h2>Data We Sync</h2>
        <ul>
          <li>Daily steps and activity</li>
          <li>Heart rate and resting heart rate</li>
          <li>Calories burned</li>
          <li>Sleep data</li>
          <li>Weight measurements</li>
          <li>Workout recordings</li>
        </ul>
      </section>
      <section>
        <h2>Privacy</h2>
        <p>You control what data is synced and shared with your coach. Adjust permissions in Settings → Integrations.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Regular syncing provides more accurate insights for you and your coach.</div>
    `
  },
  "/docs/integrations/apple-health": {
    title: "Apple Health Integration",
    description: "Connect Apple Health to sync iPhone and Apple Watch data.",
    keywords: ["Apple Health", "iPhone", "Apple Watch", "HealthKit"],
    content: `
      <section>
        <h2>Connecting Apple Health</h2>
        <div class="step"><span class="step-number">1</span><div>Open FitConnect on your iPhone</div></div>
        <div class="step"><span class="step-number">2</span><div>Go to Settings → Integrations → Apple Health</div></div>
        <div class="step"><span class="step-number">3</span><div>Tap Connect and authorize permissions</div></div>
        <div class="step"><span class="step-number">4</span><div>Select which data types to sync</div></div>
      </section>
      <section>
        <h2>Synced Data</h2>
        <p>Steps, heart rate, calories, sleep, weight, workouts, and more. Apple Watch data syncs via Apple Health.</p>
      </section>
      <section>
        <h2>Troubleshooting</h2>
        <p>If data isn't syncing, check Apple Health permissions in iPhone Settings → Privacy → Health → FitConnect.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Ensure Apple Health has background refresh enabled for automatic syncing.</div>
    `
  },
  "/docs/integrations/apple-calendar": {
    title: "Apple Calendar Integration",
    description: "Sync your coaching schedule with Apple Calendar.",
    keywords: ["Apple Calendar", "iCloud", "calendar sync", "scheduling"],
    content: `
      <section>
        <h2>For Coaches</h2>
        <p>Connect Apple Calendar to sync your availability and booked sessions. Two-way sync prevents double-booking.</p>
      </section>
      <section>
        <h2>Connecting</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations → Apple Calendar</div></div>
        <div class="step"><span class="step-number">2</span><div>Sign in with your Apple ID</div></div>
        <div class="step"><span class="step-number">3</span><div>Select which calendar to sync</div></div>
        <div class="step"><span class="step-number">4</span><div>Enable two-way sync</div></div>
      </section>
      <section>
        <h2>Features</h2>
        <ul>
          <li>Booked sessions appear on your Apple Calendar</li>
          <li>Busy times automatically block availability</li>
          <li>Session reminders on your devices</li>
        </ul>
      </section>
      <div class="tip"><strong>Tip:</strong> Use a dedicated coaching calendar for cleaner separation from personal events.</div>
    `
  },
  "/docs/integrations/google-calendar": {
    title: "Google Calendar Integration",
    description: "Sync your coaching schedule with Google Calendar.",
    keywords: ["Google Calendar", "calendar sync", "scheduling", "availability"],
    content: `
      <section>
        <h2>For Coaches</h2>
        <p>Connect Google Calendar for two-way sync between FitConnect and your Google calendar.</p>
      </section>
      <section>
        <h2>Connecting</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations → Google Calendar</div></div>
        <div class="step"><span class="step-number">2</span><div>Click Connect and sign in with Google</div></div>
        <div class="step"><span class="step-number">3</span><div>Authorize calendar access</div></div>
        <div class="step"><span class="step-number">4</span><div>Select which calendar to sync</div></div>
      </section>
      <section>
        <h2>Two-Way Sync</h2>
        <p>FitConnect sessions appear on Google Calendar, and Google Calendar events block your FitConnect availability.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Enable automatic Google Meet links for online sessions.</div>
    `
  },
  "/docs/integrations/google-meet": {
    title: "Google Meet Integration",
    description: "Automatically generate Google Meet links for online coaching sessions.",
    keywords: ["Google Meet", "video calls", "online sessions", "conferencing"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Connect Google Calendar to automatically generate Google Meet links for online coaching sessions.</p>
      </section>
      <section>
        <h2>Requirements</h2>
        <ul>
          <li>Google Workspace or personal Google account</li>
          <li>Google Calendar integration enabled</li>
        </ul>
      </section>
      <section>
        <h2>How It Works</h2>
        <p>When a client books an online session, a unique Google Meet link is automatically generated and included in the booking confirmation.</p>
      </section>
      <section>
        <h2>Features</h2>
        <ul>
          <li>Automatic link generation</li>
          <li>Links included in calendar events</li>
          <li>Clients can join directly from booking</li>
        </ul>
      </section>
      <div class="tip"><strong>Tip:</strong> Test your Google Meet setup before your first online session.</div>
    `
  },
  "/docs/integrations/fitbit": {
    title: "Fitbit Integration",
    description: "Connect your Fitbit to sync activity, sleep, and health data.",
    keywords: ["Fitbit", "fitness tracker", "activity sync", "wearables"],
    content: `
      <section>
        <h2>Connecting Fitbit</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations → Fitbit</div></div>
        <div class="step"><span class="step-number">2</span><div>Click Connect and sign in to Fitbit</div></div>
        <div class="step"><span class="step-number">3</span><div>Authorize FitConnect to access your data</div></div>
        <div class="step"><span class="step-number">4</span><div>Choose which data types to sync</div></div>
      </section>
      <section>
        <h2>Synced Data</h2>
        <ul>
          <li>Daily steps and distance</li>
          <li>Active minutes and calories</li>
          <li>Heart rate and resting heart rate</li>
          <li>Sleep duration and stages</li>
          <li>Weight (from Fitbit Aria)</li>
        </ul>
      </section>
      <section>
        <h2>Sync Frequency</h2>
        <p>Data syncs automatically when you open the app. Manual sync available in Settings.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Keep your Fitbit app updated for the best sync experience.</div>
    `
  },
  "/docs/integrations/garmin": {
    title: "Garmin Integration",
    description: "Connect your Garmin device to sync activities and health metrics.",
    keywords: ["Garmin", "Garmin Connect", "sports watch", "activity sync"],
    content: `
      <section>
        <h2>Connecting Garmin</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations → Garmin</div></div>
        <div class="step"><span class="step-number">2</span><div>Click Connect and sign in to Garmin Connect</div></div>
        <div class="step"><span class="step-number">3</span><div>Authorize data access</div></div>
        <div class="step"><span class="step-number">4</span><div>Select data types to sync</div></div>
      </section>
      <section>
        <h2>Synced Data</h2>
        <ul>
          <li>Activities and workouts</li>
          <li>Steps and calories</li>
          <li>Heart rate data</li>
          <li>Sleep tracking</li>
          <li>Body composition (Garmin Index scale)</li>
        </ul>
      </section>
      <section>
        <h2>Supported Devices</h2>
        <p>All Garmin wearables that sync with Garmin Connect are supported, including Forerunner, Fenix, Venu, and Vivosmart.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Sync your Garmin to Garmin Connect first, then data flows to FitConnect.</div>
    `
  },
  "/docs/integrations/health-connect": {
    title: "Health Connect Integration",
    description: "Connect Health Connect on Android to sync fitness and health data.",
    keywords: ["Health Connect", "Android", "Google Health", "fitness sync"],
    content: `
      <section>
        <h2>What is Health Connect?</h2>
        <p>Health Connect is Android's unified health data platform, allowing apps to share fitness and health data securely.</p>
      </section>
      <section>
        <h2>Connecting</h2>
        <div class="step"><span class="step-number">1</span><div>Ensure Health Connect is installed (Android 14+ has it built-in)</div></div>
        <div class="step"><span class="step-number">2</span><div>Go to Settings → Integrations → Health Connect</div></div>
        <div class="step"><span class="step-number">3</span><div>Grant permissions for desired data types</div></div>
      </section>
      <section>
        <h2>Synced Data</h2>
        <p>Steps, workouts, heart rate, sleep, weight, and nutrition data from any app connected to Health Connect.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Connect other fitness apps to Health Connect to centralize all your health data.</div>
    `
  },
  "/docs/integrations/zoom": {
    title: "Zoom Integration",
    description: "Automatically generate Zoom meeting links for online coaching sessions.",
    keywords: ["Zoom", "video conferencing", "online sessions", "meetings"],
    content: `
      <section>
        <h2>Overview</h2>
        <p>Connect your Zoom account to automatically generate unique meeting links for online coaching sessions.</p>
      </section>
      <section>
        <h2>Connecting Zoom</h2>
        <div class="step"><span class="step-number">1</span><div>Go to Settings → Integrations → Zoom</div></div>
        <div class="step"><span class="step-number">2</span><div>Click Connect and sign in to Zoom</div></div>
        <div class="step"><span class="step-number">3</span><div>Authorize FitConnect to create meetings</div></div>
      </section>
      <section>
        <h2>How It Works</h2>
        <p>When clients book online sessions, Zoom meetings are automatically scheduled. Links are included in booking confirmations and calendar events.</p>
      </section>
      <section>
        <h2>Meeting Settings</h2>
        <p>Meetings use your Zoom account defaults. Adjust waiting room, recording, and other settings in your Zoom account.</p>
      </section>
      <div class="tip"><strong>Tip:</strong> Use a Zoom Pro account for meetings longer than 40 minutes.</div>
    `
  },
};

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
          <li><a href="/coaches/bodybuilding">Bodybuilding Coaches</a></li>
        </ul>
      </section>
      
      <section>
        <h2>Featured Coaches</h2>
        ${coachesList || "<p>No coaches available.</p>"}
      </section>
    </main>`
  });
}

// Coach category listing
async function renderCoachCategory(supabase: any, category: string): Promise<string> {
  const categoryMap: Record<string, { title: string; coachType: string; description: string }> = {
    "personal-trainers": {
      title: "Personal Trainers",
      coachType: "Personal Trainer",
      description: "Find verified personal trainers for one-on-one fitness coaching. Get customized workout plans and achieve your fitness goals."
    },
    "nutritionists": {
      title: "Nutritionists",
      coachType: "Nutritionist",
      description: "Connect with qualified nutritionists for personalized meal plans, macro coaching, and dietary guidance."
    },
    "boxing": {
      title: "Boxing Coaches",
      coachType: "Boxing",
      description: "Train with expert boxing coaches. Learn technique, improve fitness, and develop your boxing skills."
    },
    "mma": {
      title: "MMA Coaches",
      coachType: "MMA",
      description: "Find MMA coaches for mixed martial arts training. Develop striking, grappling, and overall fight skills."
    },
    "bodybuilding": {
      title: "Bodybuilding Coaches",
      coachType: "Bodybuilding",
      description: "Work with experienced bodybuilding coaches for competition prep, muscle building, and physique development."
    }
  };

  const categoryInfo = categoryMap[category];
  if (!categoryInfo) {
    return render404("Category not found");
  }

  const { data: coaches } = await supabase
    .from("coach_profiles")
    .select("username, display_name, coach_types, bio, hourly_rate, city, county, country, profile_image_url")
    .eq("is_verified", true)
    .eq("onboarding_completed", true)
    .eq("marketplace_visible", true)
    .contains("coach_types", [categoryInfo.coachType])
    .limit(30);

  const coachesList = coaches?.map((coach: any) => `
    <article>
      <h3><a href="/coaches/${coach.username}">${escapeHtml(coach.display_name)}</a></h3>
      <p class="text-muted">${escapeHtml(coach.coach_types?.join(", ") || categoryInfo.coachType)} Coach</p>
      <p>${escapeHtml(truncate(coach.bio || "", 120))}</p>
      <p class="text-muted">${[coach.city, coach.county, coach.country].filter(Boolean).join(", ") || "Location not specified"}</p>
      ${coach.hourly_rate ? `<p>From £${coach.hourly_rate}/session</p>` : ""}
    </article>
  `).join("\n") || "";

  return baseTemplate({
    title: `${categoryInfo.title} - Find ${categoryInfo.title} Near You`,
    description: categoryInfo.description,
    canonicalUrl: `/coaches/${category}`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: categoryInfo.title,
        description: categoryInfo.description,
        url: `${BASE_URL}/coaches/${category}`,
        numberOfItems: coaches?.length || 0,
        itemListElement: coaches?.map((coach: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: coach.display_name,
            url: `${BASE_URL}/coaches/${coach.username}`,
            jobTitle: categoryInfo.coachType
          }
        })) || []
      },
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Coaches", url: "/coaches" },
        { name: categoryInfo.title, url: `/coaches/${category}` }
      ])
    ],
    keywords: [`${category.replace("-", " ")}`, `find ${category.replace("-", " ")}`, `${category.replace("-", " ")} near me`, "fitness coach UK"],
    content: `
    <main class="container">
      <nav class="text-muted">
        <a href="/">Home</a> › <a href="/coaches">Coaches</a> › ${categoryInfo.title}
      </nav>
      
      <h1>${categoryInfo.title}</h1>
      <p>${categoryInfo.description}</p>
      
      <section>
        <h2>${coaches?.length || 0} ${categoryInfo.title} Available</h2>
        ${coachesList || `<p>No ${categoryInfo.title.toLowerCase()} currently available. Check back soon!</p>`}
      </section>
      
      <section>
        <h2>Looking for Other Specialties?</h2>
        <ul>
          ${Object.entries(categoryMap).filter(([key]) => key !== category).map(([key, info]) => 
            `<li><a href="/coaches/${key}">${info.title}</a></li>`
          ).join("\n")}
        </ul>
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

// Marketplace product
async function renderMarketplaceProduct(supabase: any, productIdOrSlug: string): Promise<string> {
  let product;
  
  // Try by slug first
  const { data: bySlug } = await supabase
    .from("digital_products")
    .select("*, coach_profiles!digital_products_coach_id_fkey(display_name, username)")
    .eq("slug", productIdOrSlug)
    .eq("is_published", true)
    .single();
    
  if (bySlug) {
    product = bySlug;
  } else {
    // Try by ID
    const { data: byId } = await supabase
      .from("digital_products")
      .select("*, coach_profiles!digital_products_coach_id_fkey(display_name, username)")
      .eq("id", productIdOrSlug)
      .eq("is_published", true)
      .single();
    product = byId;
  }

  if (!product) {
    return render404("Product not found");
  }

  const coach = product.coach_profiles;
  const priceDisplay = product.price === 0 ? "Free" : `£${product.price}`;

  return baseTemplate({
    title: `${product.title} - Digital Fitness Product`,
    description: product.short_description || truncate(product.description || "", 155),
    canonicalUrl: `/marketplace/${product.slug || product.id}`,
    ogImage: product.cover_image_url,
    schema: [
      productSchema(product, coach),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Marketplace", url: "/marketplace" },
        { name: product.title, url: `/marketplace/${product.slug || product.id}` }
      ])
    ],
    keywords: [product.category, product.content_type?.replace("_", " "), "fitness ebook", "workout guide"],
    content: `
    <main class="container">
      <nav class="text-muted">
        <a href="/">Home</a> › <a href="/marketplace">Marketplace</a> › ${escapeHtml(product.title)}
      </nav>
      
      <article>
        ${product.cover_image_url ? `<img src="${product.cover_image_url}" alt="${escapeHtml(product.title)}" style="max-width:400px;border-radius:1rem;">` : ""}
        
        <h1>${escapeHtml(product.title)}</h1>
        <p class="text-muted">${escapeHtml(product.content_type?.replace("_", " ") || "Digital Product")} • ${escapeHtml(product.category || "")}</p>
        
        <p style="font-size:1.5rem;font-weight:bold;color:hsl(var(--primary));">${priceDisplay}</p>
        
        ${coach ? `<p>By <a href="/coaches/${coach.username}">${escapeHtml(coach.display_name)}</a></p>` : ""}
        
        <section>
          <h2>Description</h2>
          <p>${escapeHtml(product.description || product.short_description || "No description available.")}</p>
        </section>
        
        <section>
          <h2>Get This Product</h2>
          <p><a href="/auth?tab=register&role=client">Create an account</a> to purchase and access this content.</p>
        </section>
      </article>
    </main>`
  });
}

// Marketplace bundle
async function renderMarketplaceBundle(supabase: any, bundleId: string): Promise<string> {
  const { data: bundle } = await supabase
    .from("digital_bundles")
    .select(`
      *,
      coach_profiles!digital_bundles_coach_id_fkey(display_name, username),
      bundle_products(
        digital_products(id, title, slug, price, content_type)
      )
    `)
    .eq("id", bundleId)
    .eq("is_published", true)
    .single();

  if (!bundle) {
    return render404("Bundle not found");
  }

  const coach = bundle.coach_profiles;
  const products = bundle.bundle_products?.map((bp: any) => bp.digital_products).filter(Boolean) || [];
  const totalValue = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0);

  return baseTemplate({
    title: `${bundle.title} - Digital Bundle`,
    description: bundle.description || `Get ${products.length} products in this bundle`,
    canonicalUrl: `/marketplace/bundles/${bundleId}`,
    ogImage: bundle.cover_image_url,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: bundle.title,
        description: bundle.description,
        image: bundle.cover_image_url,
        offers: {
          "@type": "AggregateOffer",
          lowPrice: bundle.price,
          highPrice: totalValue,
          priceCurrency: "GBP",
          offerCount: products.length
        }
      },
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Marketplace", url: "/marketplace" },
        { name: "Bundles", url: "/marketplace?tab=bundles" },
        { name: bundle.title, url: `/marketplace/bundles/${bundleId}` }
      ])
    ],
    keywords: ["fitness bundle", "digital products", "workout bundle", "value pack"],
    content: `
    <main class="container">
      <nav class="text-muted">
        <a href="/">Home</a> › <a href="/marketplace">Marketplace</a> › ${escapeHtml(bundle.title)}
      </nav>
      
      <article>
        ${bundle.cover_image_url ? `<img src="${bundle.cover_image_url}" alt="${escapeHtml(bundle.title)}" style="max-width:400px;border-radius:1rem;">` : ""}
        
        <h1>${escapeHtml(bundle.title)}</h1>
        <p class="text-muted">Bundle • ${products.length} products included</p>
        
        <p style="font-size:1.5rem;font-weight:bold;color:hsl(var(--primary));">£${bundle.price} <span class="text-muted" style="font-size:1rem;text-decoration:line-through;">£${totalValue}</span></p>
        
        ${coach ? `<p>By <a href="/coaches/${coach.username}">${escapeHtml(coach.display_name)}</a></p>` : ""}
        
        <section>
          <h2>What's Included</h2>
          <ul>
            ${products.map((p: any) => `<li>${escapeHtml(p.title)} (${escapeHtml(p.content_type?.replace("_", " ") || "Product")})</li>`).join("\n")}
          </ul>
        </section>
        
        <section>
          <h2>Description</h2>
          <p>${escapeHtml(bundle.description || "No description available.")}</p>
        </section>
        
        <section>
          <h2>Get This Bundle</h2>
          <p><a href="/auth?tab=register&role=client">Create an account</a> to purchase and access this bundle.</p>
        </section>
      </article>
    </main>`
  });
}

// Documentation pages - uses DOCS_CONTENT map
function renderDocsPage(path: string): string {
  const docContent = DOCS_CONTENT[path];
  
  if (docContent) {
    const pathParts = path.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Home", url: "/" }];
    
    let currentPath = "";
    for (const part of pathParts) {
      currentPath += `/${part}`;
      const partName = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      breadcrumbs.push({ name: partName, url: currentPath });
    }

    return baseTemplate({
      title: docContent.title,
      description: docContent.description,
      canonicalUrl: path,
      noIndex: docContent.noIndex || false,
      schema: [breadcrumbSchema(breadcrumbs)],
      keywords: docContent.keywords || ["fitconnect help", "fitness app guide"],
      content: `
      <main class="container">
        <nav class="text-muted">
          ${breadcrumbs.map(b => `<a href="${b.url}">${escapeHtml(b.name)}</a>`).join(" › ")}
        </nav>
        
        <article>
          <h1>${escapeHtml(docContent.title)}</h1>
          <p>${escapeHtml(docContent.description)}</p>
          ${docContent.content}
        </article>
      </main>`
    });
  }

  // Fallback for unmapped docs pages
  const pathParts = path.split("/").filter(Boolean);
  const title = pathParts[pathParts.length - 1]?.replace(/-/g, " ") || "Documentation";
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  
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
    title: formattedTitle,
    description: `Learn about ${formattedTitle.toLowerCase()} on FitConnect.`,
    canonicalUrl: path,
    schema: [breadcrumbSchema(breadcrumbs)],
    keywords: ["fitconnect help", "fitness app guide", formattedTitle.toLowerCase()],
    content: `
    <main class="container">
      <nav class="text-muted">
        ${breadcrumbs.map(b => `<a href="${b.url}">${escapeHtml(b.name)}</a>`).join(" › ")}
      </nav>
      
      <article>
        <h1>${escapeHtml(formattedTitle)}</h1>
        <p>Learn about ${escapeHtml(formattedTitle.toLowerCase())} on FitConnect.</p>
        <p>For detailed information, please visit our app or contact support.</p>
      </article>
    </main>`
  });
}

// Docs hub
function renderDocsHub(): string {
  return baseTemplate({
    title: "Help Center",
    description: "Find guides, tutorials, and answers to help you get the most out of FitConnect.",
    canonicalUrl: "/docs",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Help Center", url: "/docs" }])],
    keywords: ["help", "support", "guides", "documentation", "how to"],
    content: `
    <main class="container">
      <h1>FitConnect Help Center</h1>
      <p>Find guides, tutorials, and answers to help you get the most out of FitConnect.</p>
      
      <section>
        <h2>Getting Started</h2>
        <ul>
          <li><a href="/docs/client/getting-started">New to FitConnect? Start here</a></li>
        </ul>
      </section>
      
      <section>
        <h2>For Clients</h2>
        <ul>
          <li><a href="/docs/client/booking">Booking Sessions</a></li>
          <li><a href="/docs/client/coaches">Finding Coaches</a></li>
          <li><a href="/docs/client/plans">Workout & Nutrition Plans</a></li>
          <li><a href="/docs/client/progress">Tracking Progress</a></li>
          <li><a href="/docs/client/wearables">Connecting Wearables</a></li>
          <li><a href="/docs/client/achievements">Achievements & Leaderboards</a></li>
          <li><a href="/docs/client/challenges">Fitness Challenges</a></li>
          <li><a href="/docs/client/grocery">Shopping Lists</a></li>
          <li><a href="/docs/client/library">Digital Library</a></li>
          <li><a href="/docs/client/marketplace">Marketplace Guide</a></li>
        </ul>
      </section>
      
      <section>
        <h2>For Coaches</h2>
        <ul>
          <li><a href="/docs/coach/onboarding">Getting Started as a Coach</a></li>
          <li><a href="/docs/coach/clients">Managing Clients</a></li>
          <li><a href="/docs/coach/plans">Creating Plans</a></li>
          <li><a href="/docs/coach/nutrition">Nutrition Builder</a></li>
          <li><a href="/docs/coach/schedule">Schedule & Availability</a></li>
          <li><a href="/docs/coach/messaging">Messaging & Templates</a></li>
          <li><a href="/docs/coach/packages">Packages & Subscriptions</a></li>
          <li><a href="/docs/coach/earnings">Earnings & Payouts</a></li>
          <li><a href="/docs/coach/verification">Coach Verification</a></li>
          <li><a href="/docs/coach/boost">Coach Boost</a></li>
          <li><a href="/docs/coach/products">Digital Products</a></li>
          <li><a href="/docs/coach/ai">AI Tools</a></li>
          <li><a href="/docs/coach/automations">Automations</a></li>
        </ul>
      </section>
      
      <section>
        <h2>Integrations</h2>
        <ul>
          <li><a href="/docs/integrations/wearables">Wearables Overview</a></li>
          <li><a href="/docs/integrations/apple-health">Apple Health</a></li>
          <li><a href="/docs/integrations/health-connect">Health Connect (Android)</a></li>
          <li><a href="/docs/integrations/fitbit">Fitbit</a></li>
          <li><a href="/docs/integrations/garmin">Garmin</a></li>
          <li><a href="/docs/integrations/google-calendar">Google Calendar</a></li>
          <li><a href="/docs/integrations/google-meet">Google Meet</a></li>
          <li><a href="/docs/integrations/apple-calendar">Apple Calendar</a></li>
          <li><a href="/docs/integrations/zoom">Zoom</a></li>
        </ul>
      </section>
    </main>`
  });
}

// Static pages
function renderAbout(): string {
  return baseTemplate({
    title: "About FitConnect",
    description: "Learn about FitConnect's mission to connect fitness enthusiasts with elite coaches and transform lives through personalised training.",
    canonicalUrl: "/about",
    schema: [organizationSchema()],
    keywords: ["about fitconnect", "fitness platform", "coaching marketplace"],
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
          <li>AI-powered workout and nutrition planning</li>
        </ul>
      </section>
      
      <section>
        <h2>For Clients</h2>
        <p>Find your perfect coach, book sessions online or in-person, and track your progress with our comprehensive tools. Connect your wearables for automatic data syncing.</p>
      </section>
      
      <section>
        <h2>For Coaches</h2>
        <p>Grow your fitness business with our all-in-one coaching platform. Manage clients, create programs, handle payments, and market your services.</p>
      </section>
      
      <section>
        <h2>Get Started</h2>
        <p><a href="/coaches">Find a coach</a> or <a href="/for-coaches">become a coach</a> today.</p>
      </section>
    </main>`
  });
}

function renderForCoaches(): string {
  return baseTemplate({
    title: "Become a Coach on FitConnect",
    description: "Grow your fitness coaching business with FitConnect. Get verified, attract clients, manage bookings, and earn more with our all-in-one platform.",
    canonicalUrl: "/for-coaches",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Become a Coach on FitConnect",
        description: "Grow your fitness coaching business with our all-in-one platform",
        url: `${BASE_URL}/for-coaches`
      },
      breadcrumbSchema([{ name: "Home", url: "/" }, { name: "For Coaches", url: "/for-coaches" }])
    ],
    keywords: ["become a coach", "fitness coaching platform", "personal trainer software", "coaching business"],
    content: `
    <main class="container">
      <h1>Grow Your Coaching Business with FitConnect</h1>
      <p>Join the UK's fastest-growing fitness coaching platform. Get verified, attract clients, and manage your business all in one place.</p>
      
      <section>
        <h2>Why Coaches Choose FitConnect</h2>
        <ul>
          <li><strong>Get discovered</strong> - Appear in our marketplace to thousands of potential clients</li>
          <li><strong>Save time</strong> - AI-powered workout and nutrition planning</li>
          <li><strong>Earn more</strong> - Sell digital products and packages</li>
          <li><strong>Look professional</strong> - Verified badge builds trust</li>
          <li><strong>Easy payments</strong> - Secure Stripe integration with automatic payouts</li>
        </ul>
      </section>
      
      <section>
        <h2>Features for Coaches</h2>
        <ul>
          <li>Client management dashboard</li>
          <li>Drag-and-drop workout builder</li>
          <li>Nutrition plan creator with AI suggestions</li>
          <li>Automated check-ins and reminders</li>
          <li>Calendar sync with Google and Apple</li>
          <li>Video session integration (Zoom, Google Meet)</li>
          <li>Client progress tracking and analytics</li>
          <li>Digital product marketplace</li>
          <li>Marketing tools and Boost visibility</li>
        </ul>
      </section>
      
      <section>
        <h2>Pricing Plans</h2>
        <p>Start free with up to 5 clients. Upgrade as your business grows.</p>
        <ul>
          <li><strong>Starter (Free)</strong> - Up to 5 clients, basic features</li>
          <li><strong>Professional (£29/month)</strong> - Up to 25 clients, AI tools, analytics</li>
          <li><strong>Enterprise (£79/month)</strong> - Unlimited clients, priority support</li>
        </ul>
      </section>
      
      <section>
        <h2>Ready to Get Started?</h2>
        <p><a href="/auth?tab=register&role=coach">Create your coach account</a> and complete verification to start accepting clients.</p>
      </section>
    </main>`
  });
}

function renderHowItWorks(): string {
  return baseTemplate({
    title: "How FitConnect Works",
    description: "Learn how FitConnect connects clients with fitness coaches. Browse, book, train, and track your progress all in one platform.",
    canonicalUrl: "/how-it-works",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "How It Works", url: "/how-it-works" }])],
    keywords: ["how fitconnect works", "fitness platform", "find a coach", "online coaching"],
    content: `
    <main class="container">
      <h1>How FitConnect Works</h1>
      <p>FitConnect makes it easy to find, book, and work with fitness professionals who can help you achieve your goals.</p>
      
      <section>
        <h2>For Clients</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Find Your Coach</strong> - Browse our marketplace of verified personal trainers, nutritionists, and fitness coaches. Filter by specialty, location, and price.</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Book Sessions</strong> - View availability and book online or in-person sessions directly through the platform.</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Get Your Plan</strong> - Receive personalized workout and nutrition plans tailored to your goals.</div></div>
        <div class="step"><span class="step-number">4</span><div><strong>Track Progress</strong> - Log workouts, track measurements, and sync wearables for automatic data import.</div></div>
        <div class="step"><span class="step-number">5</span><div><strong>Achieve Your Goals</strong> - Stay accountable with check-ins, celebrate milestones, and compete on leaderboards.</div></div>
      </section>
      
      <section>
        <h2>For Coaches</h2>
        <div class="step"><span class="step-number">1</span><div><strong>Create Your Profile</strong> - Set up your coach profile with your bio, credentials, and services.</div></div>
        <div class="step"><span class="step-number">2</span><div><strong>Get Verified</strong> - Submit your certifications and insurance for verification.</div></div>
        <div class="step"><span class="step-number">3</span><div><strong>Accept Clients</strong> - Receive booking requests and manage your schedule.</div></div>
        <div class="step"><span class="step-number">4</span><div><strong>Deliver Results</strong> - Use our tools to create programs, track progress, and communicate with clients.</div></div>
        <div class="step"><span class="step-number">5</span><div><strong>Grow Your Business</strong> - Build your reputation, sell digital products, and scale with our marketing tools.</div></div>
      </section>
      
      <section>
        <h2>Ready to Start?</h2>
        <p><a href="/coaches">Find a coach</a> or <a href="/for-coaches">become a coach</a> today.</p>
      </section>
    </main>`
  });
}

function renderSuccessStories(): string {
  return baseTemplate({
    title: "Success Stories",
    description: "Real transformations from FitConnect clients and coaches. See how our platform helps people achieve their fitness goals.",
    canonicalUrl: "/success-stories",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Success Stories", url: "/success-stories" }])],
    keywords: ["fitness transformations", "success stories", "client results", "testimonials"],
    content: `
    <main class="container">
      <h1>FitConnect Success Stories</h1>
      <p>Real transformations from real people. See how FitConnect coaches help clients achieve their fitness goals.</p>
      
      <section>
        <h2>Client Transformations</h2>
        <p>Our verified coaches have helped thousands of clients transform their health and fitness. From weight loss to muscle building, improved nutrition to athletic performance.</p>
      </section>
      
      <section>
        <h2>Coach Success</h2>
        <p>Coaches on FitConnect have grown their businesses, reached more clients, and streamlined their operations with our all-in-one platform.</p>
      </section>
      
      <section>
        <h2>Share Your Story</h2>
        <p>Are you a FitConnect success story? We'd love to hear from you. Contact us to share your transformation.</p>
      </section>
      
      <section>
        <h2>Start Your Journey</h2>
        <p><a href="/coaches">Find a coach</a> and begin your own success story today.</p>
      </section>
    </main>`
  });
}

function renderContact(): string {
  return baseTemplate({
    title: "Contact Us",
    description: "Get in touch with the FitConnect team. We're here to help with questions about coaching, partnerships, and support.",
    canonicalUrl: "/contact",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact FitConnect",
        url: `${BASE_URL}/contact`
      },
      breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }])
    ],
    keywords: ["contact fitconnect", "support", "help", "get in touch"],
    content: `
    <main class="container">
      <h1>Contact Us</h1>
      <p>Have questions? We're here to help.</p>
      
      <section>
        <h2>General Inquiries</h2>
        <p>For general questions about FitConnect, reach out to our support team.</p>
      </section>
      
      <section>
        <h2>Coach Support</h2>
        <p>Coaches can access dedicated support through their dashboard or by contacting coach support directly.</p>
      </section>
      
      <section>
        <h2>Partnerships</h2>
        <p>Interested in partnering with FitConnect? We work with gyms, fitness brands, and corporate wellness programs.</p>
      </section>
      
      <section>
        <h2>Help Center</h2>
        <p>Find answers to common questions in our <a href="/docs">Help Center</a>.</p>
      </section>
    </main>`
  });
}

function renderInstall(): string {
  return baseTemplate({
    title: "Install FitConnect App",
    description: "Download the FitConnect app for iOS and Android. Access coaches, workouts, and progress tracking on the go.",
    canonicalUrl: "/install",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Install App", url: "/install" }])],
    keywords: ["fitconnect app", "download", "iOS", "Android", "fitness app"],
    content: `
    <main class="container">
      <h1>Get the FitConnect App</h1>
      <p>Take FitConnect with you. Access coaches, workouts, and progress tracking from your phone.</p>
      
      <section>
        <h2>iOS (iPhone & iPad)</h2>
        <p>Download FitConnect from the App Store for iPhone and iPad.</p>
      </section>
      
      <section>
        <h2>Android</h2>
        <p>Get FitConnect from the Google Play Store for Android devices.</p>
      </section>
      
      <section>
        <h2>Web App</h2>
        <p>FitConnect also works in your browser. Visit getfitconnect.co.uk on any device.</p>
      </section>
      
      <section>
        <h2>Features</h2>
        <ul>
          <li>Find and book coaches</li>
          <li>View workout and nutrition plans</li>
          <li>Log progress and photos</li>
          <li>Message your coach</li>
          <li>Track habits and challenges</li>
          <li>Sync wearables automatically</li>
        </ul>
      </section>
    </main>`
  });
}

function renderGetStarted(): string {
  return baseTemplate({
    title: "Get Started with FitConnect",
    description: "Create your FitConnect account and start your fitness journey today. Find coaches, book sessions, and achieve your goals.",
    canonicalUrl: "/get-started",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Get Started", url: "/get-started" }])],
    keywords: ["get started", "sign up", "create account", "fitness journey"],
    content: `
    <main class="container">
      <h1>Start Your Fitness Journey</h1>
      <p>Join FitConnect today and connect with elite fitness professionals who can help you achieve your goals.</p>
      
      <section>
        <h2>Why FitConnect?</h2>
        <ul>
          <li>Verified coaches with real credentials</li>
          <li>Personalized workout and nutrition plans</li>
          <li>Progress tracking and wearable sync</li>
          <li>Community challenges and leaderboards</li>
          <li>Digital content marketplace</li>
        </ul>
      </section>
      
      <section>
        <h2>Get Started as a Client</h2>
        <p>Create a free account to browse coaches, book sessions, and start training.</p>
        <p><a href="/auth?tab=register&role=client">Create Client Account</a></p>
      </section>
      
      <section>
        <h2>Get Started as a Coach</h2>
        <p>Build your coaching business with our all-in-one platform.</p>
        <p><a href="/auth?tab=register&role=coach">Create Coach Account</a></p>
      </section>
    </main>`
  });
}

function renderPrivacy(): string {
  return baseTemplate({
    title: "Privacy Policy",
    description: "FitConnect's privacy policy explains how we collect, use, and protect your personal data in compliance with UK GDPR.",
    canonicalUrl: "/privacy",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Privacy Policy", url: "/privacy" }])],
    keywords: ["privacy policy", "data protection", "GDPR", "personal data"],
    content: `
    <main class="container">
      <h1>Privacy Policy</h1>
      <p>Last updated: December 2024</p>
      
      <section>
        <h2>Introduction</h2>
        <p>FitConnect is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information in accordance with UK GDPR.</p>
      </section>
      
      <section>
        <h2>Data We Collect</h2>
        <ul>
          <li>Account information (name, email, profile details)</li>
          <li>Health and fitness data (with your consent)</li>
          <li>Usage data and preferences</li>
          <li>Payment information (processed securely by Stripe)</li>
          <li>Communications between users</li>
        </ul>
      </section>
      
      <section>
        <h2>How We Use Your Data</h2>
        <ul>
          <li>To provide and improve our services</li>
          <li>To connect you with coaches and clients</li>
          <li>To process payments</li>
          <li>To send relevant communications</li>
          <li>To ensure platform safety and security</li>
        </ul>
      </section>
      
      <section>
        <h2>Your Rights</h2>
        <p>You have the right to access, correct, delete, or export your data. Contact us to exercise these rights.</p>
      </section>
      
      <section>
        <h2>Contact</h2>
        <p>For privacy inquiries, contact our Data Protection Officer through our <a href="/contact">contact page</a>.</p>
      </section>
    </main>`
  });
}

function renderTerms(): string {
  return baseTemplate({
    title: "Terms of Service",
    description: "FitConnect's terms of service outline the rules and guidelines for using our fitness coaching platform.",
    canonicalUrl: "/terms",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Terms of Service", url: "/terms" }])],
    keywords: ["terms of service", "user agreement", "platform rules", "legal"],
    content: `
    <main class="container">
      <h1>Terms of Service</h1>
      <p>Last updated: December 2024</p>
      
      <section>
        <h2>Agreement to Terms</h2>
        <p>By using FitConnect, you agree to these terms. If you don't agree, please don't use our platform.</p>
      </section>
      
      <section>
        <h2>Using FitConnect</h2>
        <ul>
          <li>You must be 18 or older to create an account</li>
          <li>You're responsible for your account security</li>
          <li>You must provide accurate information</li>
          <li>You agree not to misuse the platform</li>
        </ul>
      </section>
      
      <section>
        <h2>For Coaches</h2>
        <ul>
          <li>You must hold valid qualifications and insurance</li>
          <li>You're responsible for the services you provide</li>
          <li>You agree to our verification requirements</li>
          <li>You're an independent contractor, not an employee</li>
        </ul>
      </section>
      
      <section>
        <h2>Payments</h2>
        <p>Payments are processed through Stripe. We charge service fees as outlined in our pricing. Refund policies are set by individual coaches.</p>
      </section>
      
      <section>
        <h2>Limitation of Liability</h2>
        <p>FitConnect facilitates connections between coaches and clients. We're not responsible for the quality of coaching services provided.</p>
      </section>
      
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms? <a href="/contact">Contact us</a>.</p>
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
    keywords: ["pricing", "coach plans", "subscription", "fitness business"],
    content: `
    <main class="container">
      <h1>Pricing for Coaches</h1>
      <p>Choose the plan that fits your coaching business. Start free and upgrade as you grow.</p>
      
      <section>
        <h2>Starter - Free</h2>
        <p>Perfect for new coaches just getting started.</p>
        <ul>
          <li>Up to 5 clients</li>
          <li>Basic profile and marketplace listing</li>
          <li>Client messaging</li>
          <li>Session booking and calendar</li>
          <li>Basic workout and nutrition plans</li>
        </ul>
      </section>
      
      <section>
        <h2>Professional - £29/month</h2>
        <p>For growing coaches who want to scale their business.</p>
        <ul>
          <li>Up to 25 clients</li>
          <li>Everything in Starter</li>
          <li>AI workout and nutrition planning</li>
          <li>Progress analytics and insights</li>
          <li>Automated check-ins and reminders</li>
          <li>Digital products marketplace</li>
          <li>Marketing tools</li>
        </ul>
      </section>
      
      <section>
        <h2>Enterprise - £79/month</h2>
        <p>For established coaches and fitness businesses.</p>
        <ul>
          <li>Unlimited clients</li>
          <li>Everything in Professional</li>
          <li>White-label options</li>
          <li>Priority support</li>
          <li>API access</li>
          <li>Team management</li>
        </ul>
      </section>
      
      <section>
        <h2>Free for Clients</h2>
        <p>Clients create accounts for free. They only pay for coaching sessions and products.</p>
      </section>
      
      <section>
        <h2>Ready to Start?</h2>
        <p><a href="/auth?tab=register&role=coach">Create your coach account</a> today.</p>
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
              text: "Yes, all coaches go through a verification process where we check their qualifications, certifications, and insurance."
            }
          },
          {
            "@type": "Question",
            name: "Can I do online sessions?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, many coaches offer online sessions via video call (Zoom or Google Meet). Look for the 'Online Available' badge on profiles."
            }
          },
          {
            "@type": "Question",
            name: "How do payments work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Payments are processed securely through Stripe. You pay when booking and coaches receive payouts automatically."
            }
          },
          {
            "@type": "Question",
            name: "Can I cancel a booking?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Cancellation policies vary by coach. Check the coach's profile for their specific policy before booking."
            }
          },
          {
            "@type": "Question",
            name: "Is FitConnect free for clients?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, creating a client account is free. You only pay for coaching sessions and digital products you purchase."
            }
          }
        ]
      },
      breadcrumbSchema([{ name: "Home", url: "/" }, { name: "FAQ", url: "/faq" }])
    ],
    keywords: ["FAQ", "help", "questions", "support"],
    content: `
    <main class="container">
      <h1>Frequently Asked Questions</h1>
      
      <section>
        <h2>How do I find a coach?</h2>
        <p>Browse our <a href="/coaches">coach marketplace</a>, filter by specialty, location, and price, then view profiles and book directly.</p>
      </section>
      
      <section>
        <h2>Are coaches verified?</h2>
        <p>Yes, all coaches go through a verification process where we check their qualifications, certifications, and insurance.</p>
      </section>
      
      <section>
        <h2>Can I do online sessions?</h2>
        <p>Yes, many coaches offer online sessions via video call (Zoom or Google Meet). Look for the 'Online Available' badge on profiles.</p>
      </section>
      
      <section>
        <h2>How do payments work?</h2>
        <p>Payments are processed securely through Stripe. You pay when booking and coaches receive payouts automatically.</p>
      </section>
      
      <section>
        <h2>Can I cancel a booking?</h2>
        <p>Cancellation policies vary by coach. Check the coach's profile for their specific policy before booking.</p>
      </section>
      
      <section>
        <h2>Is FitConnect free for clients?</h2>
        <p>Yes, creating a client account is free. You only pay for coaching sessions and digital products you purchase.</p>
      </section>
      
      <section>
        <h2>How do I become a coach?</h2>
        <p>Visit our <a href="/for-coaches">For Coaches</a> page to learn about requirements and sign up.</p>
      </section>
      
      <section>
        <h2>What wearables are supported?</h2>
        <p>We support Apple Health, Google Fit/Health Connect, Fitbit, and Garmin. See our <a href="/docs/integrations/wearables">wearables guide</a>.</p>
      </section>
      
      <section>
        <h2>More Questions?</h2>
        <p>Check our <a href="/docs">Help Center</a> or <a href="/contact">contact us</a>.</p>
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
          <li>Global Leaderboard - Compete worldwide</li>
          <li>Country Rankings - See how you rank nationally</li>
          <li>Local Competition - Compete in your city or county</li>
        </ul>
      </section>
      
      <section>
        <h2>Earn XP & Level Up</h2>
        <p>Complete workouts, log habits, and achieve goals to earn XP and climb the ranks.</p>
        <ul>
          <li>Complete workouts to earn XP</li>
          <li>Maintain habit streaks for bonus XP</li>
          <li>Join challenges for extra rewards</li>
          <li>Level up to unlock new avatars</li>
        </ul>
      </section>
      
      <section>
        <h2>Unlock Avatars</h2>
        <p>Collect unique avatars by completing challenges and reaching milestones. Show off your achievements!</p>
        <ul>
          <li><strong>Free Avatars</strong> - Available to all users</li>
          <li><strong>Challenge Avatars</strong> - Unlock through achievements</li>
          <li><strong>Coach Exclusive</strong> - Special avatars for verified coaches</li>
          <li><strong>Limited Edition</strong> - Seasonal and event avatars</li>
        </ul>
      </section>
      
      <section>
        <h2>Challenges</h2>
        <p>Join platform-wide challenges to compete with others and earn exclusive rewards.</p>
      </section>
      
      <section>
        <h2>Join the Community</h2>
        <p><a href="/auth?tab=register&role=client">Create your account</a> to start competing and earning rewards.</p>
      </section>
    </main>`
  });
}

// Marketplace listing
async function renderMarketplace(supabase: any): Promise<string> {
  const { data: products } = await supabase
    .from("digital_products")
    .select("id, slug, title, short_description, price, currency, content_type, category")
    .eq("is_published", true)
    .limit(20);

  const productsList = products?.map((p: any) => `
    <article>
      <h3><a href="/marketplace/${p.slug || p.id}">${escapeHtml(p.title)}</a></h3>
      <p class="text-muted">${escapeHtml(p.content_type?.replace("_", " ") || "Product")} • ${escapeHtml(p.category || "")}</p>
      <p>${escapeHtml(p.short_description || "")}</p>
      <p>${p.price === 0 ? "Free" : `£${p.price}`}</p>
    </article>
  `).join("\n") || "";

  return baseTemplate({
    title: "Marketplace - Digital Fitness Content",
    description: "Discover e-books, video courses, workout templates, and more from top fitness professionals on FitConnect.",
    canonicalUrl: "/marketplace",
    schema: [breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Marketplace", url: "/marketplace" }])],
    keywords: ["fitness ebooks", "workout templates", "nutrition guides", "fitness courses", "digital products"],
    content: `
    <main class="container">
      <h1>Digital Content Marketplace</h1>
      <p>Level up your training with expert resources from top fitness professionals.</p>
      
      <section>
        <h2>Content Types</h2>
        <ul>
          <li><strong>E-Books & PDFs</strong> - Training guides, recipe books, educational content</li>
          <li><strong>Video Courses</strong> - Multi-lesson programs with progress tracking</li>
          <li><strong>Workout Templates</strong> - Ready-to-use training programs</li>
          <li><strong>Audio Content</strong> - Meditations, motivation, and coaching</li>
        </ul>
      </section>
      
      <section>
        <h2>Featured Content</h2>
        ${productsList || "<p>No products available.</p>"}
      </section>
      
      <section>
        <h2>Browse More</h2>
        <p><a href="/auth?tab=register&role=client">Create an account</a> to browse all products and make purchases.</p>
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
    noIndex: true,
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
    } else if (path.match(/^\/coaches\/(personal-trainers|nutritionists|boxing|mma|bodybuilding)$/)) {
      const category = path.replace("/coaches/", "");
      html = await renderCoachCategory(supabase, category);
    } else if (path.match(/^\/coaches\/[a-zA-Z0-9_-]+$/)) {
      const username = path.replace("/coaches/", "");
      html = await renderCoachProfile(supabase, username);
    } else if (path === "/marketplace") {
      html = await renderMarketplace(supabase);
    } else if (path.match(/^\/marketplace\/bundles\/[a-zA-Z0-9-]+$/)) {
      const bundleId = path.replace("/marketplace/bundles/", "");
      html = await renderMarketplaceBundle(supabase, bundleId);
    } else if (path.match(/^\/marketplace\/[a-zA-Z0-9_-]+$/)) {
      const productIdOrSlug = path.replace("/marketplace/", "");
      html = await renderMarketplaceProduct(supabase, productIdOrSlug);
    } else if (path === "/about") {
      html = renderAbout();
    } else if (path === "/pricing") {
      html = renderPricing();
    } else if (path === "/faq") {
      html = renderFAQ();
    } else if (path === "/community") {
      html = await renderCommunity(supabase);
    } else if (path === "/for-coaches") {
      html = renderForCoaches();
    } else if (path === "/how-it-works") {
      html = renderHowItWorks();
    } else if (path === "/success-stories") {
      html = renderSuccessStories();
    } else if (path === "/contact") {
      html = renderContact();
    } else if (path === "/install") {
      html = renderInstall();
    } else if (path === "/get-started") {
      html = renderGetStarted();
    } else if (path === "/privacy") {
      html = renderPrivacy();
    } else if (path === "/terms") {
      html = renderTerms();
    } else if (path === "/docs") {
      html = renderDocsHub();
    } else if (path.startsWith("/docs/")) {
      html = renderDocsPage(path);
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
