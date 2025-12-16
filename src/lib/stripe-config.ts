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
        priceId: "price_1Sf01iHCGP7kst5ZX70XwDK8",
      },
      yearly: {
        amount: 190,
        monthlyEquivalent: 15.83,
        savings: 38,
        priceId: "price_1Sf021HCGP7kst5ZIQ2wTxr5",
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
        priceId: "price_1Sf028HCGP7kst5ZYy1DsERS",
      },
      yearly: {
        amount: 490,
        monthlyEquivalent: 40.83,
        savings: 98,
        priceId: "price_1Sf029HCGP7kst5Z20Y6mbtW",
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
        priceId: "price_1Sf02BHCGP7kst5ZqGTsWl4S",
      },
      yearly: {
        amount: 990,
        monthlyEquivalent: 82.50,
        savings: 198,
        priceId: "price_1Sf02DHCGP7kst5ZavA9AJvG",
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
