import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Gym Process Reminders - Cron Job
 * 
 * Processes various automated reminders:
 * 1. Class reminders (24 hours before)
 * 2. Payment due reminders (3 days before due date)
 * 3. Membership expiry warnings (7 days before)
 * 4. Inactive member re-engagement (no check-in for 14 days)
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "https://fitconnect.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { colors } = EMAIL_CONFIG;

    const now = new Date();
    const results = {
      classReminders: 0,
      membershipWarnings: 0,
      inactiveReminders: 0,
      errors: 0,
    };

    console.log("[gym-process-reminders] Starting reminder processing...");

    // 1. Class Reminders - Send 24 hours before class
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setMinutes(0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setMinutes(59, 59, 999);

    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from("gym_class_bookings")
      .select(`
        id,
        member_id,
        class_id,
        reminder_sent,
        gym_classes (
          id,
          start_time,
          end_time,
          gym_class_types (name),
          gym_locations (name),
          gym_profiles (name, slug)
        ),
        gym_members (
          first_name,
          email,
          user_id
        )
      `)
      .eq("status", "confirmed")
      .eq("reminder_sent", false)
      .gte("gym_classes.start_time", now.toISOString())
      .lte("gym_classes.start_time", tomorrowEnd.toISOString());

    if (bookingsError) {
      console.error("[gym-process-reminders] Error fetching bookings:", bookingsError);
    } else if (upcomingBookings && upcomingBookings.length > 0) {
      console.log(`[gym-process-reminders] Found ${upcomingBookings.length} class reminders to send`);

      for (const booking of upcomingBookings) {
        try {
          const gymClass = booking.gym_classes as any;
          const member = booking.gym_members as any;
          
          if (!member?.email || !gymClass) continue;

          const classTime = new Date(gymClass.start_time);
          const formattedTime = classTime.toLocaleString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          });

          const emailContent = `
            <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
              Class Reminder 🏋️
            </h2>
            
            <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
              Hi ${member.first_name || 'there'}! Just a reminder that you have a class coming up.
            </p>
            
            <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: ${colors.primary}; margin: 0 0 8px 0;">${gymClass.gym_class_types?.name || 'Class'}</h3>
              <p style="color: ${colors.textMuted}; margin: 0;">
                📅 ${formattedTime}<br/>
                📍 ${gymClass.gym_locations?.name || 'Main location'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              ${ctaButton("View Schedule", `${siteUrl}/gyms/${gymClass.gym_profiles?.slug}/portal`)}
            </div>
            
            <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
              Can't make it? Please cancel your booking so someone else can take your spot.
            </p>
          `;

          const html = baseEmailTemplate(emailContent, "Class Reminder");

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${gymClass.gym_profiles?.name || 'FitConnect'} <support@getfitconnect.co.uk>`,
              to: [member.email],
              subject: `Reminder: ${gymClass.gym_class_types?.name || 'Class'} tomorrow`,
              html,
            }),
          });

          // Mark reminder as sent
          await supabase
            .from("gym_class_bookings")
            .update({ reminder_sent: true })
            .eq("id", booking.id);

          results.classReminders++;
        } catch (err) {
          console.error("[gym-process-reminders] Error sending class reminder:", err);
          results.errors++;
        }
      }
    }

    // 2. Membership Expiry Warnings - 7 days before
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStart = new Date(sevenDaysFromNow);
    sevenDaysStart.setHours(0, 0, 0, 0);
    const sevenDaysEnd = new Date(sevenDaysFromNow);
    sevenDaysEnd.setHours(23, 59, 59, 999);

    const { data: expiringMemberships, error: expireError } = await supabase
      .from("gym_memberships")
      .select(`
        id,
        end_date,
        expiry_warning_sent,
        gym_members (
          first_name,
          email
        ),
        membership_plans (name),
        gym_profiles (name, slug)
      `)
      .eq("status", "active")
      .eq("expiry_warning_sent", false)
      .gte("end_date", sevenDaysStart.toISOString())
      .lte("end_date", sevenDaysEnd.toISOString());

    if (expireError) {
      console.error("[gym-process-reminders] Error fetching expiring memberships:", expireError);
    } else if (expiringMemberships && expiringMemberships.length > 0) {
      console.log(`[gym-process-reminders] Found ${expiringMemberships.length} membership warnings to send`);

      for (const membership of expiringMemberships) {
        try {
          const member = membership.gym_members as any;
          const plan = membership.membership_plans as any;
          const gym = membership.gym_profiles as any;
          
          if (!member?.email) continue;

          const expiryDate = new Date(membership.end_date);
          const formattedDate = expiryDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          const emailContent = `
            <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
              Membership Expiring Soon ⏰
            </h2>
            
            <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
              Hi ${member.first_name || 'there'}! Your ${plan?.name || 'membership'} at ${gym?.name || 'the gym'} will expire on <strong>${formattedDate}</strong>.
            </p>
            
            <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
              Renew now to continue enjoying all the benefits and keep your progress going!
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              ${ctaButton("Renew Membership", `${siteUrl}/gyms/${gym?.slug}/portal`)}
            </div>
          `;

          const html = baseEmailTemplate(emailContent, "Membership Expiring Soon");

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${gym?.name || 'FitConnect'} <support@getfitconnect.co.uk>`,
              to: [member.email],
              subject: `Your ${plan?.name || 'membership'} expires in 7 days`,
              html,
            }),
          });

          // Mark warning as sent
          await supabase
            .from("gym_memberships")
            .update({ expiry_warning_sent: true })
            .eq("id", membership.id);

          results.membershipWarnings++;
        } catch (err) {
          console.error("[gym-process-reminders] Error sending expiry warning:", err);
          results.errors++;
        }
      }
    }

    // 3. Inactive Member Re-engagement - No check-in for 14+ days
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: inactiveMembers, error: inactiveError } = await supabase
      .from("gym_members")
      .select(`
        id,
        first_name,
        email,
        last_check_in,
        inactive_reminder_sent_at,
        gym_profiles (name, slug)
      `)
      .eq("status", "active")
      .lt("last_check_in", fourteenDaysAgo.toISOString())
      .or(`inactive_reminder_sent_at.is.null,inactive_reminder_sent_at.lt.${fourteenDaysAgo.toISOString()}`);

    if (inactiveError) {
      console.error("[gym-process-reminders] Error fetching inactive members:", inactiveError);
    } else if (inactiveMembers && inactiveMembers.length > 0) {
      console.log(`[gym-process-reminders] Found ${inactiveMembers.length} inactive members to remind`);

      for (const member of inactiveMembers) {
        try {
          if (!member.email) continue;
          const gym = member.gym_profiles as any;

          const daysSinceCheckIn = Math.floor(
            (now.getTime() - new Date(member.last_check_in).getTime()) / (1000 * 60 * 60 * 24)
          );

          const emailContent = `
            <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
              We Miss You! 💪
            </h2>
            
            <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
              Hi ${member.first_name || 'there'}! It's been ${daysSinceCheckIn} days since we last saw you at ${gym?.name || 'the gym'}.
            </p>
            
            <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
              We know life gets busy, but your fitness goals are waiting for you. Come back and pick up where you left off!
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              ${ctaButton("View This Week's Classes", `${siteUrl}/gyms/${gym?.slug}/portal`)}
            </div>
            
            <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
              Need help getting back on track? Our team is here to support you.
            </p>
          `;

          const html = baseEmailTemplate(emailContent, "We Miss You!");

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${gym?.name || 'FitConnect'} <support@getfitconnect.co.uk>`,
              to: [member.email],
              subject: `${member.first_name || 'Hey'}, we miss you at ${gym?.name || 'the gym'}!`,
              html,
            }),
          });

          // Update reminder sent timestamp
          await supabase
            .from("gym_members")
            .update({ inactive_reminder_sent_at: now.toISOString() })
            .eq("id", member.id);

          results.inactiveReminders++;
        } catch (err) {
          console.error("[gym-process-reminders] Error sending inactive reminder:", err);
          results.errors++;
        }
      }
    }

    console.log(`[gym-process-reminders] Completed:`, results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[gym-process-reminders] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
