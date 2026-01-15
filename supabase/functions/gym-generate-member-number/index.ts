import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Generate a random 2-letter prefix
function generatePrefix(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I and O to avoid confusion with 1 and 0
  return letters.charAt(Math.floor(Math.random() * letters.length)) + 
         letters.charAt(Math.floor(Math.random() * letters.length));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gymId, locationId, allLocations } = await req.json();

    if (!gymId) {
      throw new Error("Missing required parameter: gymId");
    }

    let prefix: string;

    if (allLocations) {
      // Get or create prefix for gym-wide membership (all locations)
      const { data: gymProfile, error: gymError } = await supabase
        .from("gym_profiles")
        .select("member_number_prefix")
        .eq("id", gymId)
        .single();

      if (gymError) throw gymError;

      if (gymProfile?.member_number_prefix) {
        prefix = gymProfile.member_number_prefix;
      } else {
        // Generate new prefix for gym
        prefix = generatePrefix();
        
        // Ensure prefix is unique across all gyms
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from("gym_profiles")
            .select("id")
            .eq("member_number_prefix", prefix)
            .limit(1);
          
          if (!existing || existing.length === 0) break;
          prefix = generatePrefix();
          attempts++;
        }

        // Save prefix to gym profile
        await supabase
          .from("gym_profiles")
          .update({ member_number_prefix: prefix })
          .eq("id", gymId);
      }
    } else if (locationId) {
      // Get or create prefix for specific location
      const { data: location, error: locationError } = await supabase
        .from("gym_locations")
        .select("member_number_prefix")
        .eq("id", locationId)
        .single();

      if (locationError) throw locationError;

      if (location?.member_number_prefix) {
        prefix = location.member_number_prefix;
      } else {
        // Generate new prefix for location
        prefix = generatePrefix();
        
        // Ensure prefix is unique across all locations
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from("gym_locations")
            .select("id")
            .eq("member_number_prefix", prefix)
            .limit(1);
          
          if (!existing || existing.length === 0) break;
          prefix = generatePrefix();
          attempts++;
        }

        // Save prefix to location
        await supabase
          .from("gym_locations")
          .update({ member_number_prefix: prefix })
          .eq("id", locationId);
      }
    } else {
      throw new Error("Either locationId or allLocations must be provided");
    }

    // Get the highest member number with this prefix
    const { data: members, error: membersError } = await supabase
      .from("gym_members")
      .select("member_number")
      .eq("gym_id", gymId)
      .like("member_number", `${prefix}%`)
      .order("member_number", { ascending: false })
      .limit(1);

    if (membersError) throw membersError;

    let nextNumber = 1;
    if (members && members.length > 0 && members[0].member_number) {
      const currentNumber = parseInt(members[0].member_number.substring(2), 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    // Format as PREFIX + 6 digits (e.g., MC000001)
    const memberNumber = `${prefix}${nextNumber.toString().padStart(6, '0')}`;

    console.log(`[gym-generate-member-number] Generated member number: ${memberNumber} for gym ${gymId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      memberNumber,
      prefix 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[gym-generate-member-number] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
