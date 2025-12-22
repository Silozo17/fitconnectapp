// Stripe price configuration for FitConnect platform subscriptions

// Multi-currency price IDs
export const PRICE_IDS = {
  starter: {
    GBP: {
      monthly: "price_1Sf80vEztIBHKDEerFCQIjUR",
      yearly: "price_1Sf812EztIBHKDEevWTflleJ",
    },
    PLN: {
      monthly: "price_1SgvfEEztIBHKDEe5R8Ouqls",
      yearly: "price_1SgvfGEztIBHKDEedOcGnELa",
    },
  },
  pro: {
    GBP: {
      monthly: "price_1Sf80wEztIBHKDEeO6RxdYCU",
      yearly: "price_1Sf813EztIBHKDEeqPNPZoRy",
    },
    PLN: {
      monthly: "price_1SgvfIEztIBHKDEejNc6oP2q",
      yearly: "price_1SgvfJEztIBHKDEejTwn9u45",
    },
  },
  enterprise: {
    GBP: {
      monthly: "price_1Sf80xEztIBHKDEegrV6T1T7",
      yearly: "price_1Sf814EztIBHKDEevMuXmU4J",
    },
    PLN: {
      monthly: "price_1SgvfLEztIBHKDEeheUytGet",
      yearly: "price_1SgvfNEztIBHKDEeIaxNaEUD",
    },
  },
  boost: {
    GBP: "price_boost_gbp", // TODO: Add GBP boost price when created
    PLN: "price_1SgvfPEztIBHKDEe63hxwTyy",
  },
} as const;

// Pricing amounts by currency (in minor units for PLN, major for GBP display)
export const PRICING_BY_CURRENCY = {
  GBP: {
    starter: { monthly: 19, yearly: 190, savings: 38 },
    pro: { monthly: 49, yearly: 490, savings: 98 },
    enterprise: { monthly: 99, yearly: 990, savings: 198 },
    boost: 5,
  },
  PLN: {
    starter: { monthly: 79, yearly: 790, savings: 158 },
    pro: { monthly: 199, yearly: 1990, savings: 398 },
    enterprise: { monthly: 399, yearly: 3990, savings: 798 },
    boost: 25,
  },
} as const;

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
    featureKeys: [
      "pricing.tierFeatures.free.clients",
      "pricing.tierFeatures.free.workoutPlans",
      "pricing.tierFeatures.free.messaging",
      "pricing.tierFeatures.free.scheduling",
      "pricing.tierFeatures.free.platformFee",
    ],
    features: [
      "Up to 3 clients",
      "Basic workout plans",
      "Client messaging",
      "Session scheduling",
      "4% platform fee",
    ],
    highlighted: false,
    adminOnly: false,
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
    featureKeys: [
      "pricing.tierFeatures.starter.clients",
      "pricing.tierFeatures.starter.analytics",
      "pricing.tierFeatures.starter.support",
      "pricing.tierFeatures.starter.workoutBuilder",
      "pricing.tierFeatures.starter.messaging",
      "pricing.tierFeatures.starter.scheduling",
      "pricing.tierFeatures.starter.platformFee",
    ],
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
    adminOnly: false,
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
    featureKeys: [
      "pricing.tierFeatures.pro.includesStarter",
      "pricing.tierFeatures.pro.clients",
      "pricing.tierFeatures.pro.analytics",
      "pricing.tierFeatures.pro.support",
      "pricing.tierFeatures.pro.branding",
      "pricing.tierFeatures.pro.aiTools",
      "pricing.tierFeatures.pro.nutrition",
      "pricing.tierFeatures.pro.progress",
      "pricing.tierFeatures.pro.platformFee",
    ],
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
    adminOnly: false,
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
    featureKeys: [
      "pricing.tierFeatures.enterprise.includesPro",
      "pricing.tierFeatures.enterprise.clients",
      "pricing.tierFeatures.enterprise.accountManager",
      "pricing.tierFeatures.enterprise.integrations",
      "pricing.tierFeatures.enterprise.reporting",
      "pricing.tierFeatures.enterprise.support",
      "pricing.tierFeatures.enterprise.platformFee",
    ],
    features: [
      "Everything in Pro, plus:",
      "Unlimited clients",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Priority support",
      "1% platform fee",
    ],
    highlighted: false,
    adminOnly: false,
  },
  founder: {
    name: "Founder",
    description: "Lifetime unlimited access - Admin grant only",
    clientLimit: null, // Unlimited
    commissionPercent: 1, // Changed from 0 to 1% - minimum platform fee
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
    featureKeys: [
      "pricing.tierFeatures.founder.clients",
      "pricing.tierFeatures.founder.allFeatures",
      "pricing.tierFeatures.founder.support",
      "pricing.tierFeatures.founder.platformFee",
      "pricing.tierFeatures.founder.earlyAccess",
    ],
    features: [
      "Unlimited clients",
      "All Pro & Enterprise features",
      "Priority support",
      "1% platform fee",
      "Early access to new features",
    ],
    highlighted: false,
    adminOnly: true,
  },
} as const;

export type TierKey = keyof typeof SUBSCRIPTION_TIERS;
export type BillingInterval = "monthly" | "yearly";

// Tier order from lowest to highest (for upgrade/downgrade comparison)
export const TIER_ORDER: TierKey[] = ["free", "starter", "pro", "enterprise", "founder"];

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
