import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getTableName = (userType: string): string => {
  switch (userType) {
    case "coach":
      return "coach_profiles";
    case "team":
      return "admin_profiles";
    default:
      return "client_profiles";
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseServiceClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role by directly querying user_roles with service role (bypasses RLS)
    console.log("Checking admin role for user:", user.id);
    
    const { data: roleData, error: roleError } = await supabaseServiceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    console.log("Role check result:", { roleData, roleError });

    if (roleError || !roleData) {
      console.log("Admin role check failed - no admin role found");
      return new Response(JSON.stringify({ error: "Unauthorized - admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const { action, userType } = body;

    console.log(`Admin action: ${action}, userType: ${userType}`, body);

    switch (action) {
      case "get_user_email": {
        const { userId } = body;
        const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (error) {
          console.error("Get user email error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ 
          email: userData.user.email,
          last_sign_in_at: userData.user.last_sign_in_at 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_user_emails_batch": {
        const { userIds } = body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return new Response(JSON.stringify({ error: "userIds must be a non-empty array" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const results: Record<string, { email: string | null; last_sign_in_at: string | null }> = {};
        
        // Batch fetch all users
        await Promise.all(
          userIds.map(async (userId: string) => {
            try {
              const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
              if (!error && userData?.user) {
                results[userId] = {
                  email: userData.user.email || null,
                  last_sign_in_at: userData.user.last_sign_in_at || null,
                };
              } else {
                results[userId] = { email: null, last_sign_in_at: null };
              }
            } catch {
              results[userId] = { email: null, last_sign_in_at: null };
            }
          })
        );

        return new Response(JSON.stringify({ users: results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_email": {
        const { userId, newEmail } = body;
        
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: newEmail,
        });

        if (error) {
          console.error("Update email error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_status": {
        const { userId, profileId, status, reason } = body;
        
        // Update auth user ban status if banning
        if (status === "banned") {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: "876600h", // ~100 years
          });
        } else if (status === "active") {
          // Remove ban
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: "none",
          });
        }

        // Update profile status
        const table = getTableName(userType);
        const { error } = await supabaseAdmin
          .from(table)
          .update({
            status,
            status_reason: reason || null,
            status_updated_at: new Date().toISOString(),
            status_updated_by: user.id,
          })
          .eq("id", profileId);

        if (error) {
          console.error("Update status error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "bulk_update_status": {
        const { userIds, profileIds, status, reason } = body;

        // Update auth users ban status if banning
        for (const userId of userIds) {
          if (status === "banned") {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "876600h",
            });
          } else if (status === "active") {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "none",
            });
          }
        }

        // Update profile statuses
        const table = getTableName(userType);
        const { error } = await supabaseAdmin
          .from(table)
          .update({
            status,
            status_reason: reason || null,
            status_updated_at: new Date().toISOString(),
            status_updated_by: user.id,
          })
          .in("id", profileIds);

        if (error) {
          console.error("Bulk update status error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, count: profileIds.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "bulk_delete": {
        const { profileIds, userIds } = body;
        
        // Delete profiles first
        const table = getTableName(userType);
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .in("id", profileIds);

        if (error) {
          console.error("Bulk delete profiles error:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete user_roles and auth users if userIds provided
        if (userIds && userIds.length > 0) {
          // Delete user_roles BEFORE auth users to allow re-registration
          const { error: rolesError } = await supabaseAdmin
            .from("user_roles")
            .delete()
            .in("user_id", userIds);
          
          if (rolesError) {
            console.warn("Failed to delete user_roles:", rolesError);
          }

          // Now delete auth users
          const deleteErrors: string[] = [];
          for (const userId of userIds) {
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (authError) {
              console.error(`Failed to delete auth user ${userId}:`, authError);
              deleteErrors.push(userId);
            }
          }
          
          if (deleteErrors.length > 0) {
            console.warn(`Failed to delete ${deleteErrors.length} auth users. Users may still be able to re-register.`);
          }
        }

        return new Response(JSON.stringify({ success: true, count: profileIds.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin user management error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
