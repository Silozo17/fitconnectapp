import { useTranslation } from "react-i18next";
import { useAdaptiveGoalSuggestions, GoalSuggestion } from "@/hooks/useAdaptiveGoalSuggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface GoalSuggestionBannerProps {
  className?: string;
}

const severityConfig = {
  info: {
    icon: Lightbulb,
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
    borderColor: "border-green-500/20",
  },
};

function SuggestionCard({ 
  suggestion, 
  onDismiss 
}: { 
  suggestion: GoalSuggestion; 
  onDismiss: () => void;
}) {
  const navigate = useNavigate();
  const config = severityConfig[suggestion.severity];
  const Icon = config.icon;

  const handleAction = () => {
    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'weight_plateau':
      case 'rapid_loss':
      case 'calorie_adjustment':
        navigate('/dashboard/client/progress');
        break;
      case 'underperformance':
        navigate('/dashboard/client/habits');
        break;
      case 'overperformance':
        navigate('/dashboard/client/challenges');
        break;
    }
  };

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "rounded-2xl border overflow-hidden",
        config.borderColor
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-xl shrink-0", config.bgColor)}>
            <Icon className={cn("h-4 w-4", config.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-foreground text-sm">
                {suggestion.title}
              </h4>
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              {suggestion.description}
            </p>
            <p className="text-sm text-foreground mb-3">
              {suggestion.suggestion}
            </p>
            <div className="flex items-center gap-2">
              {suggestion.actionLabel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-lg"
                  onClick={handleAction}
                >
                  {suggestion.actionLabel}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {suggestion.dismissLabel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs rounded-lg text-muted-foreground"
                  onClick={onDismiss}
                >
                  {suggestion.dismissLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalSuggestionBanner({ className }: GoalSuggestionBannerProps) {
  const { t } = useTranslation("dashboard");
  const { suggestions, hasSuggestions, dismissSuggestion } = useAdaptiveGoalSuggestions();

  if (!hasSuggestions) {
    return null;
  }

  // Show max 2 suggestions at a time
  const visibleSuggestions = suggestions.slice(0, 2);

  return (
    <div className={cn("space-y-3", className)}>
      {visibleSuggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onDismiss={() => dismissSuggestion(suggestion.id)}
        />
      ))}
    </div>
  );
}

export default GoalSuggestionBanner;
