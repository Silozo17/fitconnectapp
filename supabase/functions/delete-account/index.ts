import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client with the user's JWT to verify identity
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Get user role to determine which profile to delete
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    const role = userRole?.role || "client";
    console.log(`User role: ${role}`);

    // Delete storage files based on role
    try {
      if (role === "client") {
        // Get client profile ID
        const { data: clientProfile } = await supabaseAdmin
          .from("client_profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (clientProfile) {
          // Delete profile images
          const { data: profileImages } = await supabaseAdmin.storage
            .from("profile-images")
            .list(`clients/${clientProfile.id}`);
          
          if (profileImages?.length) {
            await supabaseAdmin.storage
              .from("profile-images")
              .remove(profileImages.map(f => `clients/${clientProfile.id}/${f.name}`));
          }

          // Delete transformation photos
          const { data: transformationPhotos } = await supabaseAdmin.storage
            .from("transformation-photos")
            .list(clientProfile.id);
          
          if (transformationPhotos?.length) {
            await supabaseAdmin.storage
              .from("transformation-photos")
              .remove(transformationPhotos.map(f => `${clientProfile.id}/${f.name}`));
          }
        }
      } else if (role === "coach") {
        // Get coach profile ID
        const { data: coachProfile } = await supabaseAdmin
          .from("coach_profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (coachProfile) {
          // Delete profile images
          const { data: profileImages } = await supabaseAdmin.storage
            .from("profile-images")
            .list(`coaches/${coachProfile.id}`);
          
          if (profileImages?.length) {
            await supabaseAdmin.storage
              .from("profile-images")
              .remove(profileImages.map(f => `coaches/${coachProfile.id}/${f.name}`));
          }

          // Delete verification documents
          const { data: documents } = await supabaseAdmin.storage
            .from("documents")
            .list(coachProfile.id);
          
          if (documents?.length) {
            await supabaseAdmin.storage
              .from("documents")
              .remove(documents.map(f => `${coachProfile.id}/${f.name}`));
          }
        }
      }
      console.log("Storage files deleted");
    } catch (storageError) {
      console.error("Storage deletion error (non-fatal):", storageError);
      // Continue with account deletion even if storage cleanup fails
    }

    // Delete the profile (CASCADE will handle related records)
    if (role === "client") {
      const { error: profileError } = await supabaseAdmin
        .from("client_profiles")
        .delete()
        .eq("user_id", userId);
      
      if (profileError) {
        console.error("Client profile deletion error:", profileError);
        throw new Error(`Failed to delete client profile: ${profileError.message}`);
      }
    } else if (role === "coach") {
      const { error: profileError } = await supabaseAdmin
        .from("coach_profiles")
        .delete()
        .eq("user_id", userId);
      
      if (profileError) {
        console.error("Coach profile deletion error:", profileError);
        throw new Error(`Failed to delete coach profile: ${profileError.message}`);
      }
    }
    console.log("Profile deleted");

    // Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    
    if (rolesError) {
      console.error("User roles deletion error:", rolesError);
      // Non-fatal, continue
    }
    console.log("User roles deleted");

    // Delete the auth user using admin API
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.error("Auth user deletion error:", authDeleteError);
      throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
    }
    console.log("Auth user deleted");

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Account deletion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
