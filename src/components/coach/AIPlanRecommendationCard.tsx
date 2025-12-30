import { Card, CardContent } from "@/components/ui/card";
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
    <Card variant="glass" className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${priorityColors[recommendation.priority]}`}>
            <TypeIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{recommendation.title}</h3>
              <Badge variant="outline" className={priorityColors[recommendation.priority]}>
                {t(`aiRecommendations.priority.${recommendation.priority}`)}
              </Badge>
              <Badge variant="secondary">
                {t(`aiRecommendations.types.${recommendation.recommendation_type}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {recommendation.client?.first_name} {recommendation.client?.last_name}
            </p>
            <p className="text-sm mb-2">{recommendation.description}</p>
            {recommendation.rationale && (
              <p className="text-xs text-muted-foreground italic">{recommendation.rationale}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(recommendation.created_at), "PPP")}
            </p>
          </div>
          {recommendation.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onApply}>
                <Check className="w-4 h-4 mr-1" />
                {t("aiRecommendations.applyToPlan")}
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
