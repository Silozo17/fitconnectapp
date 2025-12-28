import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoachProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  card_image_url: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  location: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
}

// Calculate what's missing for marketplace visibility
function getMissingItems(coach: CoachProfile): string[] {
  const missing: string[] = [];
  
  if (!coach.display_name?.trim()) missing.push("Display name");
  if (!coach.bio || coach.bio.length < 50) missing.push("Bio (50+ characters)");
  if (!coach.coach_types?.length) missing.push("Specialisation(s)");
  if (!coach.hourly_rate || coach.hourly_rate <= 0) missing.push("Hourly rate");
  if (!coach.online_available && !coach.in_person_available) missing.push("Session type (online/in-person)");
  if (!coach.location?.trim()) missing.push("Location");
  
  return missing;
}

// Calculate completion percentage (for visibility requirements only)
function getCompletionPercentage(coach: CoachProfile): number {
  const requirements = [
    !!coach.display_name?.trim(),
    coach.bio && coach.bio.length >= 50,
    coach.coach_types && coach.coach_types.length > 0,
    coach.hourly_rate && coach.hourly_rate > 0,
    coach.online_available || coach.in_person_available,
    !!coach.location?.trim(),
  ];
  
  const completed = requirements.filter(Boolean).length;
  return Math.round((completed / requirements.length) * 100);
}

// Generate 24-hour reminder email HTML
function generate24hEmailHtml(name: string, percentage: number, missingItems: string[]): string {
  const progressColor = percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Coach Profile</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">
          You're ${percentage}% of the way there! 🏋️
        </h1>
        <p style="color: #71717a; font-size: 16px; margin: 0;">
          Hey ${name}, your coach profile is almost ready
        </p>
      </div>

      <!-- Progress Bar -->
      <div style="margin-bottom: 32px;">
        <div style="background-color: #e4e4e7; border-radius: 100px; height: 12px; overflow: hidden;">
          <div style="background-color: ${progressColor}; height: 100%; width: ${percentage}%; border-radius: 100px;"></div>
        </div>
        <p style="text-align: center; color: #71717a; font-size: 14px; margin-top: 8px;">
          ${percentage}% complete
        </p>
      </div>

      <!-- What's missing -->
      <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h2 style="color: #18181b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
          Here's what you still need:
        </h2>
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${missingItems.map(item => `
            <li style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
              <span style="color: #ef4444; margin-right: 12px;">○</span>
              <span style="color: #3f3f46; font-size: 15px;">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Why it matters -->
      <div style="margin-bottom: 32px;">
        <h3 style="color: #18181b; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
          Why complete your profile?
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #52525b; font-size: 15px; line-height: 1.8;">
          <li>Coaches with complete profiles get <strong>5x more enquiries</strong></li>
          <li>Appear in search results and the Find Coaches page</li>
          <li>Build trust with potential clients from the start</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://fitconnect.uk/dashboard/coach/settings" 
           style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
          Complete Your Profile
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center;">
        <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
          You're receiving this because you signed up as a coach on FitConnect.
          <br>Questions? Reply to this email or visit our <a href="https://fitconnect.uk/help" style="color: #a1a1aa;">Help Centre</a>.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generate 3-day reminder email HTML (more urgent)
function generate3dEmailHtml(name: string, percentage: number, missingItems: string[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Profile Isn't Visible Yet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Header with warning -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #92400e; font-size: 15px; margin: 0; font-weight: 500;">
            ⚠️ Your profile won't appear in search results until it's complete
          </p>
        </div>
        <h1 style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">
          ${name}, you're so close!
        </h1>
        <p style="color: #71717a; font-size: 16px; margin: 0;">
          Just ${100 - percentage}% more to unlock your full visibility
        </p>
      </div>

      <!-- Progress -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#22c55e ${percentage * 3.6}deg, #e4e4e7 ${percentage * 3.6}deg); position: relative;">
          <div style="position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px; font-weight: 700; color: #18181b;">${percentage}%</span>
          </div>
        </div>
      </div>

      <!-- Missing items -->
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h2 style="color: #dc2626; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
          Finish these ${missingItems.length} item${missingItems.length > 1 ? 's' : ''} to go live:
        </h2>
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${missingItems.map(item => `
            <li style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #fecaca;">
              <span style="background-color: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px;">!</span>
              <span style="color: #7f1d1d; font-size: 15px;">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Social proof -->
      <div style="text-align: center; margin-bottom: 32px;">
        <p style="color: #52525b; font-size: 15px; margin: 0;">
          <strong>500+ coaches</strong> are already connecting with clients on FitConnect.
          <br>Don't miss out on potential bookings!
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://fitconnect.uk/dashboard/coach/settings" 
           style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
          Finish My Profile Now
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center;">
        <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
          You're receiving this because you signed up as a coach on FitConnect.
          <br>Questions? Reply to this email or visit our <a href="https://fitconnect.uk/help" style="color: #a1a1aa;">Help Centre</a>.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reminder_type } = await req.json();
    
    if (!reminder_type || !["24h", "3d"].includes(reminder_type)) {
      throw new Error("Invalid reminder_type. Must be '24h' or '3d'");
    }

    console.log(`[Profile Reminder] Starting ${reminder_type} reminder process...`);

    // Calculate time window based on reminder type
    const now = new Date();
    let minHoursAgo: number;
    let maxHoursAgo: number;
    let emailType: string;
    
    if (reminder_type === "24h") {
      // Coaches who signed up 23-25 hours ago
      minHoursAgo = 23;
      maxHoursAgo = 25;
      emailType = "profile_reminder_24h";
    } else {
      // Coaches who signed up 71-73 hours ago (3 days)
      minHoursAgo = 71;
      maxHoursAgo = 73;
      emailType = "profile_reminder_3d";
    }

    const minDate = new Date(now.getTime() - maxHoursAgo * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() - minHoursAgo * 60 * 60 * 1000);

    console.log(`[Profile Reminder] Looking for coaches created between ${minDate.toISOString()} and ${maxDate.toISOString()}`);

    // Find coaches with incomplete profiles in the time window
    const { data: coaches, error: coachesError } = await supabase
      .from("coach_profiles")
      .select(`
        id,
        user_id,
        display_name,
        bio,
        card_image_url,
        coach_types,
        hourly_rate,
        location,
        online_available,
        in_person_available,
        created_at
      `)
      .eq("is_complete_profile", false)
      .eq("onboarding_completed", true)
      .gte("created_at", minDate.toISOString())
      .lte("created_at", maxDate.toISOString());

    if (coachesError) {
      console.error("[Profile Reminder] Error fetching coaches:", coachesError);
      throw coachesError;
    }

    console.log(`[Profile Reminder] Found ${coaches?.length || 0} incomplete profiles in time window`);

    if (!coaches || coaches.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No coaches to remind", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user IDs
    const userIds = coaches.map((c) => c.user_id);

    // Check which coaches have already received this email type
    const { data: existingEmails, error: emailsError } = await supabase
      .from("email_logs")
      .select("user_id")
      .eq("email_type", emailType)
      .in("user_id", userIds);

    if (emailsError) {
      console.error("[Profile Reminder] Error checking existing emails:", emailsError);
    }

    const alreadySentUserIds = new Set((existingEmails || []).map((e) => e.user_id));
    const coachesToEmail = coaches.filter((c) => !alreadySentUserIds.has(c.user_id));

    console.log(`[Profile Reminder] ${coachesToEmail.length} coaches haven't received ${emailType} yet`);

    if (coachesToEmail.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "All coaches already emailed", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profiles for email addresses
    const { data: userProfiles, error: usersError } = await supabase
      .from("user_profiles")
      .select("user_id, email, first_name")
      .in("user_id", coachesToEmail.map((c) => c.user_id));

    if (usersError) {
      console.error("[Profile Reminder] Error fetching user profiles:", usersError);
      throw usersError;
    }

    const userMap = new Map((userProfiles || []).map((u) => [u.user_id, u]));

    let sentCount = 0;
    const errors: string[] = [];

    // Send emails
    for (const coach of coachesToEmail) {
      const user = userMap.get(coach.user_id);
      
      if (!user?.email) {
        console.log(`[Profile Reminder] Skipping coach ${coach.id} - no email found`);
        continue;
      }

      const name = user.first_name || coach.display_name || "Coach";
      const percentage = getCompletionPercentage(coach);
      const missingItems = getMissingItems(coach);

      // Generate email based on type
      const subject = reminder_type === "24h"
        ? `You're ${percentage}% of the way there, ${name}! 🏋️`
        : `⚠️ ${name}, your profile isn't visible yet`;
      
      const html = reminder_type === "24h"
        ? generate24hEmailHtml(name, percentage, missingItems)
        : generate3dEmailHtml(name, percentage, missingItems);

      try {
        console.log(`[Profile Reminder] Sending ${emailType} to ${user.email}...`);
        
        // Send email via Resend API
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FitConnect <noreply@fitconnect.uk>",
            to: [user.email],
            subject,
            html,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || `Resend API error: ${emailResponse.status}`);
        }

        // Log the email
        await supabase.from("email_logs").insert({
          user_id: coach.user_id,
          email_type: emailType,
          recipient_email: user.email,
          subject,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        sentCount++;
        console.log(`[Profile Reminder] Sent ${emailType} to ${user.email}`);
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
        console.error(`[Profile Reminder] Failed to send to ${user.email}:`, errorMsg);
        errors.push(`${user.email}: ${errorMsg}`);
        
        // Log the failed attempt
        await supabase.from("email_logs").insert({
          user_id: coach.user_id,
          email_type: emailType,
          recipient_email: user.email,
          subject,
          status: "failed",
          error_message: errorMsg,
        });
      }
    }

    console.log(`[Profile Reminder] Completed. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} ${emailType} emails`,
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Profile Reminder] Error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
