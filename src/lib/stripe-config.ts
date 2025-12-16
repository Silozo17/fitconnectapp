// Stripe price configuration for FitConnect platform subscriptions
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    description: "Get started at no cost",
    clientLimit: 3,
    commissionPercent: 4,
    prices: {
      monthly: {
        amount: 0,
        priceId: null,
      },
      yearly: {
        amount: 0,
        monthlyEquivalent: 0,
        savings: 0,
        priceId: null,
      },
    },
    features: [
      "Up to 3 clients",
      "Basic workout plans",
      "Client messaging",
      "Session scheduling",
      "4% platform fee",
    ],
    highlighted: false,
  },
  starter: {
    name: "Starter",
    description: "Perfect for new coaches just getting started",
    clientLimit: 10,
    commissionPercent: 3,
    prices: {
      monthly: {
        amount: 19,
        priceId: "price_1Sf80vEztIBHKDEerFCQIjUR",
      },
      yearly: {
        amount: 190,
        monthlyEquivalent: 15.83,
        savings: 38,
        priceId: "price_1Sf812EztIBHKDEevWTflleJ",
      },
    },
    features: [
      "Up to 10 clients",
      "Basic analytics dashboard",
      "Email support",
      "Workout plan builder",
      "Client messaging",
      "Session scheduling",
      "3% platform fee",
    ],
    highlighted: false,
  },
  pro: {
    name: "Pro",
    description: "For established coaches ready to scale",
    clientLimit: 50,
    commissionPercent: 2,
    prices: {
      monthly: {
        amount: 49,
        priceId: "price_1Sf80wEztIBHKDEeO6RxdYCU",
      },
      yearly: {
        amount: 490,
        monthlyEquivalent: 40.83,
        savings: 98,
        priceId: "price_1Sf813EztIBHKDEeqPNPZoRy",
      },
    },
    features: [
      "Everything in Starter, plus:",
      "Up to 50 clients",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "AI workout & meal planners",
      "Nutrition plan builder",
      "Client progress tracking",
      "2% platform fee",
    ],
    highlighted: true,
  },
  enterprise: {
    name: "Enterprise",
    description: "For elite coaches and fitness businesses",
    clientLimit: null, // Unlimited
    commissionPercent: 1,
    prices: {
      monthly: {
        amount: 99,
        priceId: "price_1Sf80xEztIBHKDEegrV6T1T7",
      },
      yearly: {
        amount: 990,
        monthlyEquivalent: 82.50,
        savings: 198,
        priceId: "price_1Sf814EztIBHKDEevMuXmU4J",
      },
    },
    features: [
      "Everything in Pro, plus:",
      "Unlimited clients",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Phone support",
      "1% platform fee",
    ],
    highlighted: false,
  },
} as const;

export type TierKey = keyof typeof SUBSCRIPTION_TIERS;
export type BillingInterval = "monthly" | "yearly";

// Tier order from lowest to highest (for upgrade/downgrade comparison)
export const TIER_ORDER: TierKey[] = ["free", "starter", "pro", "enterprise"];

// Helper to get tier position for comparison
export const getTierPosition = (tier: TierKey): number => TIER_ORDER.indexOf(tier);

// Map legacy or invalid tier names to valid TierKeys
export const normalizeTier = (tier: string | null | undefined): TierKey => {
  if (!tier) return "free";
  
  // Direct match to valid tier
  if (tier in SUBSCRIPTION_TIERS) {
    return tier as TierKey;
  }
  
  // Map legacy tier names
  const legacyMap: Record<string, TierKey> = {
    elite: "enterprise",
    premium: "pro",
    basic: "starter",
  };
  
  return legacyMap[tier] || "free";
};
