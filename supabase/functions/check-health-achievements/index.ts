import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Filter to only health-related badges
    const healthBadgeTypes = [
      'steps_total', 'calories_total', 'active_minutes_total',
      'distance_total', 'sleep_hours_total', 'wearable_workout_count',
      'device_connected', 'devices_connected'
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

    // Get health data totals (excluding manual entries)
    const { data: healthTotals, error: healthError } = await supabase
      .from('health_data_sync')
      .select('data_type, value')
      .eq('client_id', clientId)
      .neq('source', 'manual');

    if (healthError) {
      console.error('[check-health-achievements] Error fetching health data:', healthError);
      throw healthError;
    }

    // Aggregate by data type
    const totals: Record<string, number> = {};
    for (const row of healthTotals || []) {
      totals[row.data_type] = (totals[row.data_type] || 0) + (row.value || 0);
    }

    console.log(`[check-health-achievements] Health data totals:`, totals);

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

          // Also add XP transaction
          await supabase.from('xp_transactions').insert({
            client_id: clientId,
            amount: badge.xp_reward,
            action: 'badge_earned',
            description: `Earned "${badge.name}" badge from wearable data`,
            metadata: { badge_id: badge.id, badge_name: badge.name },
          });

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
