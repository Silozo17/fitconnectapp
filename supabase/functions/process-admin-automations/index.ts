import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  target_audience: string;
  audience_filters: Record<string, any>;
  message_type: string;
  message_template: string;
  message_subject: string | null;
  cooldown_days: number | null;
  max_sends_per_user: number | null;
  priority: number;
}

interface UserData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name?: string | null; // For coaches
  email?: string;
  role: "client" | "coach";
  created_at: string;
  updated_at: string;
  metadata?: {
    old_tier?: string;
    new_tier?: string;
    boost_end_date?: string;
    review_count?: number;
    session_date?: string;
    client_name?: string;
    badge_name?: string;
    goal_title?: string;
    streak_count?: number;
    booking_count?: number;
    average_rating?: number;
  };
}

// Helper to parse display_name into first/last name for coaches
function parseDisplayName(displayName: string | null): { firstName: string; lastName: string } {
  if (!displayName) return { firstName: "there", lastName: "" };
  const parts = displayName.trim().split(" ");
  return {
    firstName: parts[0] || "there",
    lastName: parts.slice(1).join(" ") || ""
  };
}

// Helper to map coach profile data to UserData
function mapCoachToUser(coach: any, metadata?: UserData["metadata"]): UserData {
  const { firstName, lastName } = parseDisplayName(coach.display_name);
  return {
    id: coach.id,
    user_id: coach.user_id,
    first_name: firstName,
    last_name: lastName,
    display_name: coach.display_name,
    role: "coach" as const,
    created_at: coach.created_at,
    updated_at: coach.updated_at,
    metadata
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting admin automation processing...");

    // Fetch all enabled automation rules
    const { data: rules, error: rulesError } = await supabase
      .from("admin_automation_rules")
      .select("*")
      .eq("is_enabled", true)
      .order("priority", { ascending: false });

    if (rulesError) {
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    console.log(`Found ${rules?.length || 0} enabled automation rules`);

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
    };

    for (const rule of rules || []) {
      try {
        console.log(`Processing rule: ${rule.name} (trigger: ${rule.trigger_type})`);
        const users = await getUsersForTrigger(supabase, rule);
        console.log(`Rule "${rule.name}": Found ${users.length} potential users`);

        for (const user of users) {
          results.processed++;

          // Check cooldown
          if (rule.cooldown_days) {
            const cooldownDate = new Date();
            cooldownDate.setDate(cooldownDate.getDate() - rule.cooldown_days);

            const { data: recentLog } = await supabase
              .from("admin_automation_logs")
              .select("id")
              .eq("rule_id", rule.id)
              .eq("user_id", user.user_id)
              .gte("created_at", cooldownDate.toISOString())
              .limit(1)
              .single();

            if (recentLog) {
              console.log(`Skipping user ${user.user_id}: cooldown active`);
              await logAutomation(supabase, rule, user.user_id, "skipped", null, "Cooldown active");
              results.skipped++;
              continue;
            }
          }

          // Check max sends per user
          if (rule.max_sends_per_user) {
            const { count } = await supabase
              .from("admin_automation_logs")
              .select("id", { count: "exact", head: true })
              .eq("rule_id", rule.id)
              .eq("user_id", user.user_id)
              .eq("status", "sent");

            if ((count || 0) >= rule.max_sends_per_user) {
              console.log(`Skipping user ${user.user_id}: max sends reached`);
              await logAutomation(supabase, rule, user.user_id, "skipped", null, "Max sends reached");
              results.skipped++;
              continue;
            }
          }

          // Process message template
          const message = processTemplate(rule.message_template, user);

          // Parse message channels - handle both array and legacy string formats
          let channels: string[] = [];
          if (Array.isArray(rule.message_type)) {
            channels = rule.message_type;
          } else if (typeof rule.message_type === "string") {
            try {
              const parsed = JSON.parse(rule.message_type);
              channels = Array.isArray(parsed) ? parsed : [rule.message_type];
            } catch {
              // Legacy single value
              if (rule.message_type === "all") {
                channels = ["in_app", "email", "push"];
              } else {
                channels = [rule.message_type];
              }
            }
          }

          // Send message to each selected channel
          try {
            if (channels.includes("in_app")) {
              await sendInAppMessage(supabase, user.user_id, message, rule.name);
            }

            if (channels.includes("push")) {
              await sendPushNotification(supabaseUrl, supabaseServiceKey, user.user_id, rule.name, message);
            }

            if (channels.includes("email")) {
              // Email would go here if implemented
              console.log(`Email sending not yet implemented for user ${user.user_id}`);
            }

            await logAutomation(supabase, rule, user.user_id, "sent", message);
            results.sent++;
            console.log(`Sent automation to user ${user.user_id}`);
          } catch (sendError) {
            console.error(`Failed to send to user ${user.user_id}:`, sendError);
            await logAutomation(supabase, rule, user.user_id, "failed", message, String(sendError));
            results.failed++;
          }
        }
      } catch (ruleError) {
        console.error(`Error processing rule "${rule.name}":`, ruleError);
      }
    }

    console.log("Automation processing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin automation error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getUsersForTrigger(supabase: any, rule: AutomationRule): Promise<UserData[]> {
  const { trigger_type, trigger_config, target_audience } = rule;
  const now = new Date();
  let users: UserData[] = [];

  switch (trigger_type) {
    // ===== USER LIFECYCLE TRIGGERS =====
    case "user_signup_client": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .gte("created_at", thirtyMinAgo.toISOString())
        .or("status.is.null,status.eq.active");
      
      if (error) console.error(`[user_signup_client] Query error:`, error);
      users = (data || []).map((u: any) => ({ ...u, role: "client" as const }));
      console.log(`[user_signup_client] Found ${users.length} new clients`);
      break;
    }

    case "user_signup_coach": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, user_id, display_name, created_at, updated_at")
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[user_signup_coach] Query error:`, error);
      users = (data || []).map((c: any) => mapCoachToUser(c));
      console.log(`[user_signup_coach] Found ${users.length} new coaches`);
      break;
    }

    case "profile_complete": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      if (target_audience !== "coaches") {
        const { data: clients, error } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .eq("onboarding_completed", true)
          .gte("updated_at", thirtyMinAgo.toISOString());
        
        if (error) console.error(`[profile_complete] Client query error:`, error);
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }
      
      if (target_audience !== "clients") {
        const { data: coaches, error } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .eq("onboarding_completed", true)
          .gte("updated_at", thirtyMinAgo.toISOString());
        
        if (error) console.error(`[profile_complete] Coach query error:`, error);
        users.push(...(coaches || []).map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[profile_complete] Found ${users.length} users`);
      break;
    }

    case "account_anniversary": {
      const today = now.toISOString().slice(5, 10); // "MM-DD" format
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (target_audience !== "coaches") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .lte("created_at", oneYearAgo.toISOString());
        
        // Filter for anniversaries (same MM-DD as today)
        const anniversaryClients = (clients || []).filter((c: any) => {
          const createdDate = c.created_at.slice(5, 10);
          return createdDate === today;
        });
        users.push(...anniversaryClients.map((u: any) => ({ ...u, role: "client" as const })));
      }
      
      if (target_audience !== "clients") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .lte("created_at", oneYearAgo.toISOString());
        
        const anniversaryCoaches = (coaches || []).filter((c: any) => {
          const createdDate = c.created_at.slice(5, 10);
          return createdDate === today;
        });
        users.push(...anniversaryCoaches.map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[account_anniversary] Found ${users.length} users with anniversary today`);
      break;
    }

    // ===== ENGAGEMENT TRIGGERS =====
    case "inactive_days": {
      const days = trigger_config?.days || 7;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);

      if (target_audience === "clients" || target_audience === "all") {
        const { data: clients, error } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .lte("updated_at", rangeEnd.toISOString())
          .gte("updated_at", targetDate.toISOString())
          .or("status.is.null,status.eq.active");
        
        if (error) console.error(`[inactive_days] Client query error:`, error);
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }

      if (target_audience === "coaches" || target_audience === "all") {
        const { data: coaches, error } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .lte("updated_at", rangeEnd.toISOString())
          .gte("updated_at", targetDate.toISOString());
        
        if (error) console.error(`[inactive_days] Coach query error:`, error);
        users.push(...(coaches || []).map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[inactive_days] Found ${users.length} inactive users after ${days} days`);
      break;
    }

    case "no_bookings_days": {
      const days = trigger_config?.days || 30;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .or("status.is.null,status.eq.active");

      for (const client of clients || []) {
        const { data: bookings } = await supabase
          .from("coaching_sessions")
          .select("id")
          .eq("client_id", client.id)
          .gte("created_at", cutoffDate.toISOString())
          .limit(1);

        if (!bookings || bookings.length === 0) {
          users.push({ ...client, role: "client" as const });
        }
      }
      console.log(`[no_bookings_days] Found ${users.length} clients with no bookings in ${days} days`);
      break;
    }

    case "first_booking": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: sessions } = await supabase
        .from("coaching_sessions")
        .select(`
          client_id,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      for (const session of sessions || []) {
        const { count } = await supabase
          .from("coaching_sessions")
          .select("id", { count: "exact", head: true })
          .eq("client_id", session.client_id);
        
        if (count === 1) {
          users.push({
            id: session.client_profiles.id,
            user_id: session.client_profiles.user_id,
            first_name: session.client_profiles.first_name,
            last_name: session.client_profiles.last_name,
            role: "client" as const,
            created_at: session.client_profiles.created_at,
            updated_at: session.client_profiles.updated_at,
            metadata: { booking_count: 1 }
          });
        }
      }
      console.log(`[first_booking] Found ${users.length} clients with first booking`);
      break;
    }

    case "booking_milestone": {
      const threshold = trigger_config?.threshold || 10;
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const { data: sessions } = await supabase
        .from("coaching_sessions")
        .select(`
          client_id,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      const processedClients = new Set<string>();
      for (const session of sessions || []) {
        if (processedClients.has(session.client_id)) continue;
        processedClients.add(session.client_id);
        
        const { count } = await supabase
          .from("coaching_sessions")
          .select("id", { count: "exact", head: true })
          .eq("client_id", session.client_id);
        
        if (count === threshold) {
          users.push({
            id: session.client_profiles.id,
            user_id: session.client_profiles.user_id,
            first_name: session.client_profiles.first_name,
            last_name: session.client_profiles.last_name,
            role: "client" as const,
            created_at: session.client_profiles.created_at,
            updated_at: session.client_profiles.updated_at,
            metadata: { booking_count: count }
          });
        }
      }
      console.log(`[booking_milestone] Found ${users.length} clients reaching ${threshold} bookings`);
      break;
    }

    case "badge_earned": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: badges } = await supabase
        .from("client_badges")
        .select(`
          client_id,
          badges!inner(name),
          client_profiles:client_id(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .gte("earned_at", thirtyMinAgo.toISOString());
      
      for (const badge of badges || []) {
        if (badge.client_profiles) {
          users.push({
            id: badge.client_profiles.id,
            user_id: badge.client_profiles.user_id,
            first_name: badge.client_profiles.first_name,
            last_name: badge.client_profiles.last_name,
            role: "client" as const,
            created_at: badge.client_profiles.created_at,
            updated_at: badge.client_profiles.updated_at,
            metadata: { badge_name: badge.badges?.name }
          });
        }
      }
      console.log(`[badge_earned] Found ${users.length} users who earned badges`);
      break;
    }

    case "streak_milestone": {
      const threshold = trigger_config?.threshold || 7;
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const { data: streaks } = await supabase
        .from("habit_streaks")
        .select(`
          client_id,
          current_streak,
          client_profiles:client_id(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("current_streak", threshold)
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      for (const streak of streaks || []) {
        if (streak.client_profiles) {
          users.push({
            id: streak.client_profiles.id,
            user_id: streak.client_profiles.user_id,
            first_name: streak.client_profiles.first_name,
            last_name: streak.client_profiles.last_name,
            role: "client" as const,
            created_at: streak.client_profiles.created_at,
            updated_at: streak.client_profiles.updated_at,
            metadata: { streak_count: threshold }
          });
        }
      }
      console.log(`[streak_milestone] Found ${users.length} users reaching ${threshold} day streak`);
      break;
    }

    case "goal_completed": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: goals } = await supabase
        .from("client_goals")
        .select(`
          client_id,
          title,
          client_profiles:client_id(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("status", "completed")
        .gte("completed_at", thirtyMinAgo.toISOString());
      
      for (const goal of goals || []) {
        if (goal.client_profiles) {
          users.push({
            id: goal.client_profiles.id,
            user_id: goal.client_profiles.user_id,
            first_name: goal.client_profiles.first_name,
            last_name: goal.client_profiles.last_name,
            role: "client" as const,
            created_at: goal.client_profiles.created_at,
            updated_at: goal.client_profiles.updated_at,
            metadata: { goal_title: goal.title }
          });
        }
      }
      console.log(`[goal_completed] Found ${users.length} users who completed goals`);
      break;
    }

    // ===== COACH TRIGGERS =====
    case "coach_verified": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, user_id, display_name, created_at, updated_at")
        .eq("is_verified", true)
        .gte("verified_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[coach_verified] Query error:`, error);
      users = (data || []).map((c: any) => mapCoachToUser(c));
      console.log(`[coach_verified] Found ${users.length} newly verified coaches`);
      break;
    }

    case "onboarding_incomplete": {
      const days = trigger_config?.days || 2;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);

      if (target_audience === "clients" || target_audience === "all") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .eq("onboarding_completed", false)
          .lte("created_at", rangeEnd.toISOString())
          .gte("created_at", targetDate.toISOString());
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }

      if (target_audience === "coaches" || target_audience === "all") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .eq("onboarding_completed", false)
          .lte("created_at", rangeEnd.toISOString())
          .gte("created_at", targetDate.toISOString());
        users.push(...(coaches || []).map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[onboarding_incomplete] Found ${users.length} users with incomplete onboarding`);
      break;
    }

    case "coach_first_client": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: connections } = await supabase
        .from("coach_client_connections")
        .select(`
          coach_id,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "active")
        .gte("created_at", thirtyMinAgo.toISOString());
      
      for (const conn of connections || []) {
        const { count } = await supabase
          .from("coach_client_connections")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", conn.coach_id)
          .eq("status", "active");
        
        if (count === 1) {
          users.push(mapCoachToUser(conn.coach_profiles));
        }
      }
      console.log(`[coach_first_client] Found ${users.length} coaches with first client`);
      break;
    }

    case "coach_first_booking": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: sessions } = await supabase
        .from("coaching_sessions")
        .select(`
          coach_id,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      for (const session of sessions || []) {
        const { count } = await supabase
          .from("coaching_sessions")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", session.coach_id);
        
        if (count === 1) {
          users.push(mapCoachToUser(session.coach_profiles));
        }
      }
      console.log(`[coach_first_booking] Found ${users.length} coaches with first booking`);
      break;
    }

    case "coach_low_rating": {
      const threshold = trigger_config?.threshold || 3.0;
      
      // Get coaches with recent reviews
      const { data: coaches } = await supabase
        .from("coach_profiles")
        .select("id, user_id, display_name, created_at, updated_at")
        .eq("status", "active");
      
      for (const coach of coaches || []) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("coach_id", coach.id);
        
        if (reviews && reviews.length >= 3) {
          const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
          if (avgRating < threshold) {
            users.push(mapCoachToUser(coach, { average_rating: avgRating }));
          }
        }
      }
      console.log(`[coach_low_rating] Found ${users.length} coaches with rating below ${threshold}`);
      break;
    }

    // ===== SUBSCRIPTION TRIGGERS =====
    case "coach_subscription_upgraded": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "active")
        .gte("updated_at", thirtyMinAgo.toISOString())
        .in("tier", ["starter", "pro", "enterprise", "founder"]);
      
      if (error) console.error(`[coach_subscription_upgraded] Query error:`, error);
      users = (data || []).map((s: any) => mapCoachToUser(s.coach_profiles, { new_tier: s.tier }));
      console.log(`[coach_subscription_upgraded] Found ${users.length} coaches who upgraded`);
      break;
    }

    case "coach_subscription_downgraded": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          pending_tier,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .not("pending_tier", "is", null)
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[coach_subscription_downgraded] Query error:`, error);
      users = (data || []).map((s: any) => mapCoachToUser(s.coach_profiles, { 
        old_tier: s.tier, 
        new_tier: s.pending_tier 
      }));
      console.log(`[coach_subscription_downgraded] Found ${users.length} coaches who downgraded`);
      break;
    }

    case "subscription_expiring": {
      const days = trigger_config?.days || 7;
      const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const rangeStart = new Date(targetDate.getTime() - 30 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);
      
      const { data } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          current_period_end,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "active")
        .eq("cancel_at_period_end", true)
        .gte("current_period_end", rangeStart.toISOString())
        .lte("current_period_end", rangeEnd.toISOString());
      
      users = (data || []).map((s: any) => mapCoachToUser(s.coach_profiles, { new_tier: s.tier }));
      console.log(`[subscription_expiring] Found ${users.length} coaches with expiring subscriptions`);
      break;
    }

    case "subscription_cancelled": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "cancelled")
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      users = (data || []).map((s: any) => mapCoachToUser(s.coach_profiles, { old_tier: s.tier }));
      console.log(`[subscription_cancelled] Found ${users.length} coaches who cancelled`);
      break;
    }

    case "payment_failed": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "past_due")
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      users = (data || []).map((s: any) => mapCoachToUser(s.coach_profiles, { new_tier: s.tier }));
      console.log(`[payment_failed] Found ${users.length} coaches with failed payments`);
      break;
    }

    case "subscription_anniversary": {
      const today = now.toISOString().slice(5, 10);
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { data } = await supabase
        .from("platform_subscriptions")
        .select(`
          coach_id,
          tier,
          created_at,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("status", "active")
        .lte("created_at", oneYearAgo.toISOString());
      
      const anniversaryCoaches = (data || []).filter((s: any) => {
        const createdDate = s.created_at.slice(5, 10);
        return createdDate === today;
      });
      
      users = anniversaryCoaches.map((s: any) => mapCoachToUser(s.coach_profiles, { new_tier: s.tier }));
      console.log(`[subscription_anniversary] Found ${users.length} coaches with subscription anniversary`);
      break;
    }

    // ===== BOOST TRIGGERS =====
    case "coach_boost_activated": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("coach_boosts")
        .select(`
          coach_id,
          boost_end_date,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("is_active", true)
        .eq("payment_status", "succeeded")
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[coach_boost_activated] Query error:`, error);
      users = (data || []).map((b: any) => mapCoachToUser(b.coach_profiles, { 
        boost_end_date: b.boost_end_date 
      }));
      console.log(`[coach_boost_activated] Found ${users.length} coaches who activated boost`);
      break;
    }

    case "coach_boost_expiring": {
      const days = trigger_config?.days || 3;
      const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const rangeStart = new Date(targetDate.getTime() - 30 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);
      
      const { data, error } = await supabase
        .from("coach_boosts")
        .select(`
          coach_id,
          boost_end_date,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .eq("is_active", true)
        .gte("boost_end_date", rangeStart.toISOString())
        .lte("boost_end_date", rangeEnd.toISOString());
      
      if (error) console.error(`[coach_boost_expiring] Query error:`, error);
      users = (data || []).map((b: any) => mapCoachToUser(b.coach_profiles, { 
        boost_end_date: b.boost_end_date 
      }));
      console.log(`[coach_boost_expiring] Found ${users.length} coaches with expiring boost`);
      break;
    }

    // ===== REVIEW TRIGGERS =====
    case "first_review_received": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(`
          coach_id,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[first_review_received] Query error:`, error);
      
      for (const review of reviewsData || []) {
        const { count } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", review.coach_id);
        
        if (count === 1) {
          users.push(mapCoachToUser(review.coach_profiles, { review_count: 1 }));
        }
      }
      console.log(`[first_review_received] Found ${users.length} coaches with first review`);
      break;
    }

    case "review_milestone": {
      const threshold = trigger_config?.threshold || 10;
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(`
          coach_id,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[review_milestone] Query error:`, error);
      
      const processedCoaches = new Set<string>();
      for (const review of reviewsData || []) {
        if (processedCoaches.has(review.coach_id)) continue;
        processedCoaches.add(review.coach_id);
        
        const { count } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", review.coach_id);
        
        if (count === threshold) {
          users.push(mapCoachToUser(review.coach_profiles, { review_count: count }));
        }
      }
      console.log(`[review_milestone] Found ${users.length} coaches reaching ${threshold} reviews`);
      break;
    }

    // ===== SESSION TRIGGERS =====
    case "session_completed": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          client_id,
          scheduled_at,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("status", "completed")
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[session_completed] Query error:`, error);
      users = (data || []).map((s: any) => ({
        id: s.client_profiles.id,
        user_id: s.client_profiles.user_id,
        first_name: s.client_profiles.first_name,
        last_name: s.client_profiles.last_name,
        role: "client" as const,
        created_at: s.client_profiles.created_at,
        updated_at: s.client_profiles.updated_at,
        metadata: { session_date: s.scheduled_at }
      }));
      console.log(`[session_completed] Found ${users.length} completed sessions`);
      break;
    }

    case "session_cancelled": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          client_id,
          scheduled_at,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("status", "cancelled")
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[session_cancelled] Query error:`, error);
      users = (data || []).map((s: any) => ({
        id: s.client_profiles.id,
        user_id: s.client_profiles.user_id,
        first_name: s.client_profiles.first_name,
        last_name: s.client_profiles.last_name,
        role: "client" as const,
        created_at: s.client_profiles.created_at,
        updated_at: s.client_profiles.updated_at,
        metadata: { session_date: s.scheduled_at }
      }));
      console.log(`[session_cancelled] Found ${users.length} cancelled sessions`);
      break;
    }

    // ===== CLIENT-COACH SUBSCRIPTION TRIGGERS =====
    case "client_subscribed_to_coach": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("client_subscriptions")
        .select(`
          client_id,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("status", "active")
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[client_subscribed_to_coach] Query error:`, error);
      users = (data || []).map((s: any) => ({
        id: s.client_profiles.id,
        user_id: s.client_profiles.user_id,
        first_name: s.client_profiles.first_name,
        last_name: s.client_profiles.last_name,
        role: "client" as const,
        created_at: s.client_profiles.created_at,
        updated_at: s.client_profiles.updated_at,
      }));
      console.log(`[client_subscribed_to_coach] Found ${users.length} new client subscriptions`);
      break;
    }

    case "client_cancelled_coach_sub": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data, error } = await supabase
        .from("client_subscriptions")
        .select(`
          client_id,
          client_profiles!inner(id, user_id, first_name, last_name, created_at, updated_at)
        `)
        .eq("status", "cancelled")
        .gte("updated_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[client_cancelled_coach_sub] Query error:`, error);
      users = (data || []).map((s: any) => ({
        id: s.client_profiles.id,
        user_id: s.client_profiles.user_id,
        first_name: s.client_profiles.first_name,
        last_name: s.client_profiles.last_name,
        role: "client" as const,
        created_at: s.client_profiles.created_at,
        updated_at: s.client_profiles.updated_at,
      }));
      console.log(`[client_cancelled_coach_sub] Found ${users.length} cancelled client subscriptions`);
      break;
    }

    // ===== SERVICE TRIGGERS =====
    case "first_service_created": {
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data: services, error } = await supabase
        .from("session_types")
        .select(`
          coach_id,
          coach_profiles!inner(id, user_id, display_name, created_at, updated_at)
        `)
        .gte("created_at", thirtyMinAgo.toISOString());
      
      if (error) console.error(`[first_service_created] Query error:`, error);
      
      for (const service of services || []) {
        const { count } = await supabase
          .from("session_types")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", service.coach_id);
        
        if (count === 1) {
          users.push(mapCoachToUser(service.coach_profiles));
        }
      }
      console.log(`[first_service_created] Found ${users.length} coaches with first service`);
      break;
    }

    case "coach_profile_incomplete": {
      const days = trigger_config?.days || 3;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);
      
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, user_id, display_name, created_at, updated_at, bio, profile_image_url")
        .lte("created_at", rangeEnd.toISOString())
        .gte("created_at", targetDate.toISOString());
      
      if (error) console.error(`[coach_profile_incomplete] Query error:`, error);
      
      users = (data || [])
        .filter((c: any) => !c.bio || !c.profile_image_url)
        .map((c: any) => mapCoachToUser(c));
      console.log(`[coach_profile_incomplete] Found ${users.length} coaches with incomplete profiles`);
      break;
    }

    case "no_availability_set": {
      const days = trigger_config?.days || 3;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);
      
      const { data: coaches, error } = await supabase
        .from("coach_profiles")
        .select("id, user_id, display_name, created_at, updated_at")
        .lte("created_at", rangeEnd.toISOString())
        .gte("created_at", targetDate.toISOString());
      
      if (error) console.error(`[no_availability_set] Query error:`, error);
      
      for (const coach of coaches || []) {
        const { count } = await supabase
          .from("coach_availability")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", coach.id);
        
        if (!count || count === 0) {
          users.push(mapCoachToUser(coach));
        }
      }
      console.log(`[no_availability_set] Found ${users.length} coaches without availability`);
      break;
    }

    // ===== SCHEDULED TRIGGERS =====
    case "weekly_motivation": {
      // This trigger runs for all active users on a specific day
      const dayOfWeek = trigger_config?.day_of_week || 1; // Default Monday
      if (now.getDay() !== dayOfWeek) {
        console.log(`[weekly_motivation] Not the configured day (${dayOfWeek}), skipping`);
        break;
      }
      
      if (target_audience !== "coaches") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .or("status.is.null,status.eq.active");
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }
      
      if (target_audience !== "clients") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .eq("status", "active");
        users.push(...(coaches || []).map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[weekly_motivation] Found ${users.length} users for weekly motivation`);
      break;
    }

    case "monthly_summary": {
      // This trigger runs on a specific day of month
      const dayOfMonth = trigger_config?.day_of_month || 1;
      if (now.getDate() !== dayOfMonth) {
        console.log(`[monthly_summary] Not the configured day (${dayOfMonth}), skipping`);
        break;
      }
      
      if (target_audience !== "coaches") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .or("status.is.null,status.eq.active");
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }
      
      if (target_audience !== "clients") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, created_at, updated_at")
          .eq("status", "active");
        users.push(...(coaches || []).map((c: any) => mapCoachToUser(c)));
      }
      console.log(`[monthly_summary] Found ${users.length} users for monthly summary`);
      break;
    }

    default:
      console.log(`Trigger type "${trigger_type}" not implemented yet`);
  }

  return users;
}

function processTemplate(template: string, user: UserData): string {
  const now = new Date();
  const createdAt = new Date(user.created_at);
  const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
  const updatedAt = new Date(user.updated_at);
  const inactiveDays = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000));

  // Format boost end date if present
  let boostEndDateFormatted = "";
  if (user.metadata?.boost_end_date) {
    boostEndDateFormatted = new Date(user.metadata.boost_end_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  // Format session date if present
  let sessionDateFormatted = "";
  if (user.metadata?.session_date) {
    sessionDateFormatted = new Date(user.metadata.session_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  return template
    .replace(/{first_name}/g, user.first_name || "there")
    .replace(/{last_name}/g, user.last_name || "")
    .replace(/{role}/g, user.role)
    .replace(/{account_age_days}/g, String(accountAgeDays))
    .replace(/{days_inactive}/g, String(inactiveDays))
    .replace(/{old_tier}/g, user.metadata?.old_tier || "")
    .replace(/{new_tier}/g, user.metadata?.new_tier || "")
    .replace(/{boost_end_date}/g, boostEndDateFormatted)
    .replace(/{review_count}/g, String(user.metadata?.review_count || 0))
    .replace(/{session_date}/g, sessionDateFormatted)
    .replace(/{client_name}/g, user.metadata?.client_name || "")
    .replace(/{badge_name}/g, user.metadata?.badge_name || "")
    .replace(/{goal_title}/g, user.metadata?.goal_title || "")
    .replace(/{streak_count}/g, String(user.metadata?.streak_count || 0))
    .replace(/{booking_count}/g, String(user.metadata?.booking_count || 0))
    .replace(/{average_rating}/g, String(user.metadata?.average_rating?.toFixed(1) || "0.0"));
}

async function sendInAppMessage(
  supabase: any,
  userId: string,
  message: string,
  automationName: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "automation",
    title: "FitConnect",
    message: message,
    metadata: { automation_name: automationName },
  });
}

async function sendPushNotification(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  title: string,
  message: string
) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        userIds: [userId],
        title: "FitConnect",
        message: message,
        useExternalUserIds: true,
      }),
    });
  } catch (error) {
    console.error("Push notification error:", error);
  }
}

async function logAutomation(
  supabase: any,
  rule: AutomationRule,
  userId: string,
  status: "sent" | "failed" | "skipped",
  messageContent: string | null,
  errorMessage?: string
) {
  await supabase.from("admin_automation_logs").insert({
    rule_id: rule.id,
    user_id: userId,
    trigger_type: rule.trigger_type,
    message_type: rule.message_type,
    message_content: messageContent,
    status,
    error_message: errorMessage || null,
  });
}
