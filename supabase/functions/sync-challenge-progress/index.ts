import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority order for data sources - higher priority sources take precedence
// This prevents double-counting when users have multiple devices
const SOURCE_PRIORITY = ['apple_health', 'health_connect', 'fitbit', 'garmin', 'manual'];

interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  client_id: string;
  current_progress: number;
  verified_progress: number | null;
  status: string;
}

interface Challenge {
  id: string;
  wearable_data_type: string | null;
  target_value: number;
  start_date: string;
  end_date: string;
  requires_verification: boolean;
  data_source: string | null;
}

interface HealthDataRow {
  value: number;
  source: string;
  recorded_at: string;
}

// Deduplicate health data by date, taking highest priority source for each date
const deduplicateByDateAndPriority = (healthData: HealthDataRow[]): number => {
  if (!healthData || healthData.length === 0) return 0;

  // Group by date
  const byDate = new Map<string, HealthDataRow[]>();
  for (const row of healthData) {
    const existing = byDate.get(row.recorded_at) || [];
    existing.push(row);
    byDate.set(row.recorded_at, existing);
  }

  // For each date, take only the highest priority source's value
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

  return total;
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

    console.log(`[sync-challenge-progress] Starting sync for client: ${clientId}`);

    // Get all active challenge participations for this client
    const { data: participations, error: partError } = await supabase
      .from('challenge_participants')
      .select(`
        id,
        challenge_id,
        client_id,
        current_progress,
        verified_progress,
        status,
        challenges:challenge_id (
          id,
          wearable_data_type,
          target_value,
          start_date,
          end_date,
          requires_verification,
          data_source
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'active');

    if (partError) {
      console.error('[sync-challenge-progress] Error fetching participations:', partError);
      throw partError;
    }

    if (!participations || participations.length === 0) {
      console.log('[sync-challenge-progress] No active challenge participations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No active challenges', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-challenge-progress] Found ${participations.length} active participations`);

    const results: { challengeId: string; previousProgress: number; newProgress: number; completed: boolean }[] = [];

    for (const participation of participations) {
      const challenge = participation.challenges as unknown as Challenge;
      
      if (!challenge || !challenge.wearable_data_type || challenge.data_source !== 'wearable') {
        console.log(`[sync-challenge-progress] Skipping challenge ${challenge?.id} - not wearable-based`);
        continue;
      }

      // Get wearable data for this challenge period (excluding manual entries)
      // We need source and recorded_at for deduplication
      const { data: healthData, error: healthError } = await supabase
        .from('health_data_sync')
        .select('value, source, recorded_at')
        .eq('client_id', clientId)
        .eq('data_type', challenge.wearable_data_type)
        .neq('source', 'manual')
        .gte('recorded_at', challenge.start_date)
        .lte('recorded_at', challenge.end_date);

      if (healthError) {
        console.error(`[sync-challenge-progress] Error fetching health data for challenge ${challenge.id}:`, healthError);
        continue;
      }

      // Deduplicate by date using priority system to prevent double-counting from multiple devices
      const totalProgress = deduplicateByDateAndPriority(healthData as HealthDataRow[]);
      const isCompleted = totalProgress >= challenge.target_value;

      console.log(`[sync-challenge-progress] Challenge ${challenge.id}: wearable total = ${totalProgress}, target = ${challenge.target_value}, completed = ${isCompleted}`);

      // Update challenge participant
      const updateData: Record<string, unknown> = {
        verified_progress: Math.floor(totalProgress),
        current_progress: challenge.requires_verification 
          ? Math.floor(totalProgress) 
          : Math.max(participation.current_progress, Math.floor(totalProgress)),
        last_wearable_sync_at: new Date().toISOString(),
      };

      if (isCompleted && participation.status === 'active') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update(updateData)
        .eq('id', participation.id);

      if (updateError) {
        console.error(`[sync-challenge-progress] Error updating participation ${participation.id}:`, updateError);
        continue;
      }

      results.push({
        challengeId: challenge.id,
        previousProgress: participation.current_progress,
        newProgress: Math.floor(totalProgress),
        completed: isCompleted,
      });
    }

    console.log(`[sync-challenge-progress] Completed. Updated ${results.length} challenges`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[sync-challenge-progress] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
