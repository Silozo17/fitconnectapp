/**
 * Bot Router Edge Function
 * 
 * Detects bot/crawler requests and serves pre-rendered HTML content.
 * Human users are served the normal SPA shell for full React experience.
 * 
 * This ensures:
 * - Search engines (Google, Bing) see full HTML content
 * - AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can read all text
 * - Users get the interactive React SPA experience
 * - No cloaking - same content, different delivery method
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bot User-Agent patterns (lowercase for matching)
// Includes search engines, social media crawlers, and AI assistants
const BOT_USER_AGENTS = [
  // Search Engines
  "googlebot",
  "google-inspectiontool",
  "bingbot",
  "msnbot",
  "yandexbot",
  "baiduspider",
  "duckduckbot",
  "slurp",            // Yahoo
  "sogou",
  "exabot",
  "applebot",
  
  // Social Media
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "pinterestbot",
  "slackbot",
  "discordbot",
  
  // AI Assistants & Crawlers
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "anthropic-ai",
  "perplexitybot",
  "cohere-ai",
  "google-extended",
  "gemini",
  "meta-externalagent",
  "bytespider",       // TikTok
  "amazonbot",
  "yeti",             // Naver
  "seznambot",
  "ia_archiver",      // Alexa
  
  // SEO Tools
  "semrushbot",
  "ahrefsbot",
  "dotbot",
  "rogerbot",
  "screaming frog",
  "gtmetrix",
  "pingdom",
  
  // Preview generators
  "embedly",
  "quora link preview",
  "redditbot",
  "showyoubot",
  "outbrain",
  "vkshare",
  "w3c_validator",
];

// Protected routes that should never be pre-rendered
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/auth",
  "/onboarding",
  "/checkout",
  "/subscribe",
  "/admin",
  "/api",
  "/_",
];

// Public routes that should be pre-rendered
const PUBLIC_PREFIXES = [
  "/",
  "/coaches",
  "/blog",
  "/marketplace",
  "/community",
  "/docs",
  "/about",
  "/pricing",
  "/faq",
  "/for-coaches",
  "/how-it-works",
  "/success-stories",
  "/contact",
  "/install",
  "/get-started",
  "/privacy",
  "/terms",
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

function isProtectedRoute(path: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix));
}

function isPublicRoute(path: string): boolean {
  if (path === "/") return true;
  return PUBLIC_PREFIXES.some(prefix => 
    path === prefix || path.startsWith(prefix + "/")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const userAgent = req.headers.get("user-agent") || "";
    
    console.log(`[bot-router] Path: ${path}, UA: ${userAgent.slice(0, 100)}`);

    // Skip protected routes
    if (isProtectedRoute(path)) {
      console.log(`[bot-router] Protected route, skipping: ${path}`);
      return new Response(JSON.stringify({ 
        prerender: false, 
        reason: "protected_route" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if it's a bot
    const botDetected = isBot(userAgent);
    const isPublic = isPublicRoute(path);

    if (botDetected && isPublic) {
      console.log(`[bot-router] Bot detected, pre-rendering: ${path}`);
      
      // Call the prerender function
      const prerenderUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/prerender?path=${encodeURIComponent(path)}`;
      
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      });

      if (!prerenderResponse.ok) {
        console.error(`[bot-router] Prerender failed: ${prerenderResponse.status}`);
        return new Response(JSON.stringify({ 
          prerender: false, 
          reason: "prerender_failed" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const html = await prerenderResponse.text();
      
      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "X-Prerender": "true",
          "X-Bot-Detected": "true",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }

    // Not a bot or not a public route - return instruction to serve SPA
    console.log(`[bot-router] Not a bot or not public, serve SPA: ${path}`);
    return new Response(JSON.stringify({ 
      prerender: false, 
      reason: botDetected ? "not_public_route" : "not_a_bot",
      isBot: botDetected,
      isPublic: isPublic,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[bot-router] Error:", error);
    return new Response(JSON.stringify({ 
      prerender: false, 
      reason: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
