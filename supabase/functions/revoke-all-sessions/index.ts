import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { keepCurrent = false } = await req.json().catch(() => ({}));

    console.log(`[revoke-all-sessions] Revoking sessions for user: ${user.id}, keepCurrent: ${keepCurrent}`);

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Mark all sessions as inactive in our tracking table
    const { error: updateError } = await adminClient
      .from("user_sessions")
      .update({ is_active: false })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[revoke-all-sessions] Error updating sessions:", updateError);
    }

    // Sign out user globally using admin API
    // This invalidates all refresh tokens
    const { error: signOutError } = await adminClient.auth.admin.signOut(user.id, "global");

    if (signOutError) {
      console.error("[revoke-all-sessions] Error signing out user:", signOutError);
      // Don't throw - the session table was updated
    }

    console.log(`[revoke-all-sessions] Successfully revoked all sessions for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "All sessions revoked" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[revoke-all-sessions] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
