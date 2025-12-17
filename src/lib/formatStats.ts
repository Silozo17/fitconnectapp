/**
 * Rounds a number to a "nice" display value and adds "+"
 * Examples:
 * - 3 → "3+"
 * - 15 → "10+"
 * - 235 → "200+"
 * - 1980 → "2000+"
 * - 12345 → "12K+"
 */
export function formatStatNumber(num: number): string {
  if (num < 10) return `${num}+`;
  if (num < 100) return `${Math.floor(num / 10) * 10}+`;
  if (num < 1000) return `${Math.floor(num / 100) * 100}+`;
  if (num < 10000) return `${Math.round(num / 1000)}K+`;
  return `${Math.round(num / 1000)}K+`;
}
