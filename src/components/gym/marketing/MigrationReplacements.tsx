import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Building2, CreditCard, Award, Dumbbell, Users, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplacementPlatform {
  name: string;
  category: string;
  categoryColor: string;
  painPoints: string[];
  fitConnectAdvantages: string[];
}

const platforms: ReplacementPlatform[] = [
  {
    name: "Mindbody",
    category: "Enterprise",
    categoryColor: "bg-purple-500/10 text-purple-500",
    painPoints: [
      "Expensive pricing (£150-300+/month)",
      "Overcomplicated interface with steep learning curve",
      "Poor UK-based support and slow response times",
      "Forced into long-term contracts",
      "Hidden transaction fees on payments",
    ],
    fitConnectAdvantages: [
      "60% cheaper with transparent £99/mo pricing",
      "UK-based support team in your timezone",
      "Intuitive interface—staff trained in under an hour",
      "No contracts, cancel anytime",
      "No hidden fees, ever",
    ],
  },
  {
    name: "Glofox",
    category: "Boutique Focused",
    categoryColor: "bg-pink-500/10 text-pink-500",
    painPoints: [
      "High per-member fees that scale unexpectedly",
      "Limited customisation options",
      "Basic reporting capabilities",
      "No martial arts grading features",
    ],
    fitConnectAdvantages: [
      "Flat monthly pricing regardless of member count",
      "Fully customisable to your brand",
      "Advanced analytics and custom reports",
      "Full belt/grading system included",
    ],
  },
  {
    name: "ClubRight",
    category: "Traditional Gyms",
    categoryColor: "bg-blue-500/10 text-blue-500",
    painPoints: [
      "Dated, clunky user interface",
      "Limited third-party integrations",
      "Basic mobile experience for members",
      "Slow to add new features",
    ],
    fitConnectAdvantages: [
      "Modern, mobile-first design",
      "Native Stripe & GoCardless integration",
      "Beautiful member app experience",
      "Regular feature updates based on user feedback",
    ],
  },
  {
    name: "TeamUp",
    category: "Class-Based",
    categoryColor: "bg-green-500/10 text-green-500",
    painPoints: [
      "Limited grading and progression features",
      "Basic reporting and analytics",
      "No retail/POS functionality",
      "Limited automation capabilities",
    ],
    fitConnectAdvantages: [
      "Complete grading system for martial arts",
      "Advanced analytics dashboard",
      "Integrated POS for retail sales",
      "Powerful automation engine",
    ],
  },
  {
    name: "Gymcatch",
    category: "Scheduling Only",
    categoryColor: "bg-orange-500/10 text-orange-500",
    painPoints: [
      "No member management capabilities",
      "No payment processing",
      "Limited to class bookings only",
      "Requires additional tools for full management",
    ],
    fitConnectAdvantages: [
      "Complete member profiles and management",
      "Integrated payment processing",
      "Scheduling + billing + CRM in one",
      "One platform for everything",
    ],
  },
  {
    name: "Club Manager",
    category: "General Gym",
    categoryColor: "bg-indigo-500/10 text-indigo-500",
    painPoints: [
      "Dated, desktop-focused interface",
      "Member limits on lower pricing tiers",
      "Clunky POS and retail system",
      "Limited mobile capabilities",
      "Complex pricing structure",
    ],
    fitConnectAdvantages: [
      "Modern, mobile-first responsive design",
      "Unlimited members on all plans",
      "Streamlined, integrated POS system",
      "Full mobile app for staff and members",
      "Simple, transparent pricing",
    ],
  },
  {
    name: "Ashbourn",
    category: "Direct Debit Focused",
    categoryColor: "bg-amber-500/10 text-amber-500",
    painPoints: [
      "Locked into long-term contracts",
      "Hidden fees and 'call for quote' pricing",
      "Slow payment payouts to your account",
      "Outdated, clunky software interface",
      "Limited features beyond direct debit",
      "Poor integration with other tools",
    ],
    fitConnectAdvantages: [
      "No contracts—cancel anytime",
      "Transparent pricing displayed upfront",
      "Fast payouts via Stripe (2-3 business days)",
      "Modern, intuitive platform",
      "Full gym management beyond just payments",
      "Native integrations included",
    ],
  },
  {
    name: "MAAT BJJ",
    category: "Martial Arts",
    categoryColor: "bg-red-500/10 text-red-500",
    painPoints: [
      "Limited to BJJ-only functionality",
      "No retail or POS capabilities",
      "Single location focus—no multi-gym support",
      "Basic scheduling compared to full platforms",
      "Limited payment and billing options",
    ],
    fitConnectAdvantages: [
      "Supports all martial arts + fitness classes",
      "Integrated POS for gi, equipment, and merchandise",
      "Multi-location support from day one",
      "Advanced scheduling with waitlists and packages",
      "Flexible billing: memberships, class packs, and more",
    ],
  },
  {
    name: "Spreadsheets",
    category: "Manual",
    categoryColor: "bg-gray-500/10 text-gray-500",
    painPoints: [
      "Error-prone manual data entry",
      "No automation whatsoever",
      "No member portal or self-service",
      "Hours wasted on admin each week",
      "No payment processing",
    ],
    fitConnectAdvantages: [
      "Automated everything—no manual entry",
      "Members book and pay online 24/7",
      "Branded member portal included",
      "Save 15+ hours per week on admin",
      "Integrated payments with automatic retries",
    ],
  },
];

export const MigrationReplacements = () => {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const togglePlatform = (name: string) => {
    setExpandedPlatform(expandedPlatform === name ? null : name);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
          How FitConnect Replaces Your Current Platform
        </h3>
        <p className="text-sm text-muted-foreground">
          Click any platform to see how FitConnect solves its limitations
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const isExpanded = expandedPlatform === platform.name;
          
          return (
            <div
              key={platform.name}
              className={cn(
                "rounded-xl border transition-all duration-300 cursor-pointer",
                isExpanded 
                  ? "bg-card border-primary/30 shadow-lg md:col-span-2 lg:col-span-3" 
                  : "bg-card/50 border-border hover:border-primary/20 hover:bg-card"
              )}
              onClick={() => togglePlatform(platform.name)}
            >
              {/* Header - always visible */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {platform.category === "Martial Arts" ? (
                      <Award className="w-5 h-5 text-muted-foreground" />
                    ) : platform.category === "Direct Debit Focused" ? (
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    ) : platform.category === "Manual" ? (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{platform.name}</h4>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", platform.categoryColor)}>
                      {platform.category}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pain Points */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        Common {platform.name} Pain Points
                      </h5>
                      <ul className="space-y-2">
                        {platform.painPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* FitConnect Advantages */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-primary flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        With FitConnect You Get
                      </h5>
                      <ul className="space-y-2">
                        {platform.fitConnectAdvantages.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
