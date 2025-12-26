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

    // Log raw address components for debugging
    console.log(`Raw address components:`, JSON.stringify(addressComponents.map((c: { long_name: string; types: string[] }) => ({
      name: c.long_name,
      types: c.types
    }))));

    // Extract all potential address components
    let locality = "";
    let postalTown = "";
    let adminArea1 = "";  // e.g., "England" for UK (constituent country)
    let adminArea2 = "";  // e.g., "Greater London", "Buckinghamshire" for UK (actual county)
    let countryName = "";
    let countryCode = "";

    for (const component of addressComponents) {
      const types = component.types || [];
      if (types.includes("locality")) {
        locality = component.long_name;
      }
      if (types.includes("postal_town")) {
        postalTown = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        adminArea1 = component.long_name;
      }
      if (types.includes("administrative_area_level_2")) {
        adminArea2 = component.long_name;
      }
      if (types.includes("country")) {
        countryName = component.long_name;
        countryCode = component.short_name;
      }
    }

    // City: prefer locality, fallback to postal_town, then name
    const city = locality || postalTown || result.name || "";

    // County/Region: for UK, use adminArea2 (actual county like "Greater London")
    // because adminArea1 is "England/Scotland/Wales/NI" which is NOT a county
    // For other countries, try adminArea2 first, then adminArea1
    const isUK = countryCode === "GB";
    const region = isUK 
      ? adminArea2  // Use administrative_area_level_2 for UK counties
      : (adminArea2 || adminArea1);  // For other countries, try both

    console.log(`Extraction results: isUK=${isUK}, locality=${locality}, postalTown=${postalTown}, adminArea1=${adminArea1}, adminArea2=${adminArea2}`);
    console.log(`Final mapping: city=${city}, region/county=${region}, country=${countryName}`);

    const placeDetails = {
      place_id,
      formatted_address: result.formatted_address,
      city,
      region,
      country: countryName,
      country_code: countryCode,
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
    };

    console.log(`Place details fetched for ${city}, ${region}, ${countryName}`);

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
