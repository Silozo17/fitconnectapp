import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  baseEmailTemplate, 
  freeFloatingAvatarComponent,
  ctaButton,
  infoCard,
  EMAIL_CONFIG,
  getEmailAvatarUrl
} from "../_shared/email-templates.ts";

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
      .map((r) => `<li style="color: ${colors.textMuted}; margin-bottom: 8px; font-size: 14px;">${r}</li>`)
      .join("");

    // Build locations display
    const locationsDisplay = locationNames.length > 0 
      ? locationNames.join(", ") 
      : "All locations";

    // Build disciplines display for coaches
    let disciplineDisplay = "";
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
      disciplineDisplay = disciplineLabels.join(", ");
    }

    // Get mascot avatar for team/staff themed email
    const avatarUrl = getEmailAvatarUrl('new_client', supabaseUrl);

    // Build info card items
    const infoItems = [
      { label: "Role", value: roleInfo.label },
      { label: "Gym", value: gymName },
      { label: "Location(s)", value: locationsDisplay },
    ];
    
    if (disciplineDisplay) {
      infoItems.push({ label: "Disciplines", value: disciplineDisplay });
    }

    // Build email content using shared templates
    const emailContent = `
      <!-- Mascot Avatar -->
      ${freeFloatingAvatarComponent(avatarUrl, "FitConnect Team Member", 140, 'center')}
      
      <!-- Welcome Heading -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <h2 class="headline email-subheadline" style="color: ${colors.text}; margin: 0; font-size: 26px; font-weight: 700;">
              🎉 You're Invited!
            </h2>
          </td>
        </tr>
      </table>
      
      <!-- Greeting -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <p style="color: ${colors.textMuted}; line-height: 1.7; margin: 0; font-size: 16px;">
              Hi ${firstName},<br/><br/>
              <strong style="color: ${colors.primary};">${inviterName}</strong> has invited you to join 
              <strong style="color: ${colors.text};">${gymName}</strong> as a 
              <strong style="color: ${colors.primary};">${roleInfo.label}</strong>.
            </p>
          </td>
        </tr>
      </table>
      
      ${gym?.logo_url ? `
      <!-- Gym Logo -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <img src="${gym.logo_url}" alt="${gymName}" style="max-width: 140px; max-height: 90px; object-fit: contain; border-radius: 8px;">
          </td>
        </tr>
      </table>
      ` : ""}
      
      <!-- Role Details Card -->
      ${infoCard("Your Role Details", infoItems)}
      
      <!-- What You'll Do Section -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; margin: 24px 0;">
        <tr>
          <td style="padding: 24px;">
            <h3 style="color: ${colors.text}; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">🚀 What You'll Be Able To Do</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              ${responsibilitiesHtml}
            </ul>
          </td>
        </tr>
      </table>
      
      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
        <tr>
          <td>
            ${ctaButton("Accept Invitation & Login", loginUrl)}
          </td>
        </tr>
      </table>
      
      <!-- Login URL Text -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <p style="color: ${colors.textMuted}; font-size: 13px; margin: 0;">
              Or visit: <a href="${loginUrl}" style="color: ${colors.primary};">${loginUrl}</a>
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Instructions -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; margin: 24px 0;">
        <tr>
          <td style="padding: 24px;">
            <h4 style="color: ${colors.text}; margin: 0 0 16px 0; font-size: 15px; font-weight: 600;">📝 How to Get Started</h4>
            <ol style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
              <li>Click the button above or visit the login page</li>
              <li>Create an account or sign in with your existing FitConnect account</li>
              <li>Use this email address: <strong style="color: ${colors.text};">${invitation.email}</strong></li>
              <li>You'll be automatically connected to ${gymName}</li>
            </ol>
          </td>
        </tr>
      </table>
      
      <!-- Expiry Notice -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding-top: 16px;">
            <p style="color: ${colors.textDark}; font-size: 12px; margin: 0;">
              This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    `;

    // Wrap content in the base email template
    const emailHtml = baseEmailTemplate(
      emailContent, 
      `${inviterName} has invited you to join ${gymName} on FitConnect`
    );

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
        subject: `🎉 You're invited to join ${gymName} as ${roleInfo.label}!`,
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
