/**
 * Formats sleep duration from minutes to human-readable format
 * @param minutes - Sleep duration in minutes
 * @returns Formatted string like "7h 30min" or "45min" or "8h"
 */
export function formatSleepDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "—";
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
}
