import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0].trim() || realIp || '';

    console.log('Fetching location for IP:', clientIp || 'auto-detect');

    // Use ipapi.co which supports HTTPS and has a good free tier
    const ipParam = clientIp ? `${clientIp}/` : '';
    const response = await fetch(`https://ipapi.co/${ipParam}json/`, {
      headers: {
        'User-Agent': 'FitConnect/1.0',
      },
    });

    if (!response.ok) {
      console.error('ipapi.co error:', response.status, response.statusText);
      throw new Error(`Location service returned ${response.status}`);
    }

    const data = await response.json();

    // Check for error responses from ipapi.co
    if (data.error) {
      console.error('ipapi.co API error:', data.reason);
      throw new Error(data.reason || 'Location service error');
    }

    const locationData = {
      city: data.city || null,
      region: data.region || null,
      country: data.country_name || null,
      countryCode: data.country_code || null,
      county: data.region || null,
    };

    console.log('Location detected:', locationData);

    return new Response(JSON.stringify(locationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error fetching location:', error);
    
    // Return fallback location (United Kingdom)
    return new Response(JSON.stringify({
      city: null,
      region: null,
      country: 'United Kingdom',
      countryCode: 'GB',
      county: null,
      fallback: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
