import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Role descriptions for the email
const ROLE_INFO: Record<string, { label: string; description: string; responsibilities: string[] }> = {
  owner: {
    label: "Gym Owner",
    description: "Full control over the gym and all operations",
    responsibilities: [
      "Complete gym management and oversight",
      "Staff hiring, scheduling, and performance reviews",
      "Financial reports and revenue management",
      "Access to all locations and features",
    ],
  },
  area_manager: {
    label: "Area Manager",
    description: "Multi-location oversight and management",
    responsibilities: [
      "Manage multiple gym locations",
      "Oversee staff across assigned areas",
      "Monitor performance and KPIs",
      "Coordinate between locations",
    ],
  },
  manager: {
    label: "Manager",
    description: "Location-specific management",
    responsibilities: [
      "Manage daily operations at your location",
      "Handle staff schedules and shifts",
      "Process member enquiries and issues",
      "View reports and analytics",
    ],
  },
  staff: {
    label: "Front Desk Staff",
    description: "Member services and check-in operations",
    responsibilities: [
      "Check members in and out",
      "Handle bookings and appointments",
      "Answer member questions",
      "Manage class reservations",
    ],
  },
  coach: {
    label: "Coach / Instructor",
    description: "Teaching and personal training",
    responsibilities: [
      "Teach classes in your disciplines",
      "Conduct personal training sessions",
      "Track client progress",
      "Build and manage your client roster",
    ],
  },
  marketing: {
    label: "Marketing",
    description: "Promotions and member communications",
    responsibilities: [
      "Create and manage campaigns",
      "Handle social media and promotions",
      "Send member communications",
      "Track marketing performance",
    ],
  },
};

const EMAIL_CONFIG = {
  colors: {
    primary: "#BEFF00",
    primaryDark: "#9acc00",
    background: "#0D0D14",
    cardBg: "#1a1a24",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    textDark: "#666666",
    border: "rgba(190, 255, 0, 0.2)",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId } = await req.json();

    if (!invitationId) {
      throw new Error("Missing invitationId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("gym_staff_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (inviteError || !invitation) {
      throw new Error(`Invitation not found: ${inviteError?.message}`);
    }

    // Fetch gym details
    const { data: gym } = await supabase
      .from("gym_profiles")
      .select("name, logo_url, slug")
      .eq("id", invitation.gym_id)
      .single();

    // Fetch assigned locations if any
    let locationNames: string[] = [];
    if (invitation.assigned_location_ids && invitation.assigned_location_ids.length > 0) {
      const { data: locations } = await supabase
        .from("gym_locations")
        .select("name")
        .in("id", invitation.assigned_location_ids);
      
      locationNames = locations?.map((l) => l.name) || [];
    }

    const roleInfo = ROLE_INFO[invitation.role] || {
      label: invitation.role,
      description: "Staff member",
      responsibilities: ["Access gym management features"],
    };

    const { colors } = EMAIL_CONFIG;
    const loginUrl = "https://getfitconnect.co.uk/gym-login";
    const firstName = invitation.first_name || "there";
    const inviterName = invitation.invited_by_name || "The team";
    const gymName = gym?.name || "the gym";

    // Build responsibilities list
    const responsibilitiesHtml = roleInfo.responsibilities
      .map((r) => `<li style="color: ${colors.textMuted}; margin-bottom: 8px;">${r}</li>`)
      .join("");

    // Build locations display
    const locationsDisplay = locationNames.length > 0 
      ? locationNames.join(", ") 
      : "All locations";

    // Build disciplines display for coaches
    let disciplinesHtml = "";
    if (invitation.role === "coach" && invitation.disciplines && invitation.disciplines.length > 0) {
      const disciplineLabels = invitation.disciplines.map((d: string) => {
        const labels: Record<string, string> = {
          personal_training: "Personal Training",
          boxing: "Boxing",
          mma: "MMA",
          bjj: "Brazilian Jiu-Jitsu",
          muay_thai: "Muay Thai",
          wrestling: "Wrestling",
          yoga: "Yoga",
          pilates: "Pilates",
          spinning: "Spinning / Cycling",
          crossfit: "CrossFit",
          strength: "Strength & Conditioning",
          nutrition: "Nutrition Coaching",
          swimming: "Swimming",
          dance: "Dance / Zumba",
          hiit: "HIIT",
        };
        return labels[d] || d;
      });
      disciplinesHtml = `
        <tr>
          <td style="color: ${colors.textMuted}; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">Disciplines</td>
          <td style="color: ${colors.text}; font-weight: 500; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-size: 14px;">${disciplineLabels.join(", ")}</td>
        </tr>
      `;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${gymName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background}; color: ${colors.text}; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.background} 100%); border-radius: 16px; padding: 40px; border: 1px solid ${colors.border};">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: ${colors.primary}; margin: 0; font-size: 28px;">FitConnect</h1>
    </div>
    
    <!-- Gym Logo -->
    ${gym?.logo_url ? `
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="${gym.logo_url}" alt="${gymName}" style="max-width: 120px; max-height: 80px; object-fit: contain;">
    </div>
    ` : ""}
    
    <!-- Main Heading -->
    <h2 style="color: ${colors.text}; margin-bottom: 16px; text-align: center; font-size: 24px;">
      🎉 You're Invited!
    </h2>
    
    <!-- Greeting -->
    <p style="color: ${colors.textMuted}; line-height: 1.6; margin-bottom: 24px; text-align: center; font-size: 16px;">
      Hi ${firstName},<br/><br/>
      <strong style="color: ${colors.primary};">${inviterName}</strong> has invited you to join 
      <strong style="color: ${colors.text};">${gymName}</strong> as a 
      <strong style="color: ${colors.primary};">${roleInfo.label}</strong>.
    </p>
    
    <!-- Role Info Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(190, 255, 0, 0.08); border-radius: 12px; margin: 24px 0; border: 1px solid ${colors.border};">
      <tr>
        <td style="padding: 20px;">
          <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Your Role Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color: ${colors.textMuted}; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">Role</td>
              <td style="color: ${colors.text}; font-weight: 500; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-size: 14px;">${roleInfo.label}</td>
            </tr>
            <tr>
              <td style="color: ${colors.textMuted}; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px;">Gym</td>
              <td style="color: ${colors.text}; font-weight: 500; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; font-size: 14px;">${gymName}</td>
            </tr>
            <tr>
              <td style="color: ${colors.textMuted}; padding: 12px 0; ${disciplinesHtml ? 'border-bottom: 1px solid rgba(255,255,255,0.1);' : ''} font-size: 14px;">Location(s)</td>
              <td style="color: ${colors.text}; font-weight: 500; padding: 12px 0; ${disciplinesHtml ? 'border-bottom: 1px solid rgba(255,255,255,0.1);' : ''} text-align: right; font-size: 14px;">${locationsDisplay}</td>
            </tr>
            ${disciplinesHtml}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- What You'll Do Section -->
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: ${colors.text}; margin: 0 0 16px 0; font-size: 16px;">🚀 What You'll Be Able To Do</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        ${responsibilitiesHtml}
      </ul>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); color: ${colors.background}; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Accept Invitation & Login
      </a>
    </div>
    
    <!-- Login URL Text -->
    <p style="color: ${colors.textMuted}; font-size: 13px; text-align: center; margin-bottom: 24px;">
      Or visit: <a href="${loginUrl}" style="color: ${colors.primary};">${loginUrl}</a>
    </p>
    
    <!-- Instructions -->
    <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h4 style="color: ${colors.text}; margin: 0 0 12px 0; font-size: 14px;">📝 How to Get Started</h4>
      <ol style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
        <li>Click the button above or visit the login page</li>
        <li>Create an account or sign in with your existing FitConnect account</li>
        <li>Use this email address: <strong style="color: ${colors.text};">${invitation.email}</strong></li>
        <li>You'll be automatically connected to ${gymName}</li>
      </ol>
    </div>
    
    <!-- Footer -->
    <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 32px; padding-top: 24px;">
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin: 0 0 16px 0;">
        This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      </p>
      
      <!-- Social Links -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="https://instagram.com/get_fit_connect" style="color: ${colors.textMuted}; text-decoration: none; margin: 0 8px; font-size: 12px;">Instagram</a>
        <span style="color: ${colors.textDark};">•</span>
        <a href="https://facebook.com/FitConnectUK" style="color: ${colors.textMuted}; text-decoration: none; margin: 0 8px; font-size: 12px;">Facebook</a>
        <span style="color: ${colors.textDark};">•</span>
        <a href="https://x.com/FitConnectUK" style="color: ${colors.textMuted}; text-decoration: none; margin: 0 8px; font-size: 12px;">X</a>
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 11px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} FitConnect. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FitConnect <noreply@getfitconnect.co.uk>",
        to: [invitation.email],
        subject: `You're invited to join ${gymName} as ${roleInfo.label}!`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending staff invitation:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
