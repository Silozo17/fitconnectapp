import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = user.email?.toLowerCase();
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User has no email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all pending invitations for this user's email
    const { data: pendingInvites, error: invitesError } = await supabaseAdmin
      .from("gym_staff_invitations")
      .select("*, gym_profiles:gym_id(id, name)")
      .eq("status", "pending")
      .ilike("email", userEmail);

    if (invitesError) {
      console.error("Error fetching invitations:", invitesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch invitations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pendingInvites || pendingInvites.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending invitations found", accepted: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const acceptedGyms: { gymId: string; gymName: string; role: string }[] = [];
    const errors: string[] = [];

    for (const invite of pendingInvites) {
      try {
        // Check if staff record already exists
        const { data: existingStaff } = await supabaseAdmin
          .from("gym_staff")
          .select("id")
          .eq("gym_id", invite.gym_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingStaff) {
          // Already a staff member, just update invitation status
          await supabaseAdmin
            .from("gym_staff_invitations")
            .update({ 
              status: "accepted", 
              accepted_at: new Date().toISOString() 
            })
            .eq("id", invite.id);
          
          const gymName = (invite as any).gym_profiles?.name || "Unknown Gym";
          acceptedGyms.push({ gymId: invite.gym_id, gymName, role: invite.role });
          continue;
        }

        // Create gym_staff record
        const displayName = `${invite.first_name || ""} ${invite.last_name || ""}`.trim() || userEmail;
        
        const { error: staffError } = await supabaseAdmin
          .from("gym_staff")
          .insert({
            gym_id: invite.gym_id,
            user_id: user.id,
            email: userEmail,
            first_name: invite.first_name,
            last_name: invite.last_name,
            display_name: displayName,
            phone: invite.phone,
            role: invite.role,
            status: "active",
            assigned_location_ids: invite.assigned_location_ids || [],
            disciplines: invite.disciplines || [],
            multi_location_access: !invite.assigned_location_ids || invite.assigned_location_ids.length === 0,
          });

        if (staffError) {
          console.error("Error creating staff record:", staffError);
          errors.push(`Failed to create staff record for gym ${invite.gym_id}: ${staffError.message}`);
          continue;
        }

        // Update invitation status
        await supabaseAdmin
          .from("gym_staff_invitations")
          .update({ 
            status: "accepted", 
            accepted_at: new Date().toISOString() 
          })
          .eq("id", invite.id);

        const gymName = (invite as any).gym_profiles?.name || "Unknown Gym";
        acceptedGyms.push({ gymId: invite.gym_id, gymName, role: invite.role });
        
      } catch (err: any) {
        console.error("Error processing invitation:", err);
        errors.push(`Error processing invitation ${invite.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Accepted ${acceptedGyms.length} invitation(s)`,
        accepted: acceptedGyms.length,
        gyms: acceptedGyms,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
