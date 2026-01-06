import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority order for data sources - higher priority sources take precedence
// This prevents double-counting when users have multiple devices
const SOURCE_PRIORITY = ['apple_health', 'health_connect', 'fitbit', 'garmin', 'manual'];

interface HealthBadge {
  id: string;
  name: string;
  criteria: {
    type: string;
    value: number;
  };
  xp_reward: number;
}

interface AwardedBadge {
  badgeId: string;
  badgeName: string;
  wasAwarded: boolean;
  totalValue?: number;
  requiredValue?: number;
}

interface HealthDataRow {
  data_type: string;
  value: number;
  source: string;
  recorded_at: string;
}

// Deduplicate health data by date and type, taking highest priority source for each
const deduplicateHealthData = (healthData: HealthDataRow[]): Record<string, number> => {
  if (!healthData || healthData.length === 0) return {};

  // Group by data_type, then by date
  const byTypeAndDate = new Map<string, Map<string, HealthDataRow[]>>();
  
  for (const row of healthData) {
    if (!byTypeAndDate.has(row.data_type)) {
      byTypeAndDate.set(row.data_type, new Map());
    }
    const byDate = byTypeAndDate.get(row.data_type)!;
    const existing = byDate.get(row.recorded_at) || [];
    existing.push(row);
    byDate.set(row.recorded_at, existing);
  }

  // Calculate totals with deduplication
  const totals: Record<string, number> = {};
  
  for (const [dataType, byDate] of byTypeAndDate.entries()) {
    let total = 0;
    for (const entries of byDate.values()) {
      if (entries.length === 1) {
        total += entries[0].value || 0;
      } else {
        // Sort by priority (lower index = higher priority)
        entries.sort((a, b) => {
          const priorityA = SOURCE_PRIORITY.indexOf(a.source);
          const priorityB = SOURCE_PRIORITY.indexOf(b.source);
          return (priorityA === -1 ? 99 : priorityA) - (priorityB === -1 ? 99 : priorityB);
        });
        total += entries[0].value || 0;
      }
    }
    totals[dataType] = total;
  }

  return totals;
};

// Calculate streak for a data type (consecutive days meeting a minimum value)
const calculateStreak = (healthData: HealthDataRow[], dataType: string, minValue: number): number => {
  if (!healthData || healthData.length === 0) return 0;

  // Filter and deduplicate by date
  const byDate = new Map<string, HealthDataRow[]>();
  for (const row of healthData) {
    if (row.data_type !== dataType) continue;
    const existing = byDate.get(row.recorded_at) || [];
    existing.push(row);
    byDate.set(row.recorded_at, existing);
  }

  // Get dates that meet the minimum value (using highest priority source)
  const meetsDates = new Set<string>();
  for (const [date, entries] of byDate.entries()) {
    // Sort by priority
    entries.sort((a, b) => {
      const priorityA = SOURCE_PRIORITY.indexOf(a.source);
      const priorityB = SOURCE_PRIORITY.indexOf(b.source);
      return (priorityA === -1 ? 99 : priorityA) - (priorityB === -1 ? 99 : priorityB);
    });
    if (entries[0].value >= minValue) {
      meetsDates.add(date.split('T')[0]);
    }
  }

  if (meetsDates.size === 0) return 0;

  // Count consecutive days starting from today or yesterday
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  const todayStr = formatDate(currentDate);
  
  // Start from today if it's in the set
  currentDate.setDate(currentDate.getDate() - 1);
  const yesterdayStr = formatDate(currentDate);
  
  if (meetsDates.has(todayStr)) {
    streak = 1;
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (meetsDates.has(yesterdayStr)) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    return 0;
  }

  // Count consecutive previous days (up to 365)
  for (let i = 0; i < 365 && streak < 365; i++) {
    const checkDate = formatDate(currentDate);
    if (meetsDates.has(checkDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error('clientId is required');
    }

    console.log(`[check-health-achievements] Starting check for client: ${clientId}`);

    // Get all health-related badges
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('id, name, criteria, xp_reward')
      .eq('is_active', true)
      .in('category', ['fitness', 'wellness', 'tech']);

    if (badgeError) {
      console.error('[check-health-achievements] Error fetching badges:', badgeError);
      throw badgeError;
    }

    // Filter to only health-related badges (including streak badges)
    const healthBadgeTypes = [
      'steps_total', 'calories_total', 'active_minutes_total',
      'distance_total', 'sleep_hours_total', 'wearable_workout_count',
      'device_connected', 'devices_connected',
      // Streak badge types
      'steps_streak', 'calories_streak', 'active_minutes_streak', 'sleep_streak'
    ];

    const healthBadges = (badges || []).filter((b: HealthBadge) => 
      b.criteria && healthBadgeTypes.includes(b.criteria.type)
    ) as HealthBadge[];

    console.log(`[check-health-achievements] Found ${healthBadges.length} health-related badges to check`);

    // Get existing badges for this client
    const { data: existingBadges, error: existingError } = await supabase
      .from('client_badges')
      .select('badge_id')
      .eq('client_id', clientId);

    if (existingError) {
      console.error('[check-health-achievements] Error fetching existing badges:', existingError);
      throw existingError;
    }

    const existingBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || []);

    // Get health data (excluding manual entries) with source and date for deduplication
    // Fetch up to 1 year of data for streak calculations
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: healthData, error: healthError } = await supabase
      .from('health_data_sync')
      .select('data_type, value, source, recorded_at')
      .eq('client_id', clientId)
      .neq('source', 'manual')
      .gte('recorded_at', oneYearAgo.toISOString().split('T')[0]);

    if (healthError) {
      console.error('[check-health-achievements] Error fetching health data:', healthError);
      throw healthError;
    }

    // Deduplicate by date and type using priority system to prevent double-counting
    const totals = deduplicateHealthData(healthData as HealthDataRow[]);

    console.log(`[check-health-achievements] Health data totals:`, totals);

    // Calculate streaks for common metrics
    const streaks = {
      steps_5k: calculateStreak(healthData as HealthDataRow[], 'steps', 5000),
      steps_10k: calculateStreak(healthData as HealthDataRow[], 'steps', 10000),
      calories_300: calculateStreak(healthData as HealthDataRow[], 'calories', 300),
      calories_500: calculateStreak(healthData as HealthDataRow[], 'calories', 500),
      active_minutes_30: calculateStreak(healthData as HealthDataRow[], 'active_minutes', 30),
      active_minutes_60: calculateStreak(healthData as HealthDataRow[], 'active_minutes', 60),
      sleep_7h: calculateStreak(healthData as HealthDataRow[], 'sleep', 420), // 7 hours in minutes
      sleep_8h: calculateStreak(healthData as HealthDataRow[], 'sleep', 480), // 8 hours in minutes
    };

    console.log(`[check-health-achievements] Streaks:`, streaks);

    // Get wearable connections count
    const { data: connections, error: connError } = await supabase
      .from('wearable_connections')
      .select('id, provider')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (connError) {
      console.error('[check-health-achievements] Error fetching connections:', connError);
      throw connError;
    }

    const deviceCount = connections?.length || 0;
    const uniqueProviders = new Set(connections?.map(c => c.provider) || []).size;

    console.log(`[check-health-achievements] Connected devices: ${deviceCount}, unique providers: ${uniqueProviders}`);

    const results: AwardedBadge[] = [];

    for (const badge of healthBadges) {
      const criteriaType = badge.criteria.type;
      const requiredValue = badge.criteria.value;

      // Skip if already has this badge
      if (existingBadgeIds.has(badge.id)) {
        results.push({
          badgeId: badge.id,
          badgeName: badge.name,
          wasAwarded: false,
        });
        continue;
      }

      // Map criteria type to data type and get total
      let totalValue = 0;
      switch (criteriaType) {
        case 'steps_total':
          totalValue = totals['steps'] || 0;
          break;
        case 'calories_total':
          totalValue = totals['calories'] || 0;
          break;
        case 'active_minutes_total':
          totalValue = totals['active_minutes'] || 0;
          break;
        case 'distance_total':
          totalValue = totals['distance'] || 0;
          break;
        case 'sleep_hours_total':
          // Sleep is stored in minutes, convert to hours
          totalValue = (totals['sleep'] || 0) / 60;
          break;
        case 'wearable_workout_count':
          // Count workout entries
          const { count: workoutCount } = await supabase
            .from('health_data_sync')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)
            .eq('data_type', 'workout')
            .neq('source', 'manual');
          totalValue = workoutCount || 0;
          break;
        case 'device_connected':
          totalValue = deviceCount;
          break;
        case 'devices_connected':
          totalValue = uniqueProviders;
          break;
        // Streak-based badges
        case 'steps_streak':
          // Use the higher of 5k or 10k streaks based on required value
          totalValue = requiredValue >= 10000 ? streaks.steps_10k : streaks.steps_5k;
          break;
        case 'calories_streak':
          totalValue = requiredValue >= 500 ? streaks.calories_500 : streaks.calories_300;
          break;
        case 'active_minutes_streak':
          totalValue = requiredValue >= 60 ? streaks.active_minutes_60 : streaks.active_minutes_30;
          break;
        case 'sleep_streak':
          totalValue = requiredValue >= 480 ? streaks.sleep_8h : streaks.sleep_7h;
          break;
      }

      console.log(`[check-health-achievements] Badge "${badge.name}": current=${totalValue}, required=${requiredValue}`);

      // Check if criteria met
      if (totalValue >= requiredValue) {
        // Award the badge
        const { error: awardError } = await supabase
          .from('client_badges')
          .insert({
            client_id: clientId,
            badge_id: badge.id,
            source_data: {
              source: 'wearable_sync',
              total_value: totalValue,
              criteria_value: requiredValue,
              streaks: criteriaType.includes('streak') ? streaks : undefined,
            },
          });

        if (awardError) {
          // Might be duplicate, ignore
          console.log(`[check-health-achievements] Badge insert error (may be duplicate):`, awardError);
        } else {
          console.log(`[check-health-achievements] Awarded badge: ${badge.name}`);

          // Award XP - first get current XP then update
          const { data: currentXp } = await supabase
            .from('client_xp')
            .select('total_xp')
            .eq('client_id', clientId)
            .single();

          const { error: xpError } = await supabase
            .from('client_xp')
            .update({
              total_xp: (currentXp?.total_xp || 0) + badge.xp_reward,
              updated_at: new Date().toISOString(),
            })
            .eq('client_id', clientId);

          if (xpError) {
            console.log(`[check-health-achievements] XP update error:`, xpError);
          }

          // Also add XP transaction with correct schema
          const { error: txError } = await supabase.from('xp_transactions').insert({
            client_id: clientId,
            amount: badge.xp_reward,
            source: 'badge_earned',
            source_id: badge.id,
            description: `Earned "${badge.name}" badge from wearable data`,
          });
          
          if (txError) {
            console.log(`[check-health-achievements] XP transaction insert error:`, txError);
          }

          results.push({
            badgeId: badge.id,
            badgeName: badge.name,
            wasAwarded: true,
            totalValue,
            requiredValue,
          });
        }
      } else {
        results.push({
          badgeId: badge.id,
          badgeName: badge.name,
          wasAwarded: false,
          totalValue,
          requiredValue,
        });
      }
    }

    const awardedCount = results.filter(r => r.wasAwarded).length;
    console.log(`[check-health-achievements] Completed. Awarded ${awardedCount} badges`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        awarded: awardedCount,
        results: results.filter(r => r.wasAwarded),
        streaks,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[check-health-achievements] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
