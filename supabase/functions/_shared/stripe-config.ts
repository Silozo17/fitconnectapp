/**
 * Shared Stripe configuration for all checkout and payment functions.
 * Centralizes commission rates and tier logic to ensure consistency.
 */

// Commission rates by subscription tier (percentage taken by platform)
export const COMMISSION_RATES: Record<string, number> = {
  free: 4,
  starter: 3,
  pro: 2,
  enterprise: 1,
  founder: 1, // Changed from 0 to 1% - all tiers now have minimum 1% fee
};

// Fee range constants for validation
export const MIN_COMMISSION_RATE = 1;
export const MAX_COMMISSION_RATE = 4;

/**
 * Get the commission rate for a given tier.
 * Returns the platform fee percentage (e.g., 4 for 4%).
 * Defaults to "free" tier rate if tier is unknown.
 * Enforces fee range bounds (1-4%).
 */
export function getCommissionRate(tier: string | null | undefined): number {
  const normalizedTier = (tier || "free").toLowerCase();
  const rate = COMMISSION_RATES[normalizedTier] ?? COMMISSION_RATES.free;
  
  // Enforce fee range bounds (1-4%)
  return Math.max(MIN_COMMISSION_RATE, Math.min(MAX_COMMISSION_RATE, rate));
}

/**
 * Calculate the application fee amount in cents.
 * @param amountInMinorUnits - The amount in minor currency units (cents/pence)
 * @param tier - The coach's subscription tier
 * @returns The fee amount in minor currency units
 */
export function calculateApplicationFee(amountInMinorUnits: number, tier: string | null | undefined): number {
  const commissionRate = getCommissionRate(tier);
  return Math.round(amountInMinorUnits * commissionRate / 100);
}
