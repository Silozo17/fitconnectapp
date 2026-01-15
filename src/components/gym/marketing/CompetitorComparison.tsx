import { Check, X, Minus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  fitconnect: boolean | "partial" | string;
  typical: boolean | "partial" | string;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Transparent pricing",
    tooltip: "No hidden fees, no 'call for quote'",
    fitconnect: true,
    typical: false,
  },
  {
    feature: "No long-term contracts",
    tooltip: "Cancel anytime without penalties",
    fitconnect: true,
    typical: false,
  },
  {
    feature: "Unlimited staff accounts",
    tooltip: "Add as many staff as you need",
    fitconnect: true,
    typical: "Extra £10-50/user",
  },
  {
    feature: "Free data migration",
    tooltip: "We import all your existing data",
    fitconnect: true,
    typical: "£500-2000 setup fee",
  },
  {
    feature: "Dedicated account manager",
    tooltip: "A real person to help you succeed",
    fitconnect: true,
    typical: "partial",
  },
  {
    feature: "White-glove onboarding",
    tooltip: "90-day hands-on support",
    fitconnect: true,
    typical: false,
  },
  {
    feature: "UK-based support",
    tooltip: "Support team in your timezone",
    fitconnect: true,
    typical: "partial",
  },
  {
    feature: "GDPR compliant",
    tooltip: "Full compliance with UK data laws",
    fitconnect: true,
    typical: true,
  },
  {
    feature: "Integrated payments (Stripe)",
    tooltip: "No third-party payment processor needed",
    fitconnect: true,
    typical: "partial",
  },
  {
    feature: "Mobile app for members",
    tooltip: "Branded app for your members",
    fitconnect: "Coming Q2 2025",
    typical: "Extra £50-200/mo",
  },
];

function StatusIcon({ value }: { value: boolean | "partial" | string }) {
  if (value === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-500" />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
        <X className="w-4 h-4 text-red-500" />
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
        <Minus className="w-4 h-4 text-amber-500" />
      </div>
    );
  }
  // String value (like "Extra £50/mo")
  return <span className="text-sm text-amber-600 dark:text-amber-400">{value}</span>;
}

export function CompetitorComparison() {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-[500px]">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border">
            <div className="text-sm font-medium text-muted-foreground">Feature</div>
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <span className="font-bold text-primary">FitConnect</span>
                <span className="text-xs text-muted-foreground">From £99/mo</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <span className="font-medium text-muted-foreground">Typical Software</span>
                <span className="text-xs text-muted-foreground">£150-400/mo</span>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {comparisonData.map((row, index) => (
              <div 
                key={index} 
                className={cn(
                  "grid grid-cols-3 gap-4 py-4 items-center",
                  index % 2 === 0 ? "bg-transparent" : "bg-secondary/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{row.feature}</span>
                  {row.tooltip && (
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{row.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex justify-center">
                  <StatusIcon value={row.fitconnect} />
                </div>
                <div className="flex justify-center">
                  <StatusIcon value={row.typical} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Bottom line:</span> FitConnect gives you more features, better support, and transparent pricing—typically saving gyms £100-300/month compared to competitors.
        </p>
      </div>
    </TooltipProvider>
  );
}
