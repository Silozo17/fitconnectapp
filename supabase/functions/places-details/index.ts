import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { place_id } = await req.json();

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: "place_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Places API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching place details for: ${place_id}`);

    // Use Google Places Details API
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", place_id);
    url.searchParams.set("fields", "address_components,geometry,formatted_address,name");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places Details API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || "Failed to fetch place details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data.result;
    const addressComponents = result.address_components || [];

    // Extract city, region, country from address components
    let city = "";
    let region = "";
    let country = "";
    let countryCode = "";

    for (const component of addressComponents) {
      const types = component.types || [];
      if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        region = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
        countryCode = component.short_name;
      }
    }

    // Fallback: if no locality, use the first part of formatted address or name
    if (!city && result.name) {
      city = result.name;
    }

    const placeDetails = {
      place_id,
      formatted_address: result.formatted_address,
      city,
      region,
      country,
      country_code: countryCode,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    };

    console.log(`Place details fetched for ${city}, ${country}`);

    return new Response(
      JSON.stringify(placeDetails),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in places-details:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch place details";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
