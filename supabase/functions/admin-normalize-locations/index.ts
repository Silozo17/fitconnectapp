import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common UK cities that should be assigned to GB if no country specified
const UK_CITIES = new Set([
  'high wycombe', 'london', 'manchester', 'birmingham', 'leeds', 'glasgow',
  'liverpool', 'bristol', 'sheffield', 'edinburgh', 'leicester', 'coventry',
  'bradford', 'cardiff', 'belfast', 'nottingham', 'newcastle', 'sunderland',
  'brighton', 'hull', 'plymouth', 'stoke', 'wolverhampton', 'derby',
  'swansea', 'southampton', 'portsmouth', 'oxford', 'cambridge', 'york',
  'bath', 'exeter', 'bournemouth', 'reading', 'luton', 'bolton', 'blackpool',
  'middlesbrough', 'stockport', 'norwich', 'wycombe', 'aylesbury'
]);

// Country name to ISO code mapping
const COUNTRY_MAP: Record<string, string> = {
  'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB', 'scotland': 'GB', 'wales': 'GB',
  'northern ireland': 'GB', 'great britain': 'GB', 'britain': 'GB',
  'poland': 'PL', 'polska': 'PL',
  'united states': 'US', 'usa': 'US', 'us': 'US', 'america': 'US',
  'canada': 'CA', 'australia': 'AU', 'new zealand': 'NZ',
  'germany': 'DE', 'deutschland': 'DE',
  'france': 'FR', 'spain': 'ES', 'españa': 'ES',
  'italy': 'IT', 'italia': 'IT',
  'netherlands': 'NL', 'holland': 'NL',
  'belgium': 'BE', 'ireland': 'IE', 'eire': 'IE',
  'portugal': 'PT', 'austria': 'AT', 'switzerland': 'CH',
  'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK', 'finland': 'FI',
  'greece': 'GR', 'czech republic': 'CZ', 'czechia': 'CZ',
  'hungary': 'HU', 'romania': 'RO', 'bulgaria': 'BG',
  'croatia': 'HR', 'slovenia': 'SI', 'slovakia': 'SK',
  'ukraine': 'UA', 'russia': 'RU', 'turkey': 'TR',
  'india': 'IN', 'china': 'CN', 'japan': 'JP', 'south korea': 'KR',
  'singapore': 'SG', 'hong kong': 'HK', 'thailand': 'TH',
  'malaysia': 'MY', 'indonesia': 'ID', 'philippines': 'PH',
  'brazil': 'BR', 'mexico': 'MX', 'argentina': 'AR',
  'south africa': 'ZA', 'egypt': 'EG', 'nigeria': 'NG',
  'uae': 'AE', 'united arab emirates': 'AE', 'dubai': 'AE',
  'saudi arabia': 'SA', 'israel': 'IL', 'qatar': 'QA',
};

interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  lat: number | null;
  lng: number | null;
}

interface NormalizationResult {
  id: string;
  display_name: string | null;
  original_location: string | null;
  status: 'migrated' | 'parsed' | 'unresolved' | 'error' | 'skipped';
  details?: Partial<PlaceDetails>;
  error?: string;
}

async function searchPlaces(query: string, apiKey: string): Promise<{ place_id: string; description: string }[]> {
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.predictions?.length > 0) {
    return data.predictions.map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
    }));
  }
  
  return [];
}

async function getPlaceDetails(placeId: string, apiKey: string): Promise<PlaceDetails | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,formatted_address,address_components,geometry&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.result) {
    return null;
  }
  
  const result = data.result;
  const components = result.address_components || [];
  
  let city: string | null = null;
  let region: string | null = null;
  let country: string | null = null;
  let countryCode: string | null = null;
  
  for (const comp of components) {
    const types = comp.types || [];
    if (types.includes('locality') || types.includes('postal_town')) {
      city = comp.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      region = comp.long_name;
    } else if (types.includes('country')) {
      country = comp.long_name;
      countryCode = comp.short_name;
    }
  }
  
  return {
    place_id: result.place_id,
    formatted_address: result.formatted_address,
    city,
    region,
    country,
    country_code: countryCode,
    lat: result.geometry?.location?.lat || null,
    lng: result.geometry?.location?.lng || null,
  };
}

function parseLegacyLocation(location: string): { city: string | null; country: string | null; countryCode: string | null } {
  const trimmed = location.trim();
  const parts = trimmed.split(',').map(p => p.trim());
  
  // If only one part, check if it's a known UK city
  if (parts.length === 1) {
    const cityLower = parts[0].toLowerCase();
    if (UK_CITIES.has(cityLower)) {
      return { city: parts[0], country: 'United Kingdom', countryCode: 'GB' };
    }
    return { city: parts[0], country: null, countryCode: null };
  }
  
  // If two or more parts, last part is likely country
  const lastPart = parts[parts.length - 1].toLowerCase();
  const countryCode = COUNTRY_MAP[lastPart];
  
  if (countryCode) {
    return {
      city: parts[0],
      country: parts[parts.length - 1],
      countryCode,
    };
  }
  
  // Check if first part is a UK city
  const firstPartLower = parts[0].toLowerCase();
  if (UK_CITIES.has(firstPartLower)) {
    return { city: parts[0], country: 'United Kingdom', countryCode: 'GB' };
  }
  
  return { city: parts[0], country: null, countryCode: null };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API keys from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!googleApiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    let dryRun = false;
    let forceAll = false;
    
    try {
      const body = await req.json();
      dryRun = body.dryRun === true;
      forceAll = body.forceAll === true;
    } catch {
      // No body provided, use defaults
    }

    console.log(`[normalize-locations] Starting normalization. dryRun=${dryRun}, forceAll=${forceAll}`);

    // Get coaches that need location normalization
    let query = supabase
      .from('coach_profiles')
      .select('id, display_name, location, location_city, location_country_code, location_lat')
      .not('location', 'is', null);

    if (!forceAll) {
      // Only get coaches missing structured data
      query = query.is('location_country_code', null);
    }

    const { data: coaches, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch coaches: ${fetchError.message}`);
    }

    if (!coaches || coaches.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No coaches need location normalization',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[normalize-locations] Found ${coaches.length} coaches to process`);

    const results: NormalizationResult[] = [];

    for (const coach of coaches) {
      const result: NormalizationResult = {
        id: coach.id,
        display_name: coach.display_name,
        original_location: coach.location,
        status: 'unresolved',
      };

      try {
        // Skip if already has complete location data (unless forceAll)
        if (!forceAll && coach.location_country_code && coach.location_lat) {
          result.status = 'skipped';
          result.details = {
            city: coach.location_city,
            country_code: coach.location_country_code,
          };
          results.push(result);
          continue;
        }

        console.log(`[normalize-locations] Processing: ${coach.display_name} - "${coach.location}"`);

        // Try Google Places geocoding first
        const predictions = await searchPlaces(coach.location, googleApiKey);

        if (predictions.length > 0) {
          const details = await getPlaceDetails(predictions[0].place_id, googleApiKey);

          if (details && details.country_code) {
            result.status = 'migrated';
            result.details = details;

            if (!dryRun) {
              const { error: updateError } = await supabase
                .from('coach_profiles')
                .update({
                  location_city: details.city,
                  location_region: details.region,
                  location_country: details.country,
                  location_country_code: details.country_code,
                  location_lat: details.lat,
                  location_lng: details.lng,
                  location_place_id: details.place_id,
                })
                .eq('id', coach.id);

              if (updateError) {
                result.status = 'error';
                result.error = `Update failed: ${updateError.message}`;
              }
            }

            results.push(result);
            continue;
          }
        }

        // Fall back to parsing logic
        const parsed = parseLegacyLocation(coach.location);

        if (parsed.countryCode) {
          result.status = 'parsed';
          result.details = {
            city: parsed.city,
            country: parsed.country,
            country_code: parsed.countryCode,
          };

          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('coach_profiles')
              .update({
                location_city: parsed.city,
                location_country: parsed.country,
                location_country_code: parsed.countryCode,
              })
              .eq('id', coach.id);

            if (updateError) {
              result.status = 'error';
              result.error = `Update failed: ${updateError.message}`;
            }
          }
        } else {
          result.status = 'unresolved';
          result.error = 'Could not determine country from location';
        }

        results.push(result);

      } catch (err) {
        result.status = 'error';
        result.error = err instanceof Error ? err.message : 'Unknown error';
        results.push(result);
      }
    }

    // Summary stats
    const summary = {
      total: results.length,
      migrated: results.filter(r => r.status === 'migrated').length,
      parsed: results.filter(r => r.status === 'parsed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      unresolved: results.filter(r => r.status === 'unresolved').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    console.log(`[normalize-locations] Complete. Summary:`, summary);

    return new Response(
      JSON.stringify({
        dryRun,
        summary,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[normalize-locations] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
