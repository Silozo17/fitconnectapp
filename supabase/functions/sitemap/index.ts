import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const BASE_URL = "https://getfitconnect.co.uk";

// Static pages with their priorities and change frequencies - synced with public/sitemap.xml
const STATIC_PAGES = [
  // Homepage
  { path: "/", priority: "1.0", changefreq: "daily" },
  
  // Trust & Verification
  { path: "/trust-and-verification", priority: "0.8", changefreq: "monthly" },
  
  // Core Public Pages
  { path: "/coaches", priority: "0.9", changefreq: "daily" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/marketplace", priority: "0.8", changefreq: "daily" },
  { path: "/pricing", priority: "0.8", changefreq: "weekly" },
  { path: "/for-coaches", priority: "0.8", changefreq: "weekly" },
  { path: "/how-it-works", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/success-stories", priority: "0.6", changefreq: "weekly" },
  { path: "/community", priority: "0.7", changefreq: "daily" },
  { path: "/install", priority: "0.5", changefreq: "monthly" },
  { path: "/get-started", priority: "0.7", changefreq: "monthly" },
  
  // Legal Pages
  { path: "/privacy", priority: "0.4", changefreq: "monthly" },
  { path: "/terms", priority: "0.4", changefreq: "monthly" },
  
  // Coach Discovery Pages
  { path: "/coaches/personal-trainers", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/nutritionists", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/boxing", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/mma", priority: "0.8", changefreq: "daily" },
  
  // Documentation Hub
  { path: "/docs", priority: "0.7", changefreq: "weekly" },
  { path: "/docs/getting-started", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach", priority: "0.6", changefreq: "monthly" },
  
  // Client Documentation
  { path: "/docs/client/profile", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/coaches", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/sessions", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/plans", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/progress", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/achievements", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/settings", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/habits", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/grocery", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/challenges", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/tools", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/library", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/connections", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/food-diary", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/training-logs", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/data-privacy", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/marketplace", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/receipts", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/security", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/wearables", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/data-sharing", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/leaderboards", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/messages", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/favourites", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/readiness", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/micro-wins", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/goal-suggestions", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/client/trends", priority: "0.5", changefreq: "monthly" },
  
  // Coach Documentation
  { path: "/docs/coach/onboarding", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/profile", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/earnings", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/clients", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/messaging", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/plans", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/schedule", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/packages", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/verification", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/pipeline", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/products", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/boost", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/nutrition", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/reviews", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/achievements", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/financial", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/wearables", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/integrations", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/settings", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/showcase", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/comparison", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/case-studies", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/package-analytics", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/connections", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai-recommendations", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/client-risk", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/plateau-detection", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/revenue-forecast", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/checkin-suggestions", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/group-classes", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/engagement-scoring", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/client-ltv", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/upsell-insights", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/goal-adherence", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/automations", priority: "0.5", changefreq: "monthly" },
  
  // Coach AI Documentation
  { path: "/docs/coach/ai/overview", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/client-summary", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/workout-generator", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/nutrition-generator", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/macro-calculator", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/checkin-composer", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/progress-insights", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/exercise-alternatives", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/food-substitutions", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/ai/plan-recommendations", priority: "0.5", changefreq: "monthly" },
  
  // Coach Automations Documentation
  { path: "/docs/coach/automations/dropoff-rescue", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/automations/milestones", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/automations/reminders", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/coach/automations/checkins", priority: "0.5", changefreq: "monthly" },
  
  // Integration Documentation
  { path: "/docs/integrations/wearables", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/apple-health", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/health-connect", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/garmin", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/fitbit", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/zoom", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/google-meet", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/google-calendar", priority: "0.5", changefreq: "monthly" },
  { path: "/docs/integrations/apple-calendar", priority: "0.5", changefreq: "monthly" },
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generating dynamic sitemap...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];

    // Fetch all dynamic content in parallel
    const [coachesResult, productsResult, bundlesResult, blogPostsResult] = await Promise.all([
      // Verified coaches with completed onboarding
      supabase
        .from("coach_profiles")
        .select("username, updated_at")
        .eq("is_verified", true)
        .eq("onboarding_completed", true)
        .eq("marketplace_visible", true)
        .not("username", "is", null),
      
      // Published digital products
      supabase
        .from("digital_products")
        .select("slug, updated_at")
        .eq("is_published", true)
        .not("slug", "is", null),
      
      // Published bundles
      supabase
        .from("digital_bundles")
        .select("id, updated_at")
        .eq("is_published", true),
      
      // Published blog posts
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("is_published", true)
        .not("slug", "is", null),
    ]);

    const coaches = coachesResult.data || [];
    const products = productsResult.data || [];
    const bundles = bundlesResult.data || [];
    const blogPosts = blogPostsResult.data || [];

    console.log(`Found: ${coaches.length} coaches, ${products.length} products, ${bundles.length} bundles, ${blogPosts.length} blog posts`);

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Add static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add coach profiles
    for (const coach of coaches) {
      const lastmod = coach.updated_at 
        ? new Date(coach.updated_at).toISOString().split("T")[0] 
        : today;
      xml += `  <url>
    <loc>${BASE_URL}/coaches/${coach.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Add digital products
    for (const product of products) {
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString().split("T")[0] 
        : today;
      xml += `  <url>
    <loc>${BASE_URL}/marketplace/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add digital bundles
    for (const bundle of bundles) {
      const lastmod = bundle.updated_at 
        ? new Date(bundle.updated_at).toISOString().split("T")[0] 
        : today;
      xml += `  <url>
    <loc>${BASE_URL}/marketplace/bundles/${bundle.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add blog posts
    for (const post of blogPosts) {
      const lastmod = post.updated_at 
        ? new Date(post.updated_at).toISOString().split("T")[0] 
        : post.published_at 
          ? new Date(post.published_at).toISOString().split("T")[0]
          : today;
      xml += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    const totalUrls = STATIC_PAGES.length + coaches.length + products.length + bundles.length + blogPosts.length;
    console.log(`Sitemap generated successfully with ${totalUrls} URLs`);

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    
    // Return a basic sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/coaches</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/marketplace</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/docs</loc>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: corsHeaders,
      status: 200,
    });
  }
});
