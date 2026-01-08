import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(JSON.stringify({ step, details, timestamp: new Date().toISOString() }));
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    logStep("Starting admin-revoke-plan function");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Create user client to verify the caller
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Get the calling user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      return errorResponse("Unauthorized", 401);
    }

    logStep("User authenticated", { userId: user.id });

    // Verify the user has admin/manager/staff role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager", "staff"]);

    if (rolesError || !roles || roles.length === 0) {
      logStep("Not an admin", { error: rolesError?.message });
      return errorResponse("Forbidden: Admin access required", 403);
    }

    logStep("Admin verified", { roles: roles.map(r => r.role) });

    // Parse request body
    const { grantId, coachId, currentTier, targetTier = "free" } = await req.json();

    if (!coachId) {
      return errorResponse("Missing required field: coachId", 400);
    }

    logStep("Revoking plan", { grantId, coachId, currentTier, targetTier });

    // Step 1: Deactivate the grant record (if a real grant ID was provided)
    if (grantId && grantId !== "direct-admin-change") {
      const { error: grantError } = await supabaseAdmin
        .from("admin_granted_subscriptions")
        .update({ is_active: false })
        .eq("id", grantId);

      if (grantError) {
        logStep("Failed to deactivate grant (might not exist)", { error: grantError.message });
        // Don't fail - grant might not exist, continue with tier update
      } else {
        logStep("Grant deactivated");
      }
    } else {
      logStep("No grant to deactivate (direct admin change)");
    }

    // Step 2: Use the admin_update_coach_tier function to bypass founder protection
    const { error: tierError } = await supabaseAdmin.rpc("admin_update_coach_tier", {
      p_coach_id: coachId,
      p_new_tier: targetTier,
    });

    if (tierError) {
      logStep("Failed to update tier via RPC", { error: tierError.message });
      return errorResponse(`Failed to update tier: ${tierError.message}`, 500);
    }

    logStep("Tier updated successfully", { newTier: targetTier });

    return jsonResponse({ 
      success: true, 
      message: `Plan revoked. Coach tier updated to ${targetTier}` 
    });

  } catch (error) {
    logStep("Error in admin-revoke-plan", { error: error.message });
    return errorResponse(error.message || "Internal server error", 500);
  }
});
