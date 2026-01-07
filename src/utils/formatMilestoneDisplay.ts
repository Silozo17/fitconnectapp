/**
 * Utility to format milestone display values at render time
 * Handles JSON-encoded strings from discipline_events
 */

export function formatMilestoneDisplay(value: string | null | undefined, type?: string): string {
  if (!value || value === '—') return 'Not set yet';

  // Try to parse as JSON first (handles nested JSON strings)
  let parsed: unknown = value;
  
  // Attempt to parse JSON - might be double-encoded or a plain string
  if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
    try {
      parsed = JSON.parse(value);
    } catch {
      // Not valid JSON, use as-is
    }
  }

  // If it's an object, format based on structure
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;

    // Belt format: { beltId: "blue", stripes: 1, ... }
    if ('beltId' in obj || 'belt' in obj) {
      const beltId = (obj.beltId || obj.belt) as string;
      const beltName = beltId.charAt(0).toUpperCase() + beltId.slice(1);
      const stripes = (obj.stripes as number) || 0;
      const stripesText = stripes > 0 
        ? ` (${stripes} stripe${stripes > 1 ? 's' : ''})` 
        : '';
      return `${beltName} Belt${stripesText}`;
    }

    // Fight record format: { wins, losses, draws, koWins? }
    if ('wins' in obj && 'losses' in obj) {
      const wins = (obj.wins as number) || 0;
      const losses = (obj.losses as number) || 0;
      const draws = (obj.draws as number) || 0;
      const koWins = (obj.koWins as number) || 0;
      const record = `${wins}-${losses}-${draws}`;
      const koText = koWins > 0 ? ` (${koWins} KO${koWins > 1 ? 's' : ''})` : '';
      return record + koText;
    }

    // Race time format: { hours?, minutes, seconds }
    if ('minutes' in obj || 'seconds' in obj) {
      const h = (obj.hours as number) || 0;
      const m = (obj.minutes as number) || 0;
      const s = (obj.seconds as number) || 0;
      if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    // PB weight format: { value, unit }
    if ('value' in obj && typeof obj.value === 'number') {
      const unit = (obj.unit as string) || 'kg';
      return `${obj.value}${unit}`;
    }

    // Skill checklist format: { completed: string[], total: number }
    if ('completed' in obj && Array.isArray(obj.completed)) {
      return `${obj.completed.length} skills unlocked`;
    }

    // Generic label/display fallback
    if ('label' in obj && typeof obj.label === 'string') {
      // The label itself might be JSON-encoded, recursively format
      return formatMilestoneDisplay(obj.label, type);
    }
    if ('display' in obj && typeof obj.display === 'string') {
      return obj.display;
    }
  }

  // Return the original string if no special formatting applied
  return value;
}
