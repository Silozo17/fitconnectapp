import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  summary: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
}

interface RSSItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  'media:content'?: { url?: string };
}

// Parse RSS XML to JSON
function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // Extract items from RSS
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTagContent = (tag: string): string | null => {
      const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i');
      const tagMatch = itemXml.match(regex);
      return tagMatch ? (tagMatch[1] || tagMatch[2] || '').trim() : null;
    };
    
    const getImageUrl = (): string | null => {
      // Try media:content
      const mediaMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/i);
      if (mediaMatch) return mediaMatch[1];
      
      // Try enclosure
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i);
      if (enclosureMatch) return enclosureMatch[1];
      
      // Try image tag
      const imageMatch = itemXml.match(/<image[^>]*>([^<]+)<\/image>/i);
      if (imageMatch) return imageMatch[1];
      
      // Try to find image in description
      const descImgMatch = itemXml.match(/<img[^>]*src="([^"]+)"/i);
      if (descImgMatch) return descImgMatch[1];
      
      return null;
    };
    
    const title = getTagContent('title');
    const link = getTagContent('link');
    
    if (title && link) {
      items.push({
        title,
        summary: getTagContent('description')?.replace(/<[^>]*>/g, '').slice(0, 200) || null,
        url: link,
        image_url: getImageUrl(),
        published_at: getTagContent('pubDate'),
      });
    }
  }
  
  return items.slice(0, 10); // Limit to 10 items
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discipline_id, entity_ids } = await req.json();

    if (!discipline_id) {
      return new Response(
        JSON.stringify({ error: 'discipline_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first (items less than 15 minutes old)
    const { data: cachedNews } = await supabase
      .from('discipline_news_cache')
      .select('*')
      .eq('discipline_id', discipline_id)
      .gt('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(20);

    if (cachedNews && cachedNews.length > 0) {
      console.log(`Returning ${cachedNews.length} cached news items for ${discipline_id}`);
      
      // Filter by entity_ids if provided
      let filteredNews = cachedNews;
      if (entity_ids && entity_ids.length > 0) {
        filteredNews = cachedNews.filter(item => 
          item.entity_ids?.some((id: string) => entity_ids.includes(id))
        );
      }
      
      return new Response(
        JSON.stringify({ news: filteredNews, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch news sources for this discipline
    const { data: sources, error: sourcesError } = await supabase
      .from('discipline_news_sources')
      .select('*')
      .eq('discipline_id', discipline_id)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (sourcesError || !sources || sources.length === 0) {
      console.log(`No news sources found for ${discipline_id}`);
      return new Response(
        JSON.stringify({ news: [], cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch RSS feeds
    const allNews: Array<NewsItem & { source_id: string; discipline_id: string }> = [];
    
    for (const source of sources) {
      try {
        console.log(`Fetching RSS from ${source.source_name}: ${source.feed_url}`);
        
        const response = await fetch(source.feed_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DisciplineNewsBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (!response.ok) {
          console.log(`Failed to fetch ${source.source_name}: ${response.status}`);
          continue;
        }

        const xml = await response.text();
        const items = parseRSS(xml);
        
        console.log(`Parsed ${items.length} items from ${source.source_name}`);
        
        for (const item of items) {
          allNews.push({
            ...item,
            source_id: source.id,
            discipline_id,
          });
        }
      } catch (err) {
        console.error(`Error fetching ${source.source_name}:`, err);
      }
    }

    // Cache the news items
    if (allNews.length > 0) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
      
      for (const item of allNews) {
        try {
          await supabase
            .from('discipline_news_cache')
            .upsert(
              {
                discipline_id: item.discipline_id,
                source_id: item.source_id,
                title: item.title,
                summary: item.summary,
                url: item.url,
                image_url: item.image_url,
                published_at: item.published_at ? new Date(item.published_at).toISOString() : null,
                fetched_at: new Date().toISOString(),
                expires_at: expiresAt,
              },
              { onConflict: 'discipline_id,url' }
            );
        } catch (err) {
          console.log(`Error caching item:`, err);
        }
      }
    }

    // Fetch fresh data from cache
    const { data: freshNews } = await supabase
      .from('discipline_news_cache')
      .select('*')
      .eq('discipline_id', discipline_id)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(20);

    return new Response(
      JSON.stringify({ news: freshNews || [], cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-discipline-news:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
