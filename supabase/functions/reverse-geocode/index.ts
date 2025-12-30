import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Confidence scores for Google location_type
const confidenceScores: Record<string, number> = {
  ROOFTOP: 9,           // Exact address - high confidence
  RANGE_INTERPOLATED: 7, // Good - use city
  GEOMETRIC_CENTER: 5,   // Medium - use city if found, else county
  APPROXIMATE: 3         // Low - fallback to county
};

const CONFIDENCE_THRESHOLD = 5; // Below this, prefer county over city

interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

interface LocationResult {
  city: string | null;
  county: string | null;
  country: string | null;
  countryCode: string | null;
  locationType: string;
  confidence: number;
  displayLocation: string; // The recommended location to display (city or county based on confidence)
  formattedAddress: string | null;
}

/**
 * Extract location components from Google Geocoding API result
 * Handles UK-specific address components (postal_town, administrative_area_level_2)
 */
function extractLocationFromResult(result: any): LocationResult {
  const components = result.address_components || [];
  const locationType = result.geometry?.location_type || 'APPROXIMATE';
  const confidence = confidenceScores[locationType] || 3;
  
  let city: string | null = null;
  let county: string | null = null;
  let country: string | null = null;
  let countryCode: string | null = null;

  for (const component of components) {
    const types = component.types || [];
    
    // UK uses postal_town for city
    if (types.includes('postal_town')) {
      city = component.long_name;
    }
    // Fallback to locality if no postal_town
    if (!city && types.includes('locality')) {
      city = component.long_name;
    }
    // County/region (administrative_area_level_2 for UK)
    if (types.includes('administrative_area_level_2')) {
      county = component.long_name;
    }
    // Fallback to level_1 if no level_2 (some countries use this for region)
    if (!county && types.includes('administrative_area_level_1')) {
      county = component.long_name;
    }
    // Country
    if (types.includes('country')) {
      country = component.long_name;
      countryCode = component.short_name;
    }
  }

  // Determine display location based on confidence
  // If confidence is low OR city seems like a micro-location (very short or no city found),
  // prefer county for display
  let displayLocation: string;
  
  if (confidence < CONFIDENCE_THRESHOLD || !city) {
    // Low confidence or no city - use county
    displayLocation = county || country || 'Unknown';
  } else {
    // High confidence - use city
    displayLocation = city;
  }

  console.log('Extracted location:', {
    city,
    county,
    country,
    countryCode,
    locationType,
    confidence,
    displayLocation
  });

  return {
    city,
    county,
    country,
    countryCode,
    locationType,
    confidence,
    displayLocation,
    formattedAddress: result.formatted_address || null
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ReverseGeocodeRequest = await req.json();
    const { lat, lng } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates: lat and lng must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return new Response(
        JSON.stringify({ error: 'Coordinates out of valid range' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Reverse geocoding: lat=${lat}, lng=${lng}`);

    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=en`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to determine location',
          status: data.status
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the first result (most specific)
    const result = data.results[0];
    const locationData = extractLocationFromResult(result);

    console.log('Reverse geocode successful:', locationData);

    return new Response(
      JSON.stringify(locationData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reverse geocode error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
