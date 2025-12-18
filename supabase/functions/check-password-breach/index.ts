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
    const { hashPrefix, hashSuffix } = await req.json();

    if (!hashPrefix || !hashSuffix) {
      return new Response(
        JSON.stringify({ error: 'Missing hashPrefix or hashSuffix' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query HaveIBeenPwned API with k-anonymity (only send first 5 chars of hash)
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
      {
        headers: {
          'Add-Padding': 'true', // Add padding to prevent response size analysis
          'User-Agent': 'FitConnect-Password-Check'
        }
      }
    );

    if (!response.ok) {
      console.error('HaveIBeenPwned API error:', response.status);
      // Return safe default if API is unavailable
      return new Response(
        JSON.stringify({ breached: false, error: 'API unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Check if our hash suffix is in the response
    let breachCount = 0;
    for (const line of lines) {
      const [suffix, count] = line.split(':');
      if (suffix.trim().toUpperCase() === hashSuffix.toUpperCase()) {
        breachCount = parseInt(count.trim(), 10);
        break;
      }
    }

    const breached = breachCount > 0;

    console.log(`Password breach check: ${breached ? 'FOUND' : 'NOT FOUND'} (${breachCount} occurrences)`);

    return new Response(
      JSON.stringify({ breached, count: breachCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking password breach:', error);
    return new Response(
      JSON.stringify({ breached: false, error: 'Check failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
