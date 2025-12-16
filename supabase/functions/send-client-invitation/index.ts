import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  firstName: string;
  lastName: string;
  coachName: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the authorization header to verify the caller is a coach
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's JWT to get their info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is a coach
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isCoach, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "coach",
    });

    if (roleError || !isCoach) {
      console.error("Role check failed:", roleError);
      return new Response(JSON.stringify({ error: "Coach access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, firstName, lastName, coachName, message }: InvitationRequest = await req.json();

    if (!email || !firstName || !lastName) {
      return new Response(JSON.stringify({ error: "Email, first name, and last name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Coach ${user.id} inviting client ${email}`);

    // Generate a magic link for the new user to sign up
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "client",
          invited_by_coach: user.id,
        },
      },
    });

    if (inviteError) {
      console.error("Invite generation error:", inviteError);
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the site URL for the invitation link
    const siteUrl = Deno.env.get("SITE_URL") || supabaseUrl.replace(".supabase.co", ".lovableproject.com");
    const inviteLink = inviteData.properties?.action_link || `${siteUrl}/auth`;

    // Send invitation email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <onboarding@resend.dev>",
        to: [email],
        subject: `${coachName} has invited you to FitConnect!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0D0D14; color: #ffffff; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a24 0%, #0D0D14 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(190, 255, 0, 0.2);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #BEFF00; margin: 0; font-size: 28px;">FitConnect</h1>
              </div>
              
              <h2 style="color: #ffffff; margin-bottom: 16px;">Hi ${firstName}!</h2>
              
              <p style="color: #a0a0a0; line-height: 1.6; margin-bottom: 24px;">
                <strong style="color: #BEFF00;">${coachName}</strong> has invited you to join FitConnect as their client. 
                Get ready to transform your fitness journey with personalized coaching!
              </p>
              
              ${message ? `
              <div style="background: rgba(190, 255, 0, 0.1); border-left: 3px solid #BEFF00; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="color: #ffffff; margin: 0; font-style: italic;">"${message}"</p>
                <p style="color: #a0a0a0; margin: 8px 0 0 0; font-size: 14px;">- ${coachName}</p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #BEFF00 0%, #9acc00 100%); color: #0D0D14; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #666666; font-size: 12px; text-align: center; margin-top: 32px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send invitation email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Invitation email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-client-invitation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
