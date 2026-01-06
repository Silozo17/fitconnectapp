import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import type { AIPlanRecommendation } from "@/hooks/useAIPlanRecommendations";

interface Props {
  recommendation: AIPlanRecommendation;
  onApply: () => void;
  onDismiss: () => void;
  typeIcons: Record<string, LucideIcon>;
}

export function AIPlanRecommendationCard({ recommendation, onApply, onDismiss, typeIcons }: Props) {
  const { t } = useTranslation("coach");
  const TypeIcon = typeIcons[recommendation.recommendation_type] || typeIcons.general;

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="p-3 sm:p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${priorityColors[recommendation.priority]}`}>
            <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
              <h3 className="font-medium text-sm sm:text-base">{recommendation.title}</h3>
              <Badge variant="outline" className={`text-xs ${priorityColors[recommendation.priority]}`}>
                {t(`aiRecommendations.priority.${recommendation.priority}`)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {t(`aiRecommendations.types.${recommendation.recommendation_type}`)}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {recommendation.client?.first_name} {recommendation.client?.last_name}
            </p>
            <p className="text-xs sm:text-sm mb-2">{recommendation.description}</p>
            {recommendation.rationale && (
              <p className="text-xs text-muted-foreground italic">{recommendation.rationale}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(recommendation.created_at), "PPP")}
            </p>
          </div>
          {recommendation.status === "pending" && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <Button size="sm" onClick={onApply} className="text-xs sm:text-sm">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">{t("aiRecommendations.applyToPlan")}</span>
                <span className="sm:hidden">{t("aiRecommendations.applied")}</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}
