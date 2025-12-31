import { useTranslation } from "react-i18next";
import { Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationSummaryProps {
  isEnabled: boolean;
  summaryPoints: string[];
  className?: string;
}

export function AutomationSummary({ isEnabled, summaryPoints, className }: AutomationSummaryProps) {
  const { t } = useTranslation("coach");

  if (!isEnabled) {
    return (
      <div className={cn("rounded-lg border border-dashed p-4 bg-muted/30", className)}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("automations.summary.disabled", "Automation is disabled")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("automations.summary.disabledHint", "Enable this automation to start monitoring your clients automatically.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-primary/20 bg-primary/5 p-4", className)}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">
            {t("automations.summary.enabled", "When enabled, this automation will:")}
          </p>
          <ul className="mt-2 space-y-1.5">
            {summaryPoints.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
