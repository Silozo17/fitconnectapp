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
 * Format belt value from JSON to human-readable string
 */
function formatBeltValue(value: string): string {
  try {
    const parsed = JSON.parse(value);
    // Handle both beltId and direct belt name
    const beltName = parsed.beltId 
      ? parsed.beltId.charAt(0).toUpperCase() + parsed.beltId.slice(1)
      : parsed.belt || 'Unknown';
    const stripes = parsed.stripes || 0;
    const stripesText = stripes > 0 
      ? ` (${stripes} stripe${stripes > 1 ? 's' : ''})` 
      : '';
    return `${beltName} Belt${stripesText}`;
  } catch {
    // If not JSON, return as-is (might already be formatted)
    return value;
  }
}

/**
 * Format fight record from JSON to human-readable string
 */
function formatFightRecord(value: string): string {
  try {
    const parsed = JSON.parse(value);
    const wins = parsed.wins || 0;
    const losses = parsed.losses || 0;
    const draws = parsed.draws || 0;
    const koWins = parsed.koWins || 0;
    const record = `${wins}-${losses}-${draws}`;
    const koText = koWins > 0 ? ` (${koWins} KO${koWins > 1 ? 's' : ''})` : '';
    return record + koText;
  } catch {
    return value;
  }
}

/**
 * Format race time from JSON or string
 */
function formatRaceTime(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed.hours !== undefined || parsed.minutes !== undefined || parsed.seconds !== undefined) {
      const h = parsed.hours || 0;
      const m = parsed.minutes || 0;
      const s = parsed.seconds || 0;
      if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return `${m}:${String(s).padStart(2, '0')}`;
    }
    return parsed.time || value;
  } catch {
    return value;
  }
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
      return formatBeltValue(value);
    case 'pb':
      // Try to parse as number, otherwise return as-is
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : `${numValue}kg`;
    case 'raceTime':
      return formatRaceTime(value);
    case 'fightRecord':
      return formatFightRecord(value);
    case 'date':
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
