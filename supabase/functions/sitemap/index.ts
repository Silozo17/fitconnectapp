import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const BASE_URL = "https://getfitconnect.co.uk";

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  // Core pages
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/coaches", priority: "0.9", changefreq: "daily" },
  { path: "/marketplace", priority: "0.9", changefreq: "daily" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  
  // Marketing pages
  { path: "/for-coaches", priority: "0.8", changefreq: "weekly" },
  { path: "/how-it-works", priority: "0.8", changefreq: "monthly" },
  { path: "/success-stories", priority: "0.7", changefreq: "weekly" },
  { path: "/community", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/pricing", priority: "0.8", changefreq: "weekly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/install", priority: "0.5", changefreq: "monthly" },
  
  // Coach specialty pages
  { path: "/coaches/personal-trainers", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/nutritionists", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/boxing", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/mma", priority: "0.8", changefreq: "daily" },
  { path: "/coaches/bodybuilding", priority: "0.8", changefreq: "daily" },
  
  // Documentation - Hub
  { path: "/docs", priority: "0.7", changefreq: "weekly" },
  
  // Documentation - Getting Started
  { path: "/docs/getting-started", priority: "0.7", changefreq: "monthly" },
  
  // Documentation - Client guides
  { path: "/docs/client/booking", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/coaches", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/communication", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/nutrition", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/payments", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/plans", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/profile", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/progress", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/client/wearables", priority: "0.6", changefreq: "monthly" },
  
  // Documentation - Coach guides
  { path: "/docs/coach/availability", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/clients", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/marketing", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/nutrition", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/onboarding", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/payments", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/plans", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/profile", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/coach/verification", priority: "0.6", changefreq: "monthly" },
  
  // Documentation - Integrations
  { path: "/docs/integrations/apple-health", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/calendar", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/fitbit", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/garmin", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/google-fit", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/stripe", priority: "0.6", changefreq: "monthly" },
  { path: "/docs/integrations/zoom", priority: "0.6", changefreq: "monthly" },
  
  // Legal pages
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
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
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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

    console.log(`Sitemap generated successfully with ${STATIC_PAGES.length + coaches.length + products.length + bundles.length + blogPosts.length} URLs`);

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
