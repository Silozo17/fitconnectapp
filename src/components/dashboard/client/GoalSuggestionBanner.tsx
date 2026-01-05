import { useTranslation } from "react-i18next";
import { useAdaptiveGoalSuggestions, GoalSuggestion } from "@/hooks/useAdaptiveGoalSuggestions";
import { AccentCard, AccentCardContent } from "@/components/ui/accent-card";
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

// Keep warning semantic color, others use primary lime
const severityConfig = {
  info: {
    icon: Lightbulb,
    bgColor: "bg-primary/15",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
    usePrimaryCard: true,
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    usePrimaryCard: false,
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-primary/15",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
    usePrimaryCard: true,
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

  // Use AccentCard for info/success, regular styling for warning
  if (config.usePrimaryCard) {
    return (
      <AccentCard className="rounded-2xl">
        <AccentCardContent className="p-4">
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
        </AccentCardContent>
      </AccentCard>
    );
  }

  // Warning uses different styling
  return (
    <div 
      className={cn(
        "rounded-2xl border overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-500/5",
        config.borderColor
      )}
    >
      <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-500/80 to-amber-500/50" />
      <div className="p-4">
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
      </div>
    </div>
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
