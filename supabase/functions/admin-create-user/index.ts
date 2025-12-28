import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-CREATE-USER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    logStep("User authenticated", { userId: userData.user.id });

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["admin", "manager"])
      .single();

    if (roleError || !roleData) {
      logStep("Unauthorized - not an admin/manager", { userId: userData.user.id });
      throw new Error("Unauthorized: Admin or Manager role required");
    }

    logStep("Admin role verified", { role: roleData.role });

    // Parse request body
    const body = await req.json();
    const { email, password, role, first_name, last_name, department } = body;

    // Validate required fields
    if (!email || !password || !role) {
      throw new Error("Missing required fields: email, password, role");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Validate role
    const validRoles = ["client", "coach", "admin", "manager", "staff"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Additional authorization: only admins can create admin/manager roles
    if (["admin", "manager"].includes(role) && roleData.role !== "admin") {
      throw new Error("Only admins can create admin or manager accounts");
    }

    logStep("Creating user", { email, role });

    // Create user using admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        role,
        first_name: first_name || "",
        last_name: last_name || "",
      },
    });

    if (createError) {
      logStep("Error creating user", { error: createError.message });
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    logStep("User created successfully", { userId: newUser.user.id });

    // Wait for trigger to create profile, then update with additional data
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Build display_name - always ensure it's set
    const fullName = [first_name, last_name].filter(Boolean).join(" ");
    
    // Get the generated username from user_profiles to use as fallback
    const { data: userProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("username")
      .eq("user_id", newUser.user.id)
      .single();
    
    const displayName = fullName || (userProfile?.username ? 
      userProfile.username.charAt(0).toUpperCase() + userProfile.username.slice(1) : 
      "User");

    // Update user_profiles with provided name data
    await supabaseAdmin
      .from("user_profiles")
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        display_name: displayName,
      })
      .eq("user_id", newUser.user.id);

    // Update role-specific profile with additional data
    if (role === "client") {
      await supabaseAdmin
        .from("client_profiles")
        .update({
          first_name: first_name || displayName,
          last_name: last_name || null,
        })
        .eq("user_id", newUser.user.id);
    } else if (role === "coach") {
      await supabaseAdmin
        .from("coach_profiles")
        .update({
          display_name: displayName,
        })
        .eq("user_id", newUser.user.id);
    } else if (["admin", "manager", "staff"].includes(role)) {
      // Update admin profile
      await supabaseAdmin
        .from("admin_profiles")
        .update({
          first_name: first_name || null,
          last_name: last_name || null,
          display_name: displayName,
          department: department || null,
        })
        .eq("user_id", newUser.user.id);
      
      // For team members, also update client and coach profiles created by trigger
      await supabaseAdmin
        .from("client_profiles")
        .update({
          first_name: first_name || displayName,
          last_name: last_name || null,
        })
        .eq("user_id", newUser.user.id);
      
      await supabaseAdmin
        .from("coach_profiles")
        .update({
          display_name: displayName,
        })
        .eq("user_id", newUser.user.id);
    }

    // Log the admin action for audit trail
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: userData.user.id,
      action: "create_user",
      entity_type: "user",
      entity_id: newUser.user.id,
      new_values: { email, role, first_name, last_name },
    });

    logStep("User creation completed", { userId: newUser.user.id });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
