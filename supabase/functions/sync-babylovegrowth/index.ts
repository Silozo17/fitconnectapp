import { createClient } from "@supabase/supabase-js";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

const BABYLOVEGROWTH_API_URL = "https://api.babylovegrowth.ai/api/integrations/v1/articles";

interface BabyLoveGrowthArticle {
  id: number;
  title: string;
  slug?: string;
  content_html: string;
  content_markdown?: string;
  meta_description?: string;
  metaDescription?: string;
  hero_image_url?: string;
  keywords?: string[];
  seedKeyword?: string;
  created_at?: string;
  createdAt?: string;
  languageCode?: string;
  publicUrl?: string;
  orgWebsite?: string;
  excerpt?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractExcerpt(content: string, maxLength = 160): string {
  const text = content.replace(/<[^>]*>/g, "");
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get API key from secrets
    const apiKey = Deno.env.get("BABYLOVEGROWTH_API_KEY");
    if (!apiKey) {
      return errorResponse("BabyLoveGrowth API key not configured. Please add BABYLOVEGROWTH_API_KEY secret.", 500);
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get last sync timestamp
    const { data: lastSyncData } = await supabase
      .from("integration_sync_log")
      .select("last_sync_at")
      .eq("integration_name", "babylovegrowth")
      .eq("status", "success")
      .order("last_sync_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastSyncAt = lastSyncData?.last_sync_at 
      ? new Date(lastSyncData.last_sync_at) 
      : new Date(0);

    console.log(`Last sync: ${lastSyncAt.toISOString()}`);

    // Fetch articles from BabyLoveGrowth API with pagination
    let allArticles: BabyLoveGrowthArticle[] = [];
    let page = 1;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const url = `${BABYLOVEGROWTH_API_URL}?limit=${limit}&page=${page}`;
      console.log(`Fetching page ${page}: ${url}`);

      const response = await fetch(url, {
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`BabyLoveGrowth API error: ${response.status} - ${errorText}`);
        
        // Log failed sync
        await supabase.from("integration_sync_log").insert({
          integration_name: "babylovegrowth",
          articles_imported: 0,
          status: "error",
          error_message: `API error: ${response.status} - ${errorText}`,
        });

        return errorResponse(`BabyLoveGrowth API error: ${response.status}`, 502);
      }

      const articles: BabyLoveGrowthArticle[] = await response.json();
      
      if (articles.length === 0) {
        hasMore = false;
      } else {
        allArticles = [...allArticles, ...articles];
        
        // If we got fewer than limit, we've reached the end
        if (articles.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // Safety limit to prevent infinite loops
      if (page > 100) {
        console.warn("Reached max pagination limit (100 pages)");
        hasMore = false;
      }
    }

    console.log(`Fetched ${allArticles.length} total articles from BabyLoveGrowth`);

    // Filter to only new articles (created after last sync)
    const newArticles = allArticles.filter((article) => {
      const articleDate = new Date(article.created_at || article.createdAt || 0);
      return articleDate > lastSyncAt;
    });

    console.log(`Found ${newArticles.length} new articles since last sync`);

    let importedCount = 0;
    const errors: string[] = [];

    // Import each new article
    for (const article of newArticles) {
      try {
        const metaDesc = article.meta_description || article.metaDescription || "";
        const excerpt = article.excerpt || metaDesc || extractExcerpt(article.content_html);
        const slug = article.slug || generateSlug(article.title);

        const blogPost = {
          external_id: String(article.id),
          external_source: "babylovegrowth",
          title: article.title,
          slug: slug,
          content: article.content_html,
          excerpt: excerpt,
          meta_title: article.title,
          meta_description: metaDesc,
          featured_image: article.hero_image_url || null,
          keywords: article.keywords || [],
          category: article.seedKeyword || "Health & Wellness",
          author: "BabyLoveGrowth AI",
          is_published: true,
          published_at: new Date().toISOString(),
          reading_time_minutes: calculateReadingTime(article.content_html),
        };

        const { error } = await supabase
          .from("blog_posts")
          .upsert(blogPost, { 
            onConflict: "external_id",
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Error importing article ${article.id}:`, error);
          errors.push(`Article ${article.id}: ${error.message}`);
        } else {
          importedCount++;
          console.log(`Imported article: ${article.title}`);
        }
      } catch (err) {
        console.error(`Exception importing article ${article.id}:`, err);
        errors.push(`Article ${article.id}: ${err.message}`);
      }
    }

    // Log successful sync
    await supabase.from("integration_sync_log").insert({
      integration_name: "babylovegrowth",
      articles_imported: importedCount,
      status: errors.length > 0 ? "partial" : "success",
      error_message: errors.length > 0 ? errors.join("; ") : null,
    });

    console.log(`Sync complete: imported ${importedCount} articles`);

    return jsonResponse({
      success: true,
      imported: importedCount,
      total_fetched: allArticles.length,
      new_articles: newArticles.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("Sync error:", error);

    // Try to log the error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from("integration_sync_log").insert({
        integration_name: "babylovegrowth",
        articles_imported: 0,
        status: "error",
        error_message: error.message,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return errorResponse(error.message, 500);
  }
});
