/**
 * Milestone Resolution Layer
 * Fetches and computes milestone values from discipline_events
 */

import { supabase } from "@/integrations/supabase/client";
import { DisciplineMilestoneConfig, ComputedMilestone } from "@/config/disciplines/types";

/**
 * Fetch the latest milestone event
 */
async function fetchLatestMilestone(
  userId: string,
  disciplineId: string,
  eventType: string
): Promise<{ value: string; achieved_at: string } | null> {
  const { data, error } = await supabase
    .from('discipline_events')
    .select('value_json, recorded_at')
    .eq('user_id', userId)
    .eq('discipline_id', disciplineId)
    .eq('event_type', eventType)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const valueJson = data.value_json as { value?: string; label?: string } | null;
  
  return {
    value: valueJson?.label || valueJson?.value || 'Achieved',
    achieved_at: data.recorded_at
  };
}

/**
 * Fetch the max milestone event (for PBs, best times, etc.)
 */
async function fetchMaxMilestone(
  userId: string,
  disciplineId: string,
  eventType: string
): Promise<{ value: string; achieved_at: string } | null> {
  const { data, error } = await supabase
    .from('discipline_events')
    .select('value_json, recorded_at')
    .eq('user_id', userId)
    .eq('discipline_id', disciplineId)
    .eq('event_type', eventType)
    .order('recorded_at', { ascending: false });

  if (error || !data || data.length === 0) return null;

  // Find the max value
  let maxValue = 0;
  let maxEvent = data[0];

  for (const event of data) {
    const valueJson = event.value_json as { value?: number } | null;
    const value = valueJson?.value || 0;
    if (value > maxValue) {
      maxValue = value;
      maxEvent = event;
    }
  }

  const valueJson = maxEvent.value_json as { value?: number; label?: string; display?: string } | null;
  
  return {
    value: valueJson?.display || valueJson?.label || `${valueJson?.value || 0}`,
    achieved_at: maxEvent.recorded_at
  };
}

/**
 * Format milestone value based on type
 */
function formatMilestoneValue(
  value: string | null,
  type: string
): string {
  if (!value) return '—';

  switch (type) {
    case 'belt':
      return value;
    case 'pb':
      return `${value}kg`;
    case 'raceTime':
      return value;
    case 'fightRecord':
      return value;
    case 'date':
      // Format date nicely
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return value;
      }
    case 'rank':
      return value;
    case 'achievement':
      return value;
    default:
      return value;
  }
}

/**
 * Main function to get a milestone for a discipline
 */
export async function getMilestone(
  milestoneConfig: DisciplineMilestoneConfig,
  userId: string,
  disciplineId: string
): Promise<ComputedMilestone> {
  let result: { value: string; achieved_at: string } | null = null;

  if (milestoneConfig.displayRule === 'latest') {
    result = await fetchLatestMilestone(userId, disciplineId, milestoneConfig.eventType);
  } else if (milestoneConfig.displayRule === 'max') {
    result = await fetchMaxMilestone(userId, disciplineId, milestoneConfig.eventType);
  }

  return {
    id: milestoneConfig.id,
    label: milestoneConfig.label,
    value: result ? formatMilestoneValue(result.value, milestoneConfig.type) : null,
    type: milestoneConfig.type,
    achievedAt: result?.achieved_at,
  };
}
