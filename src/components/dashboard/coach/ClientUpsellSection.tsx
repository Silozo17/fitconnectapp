import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Sparkles, 
  TrendingUp, 
  Package, 
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  X
} from "lucide-react";
import { useUpsellInsights, UpsellSuggestion } from "@/hooks/useUpsellInsights";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientUpsellSectionProps {
  clientId: string;
  clientName: string;
  onCreateSuggestion?: () => void;
}

export function ClientUpsellSection({ 
  clientId, 
  clientName,
  onCreateSuggestion 
}: ClientUpsellSectionProps) {
  const { t } = useTranslation();
  const { data: insights, isLoading } = useUpsellInsights();

  const clientInsights = useMemo(() => {
    return insights?.filter((i) => i.clientId === clientId) || [];
  }, [insights, clientId]);

  const activeSuggestion = clientInsights.find((i) => i.status === "pending");
  const historySuggestions = clientInsights.filter((i) => i.status !== "pending");

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {t("upsell.title", "Upsell Insights")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("upsell.title", "Upsell Insights")}
        </CardTitle>
        {onCreateSuggestion && (
          <Button variant="ghost" size="sm" onClick={onCreateSuggestion}>
            <Lightbulb className="w-4 h-4 mr-1" />
            {t("upsell.create", "Create")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Suggestion */}
        {activeSuggestion ? (
          <ActiveSuggestionCard suggestion={activeSuggestion} />
        ) : (
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t("upsell.noActive", "No active upsell suggestions")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("upsell.noActiveDesc", "AI will suggest opportunities based on client activity")}
            </p>
          </div>
        )}

        {/* History */}
        {historySuggestions.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                {t("upsell.history", "History")} ({historySuggestions.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {historySuggestions.slice(0, 5).map((suggestion) => (
                    <HistorySuggestionItem key={suggestion.id} suggestion={suggestion} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveSuggestionCard({ suggestion }: { suggestion: UpsellSuggestion }) {
  const { t } = useTranslation();

  const typeLabels: Record<string, string> = {
    package_upgrade: t("upsell.type.packageUpgrade", "Package Upgrade"),
    add_nutrition: t("upsell.type.addNutrition", "Add Nutrition"),
    extend_sessions: t("upsell.type.extendSessions", "Extend Sessions"),
    premium_feature: t("upsell.type.premiumFeature", "Premium Feature"),
  };

  const confidenceColors = {
    high: "text-success",
    medium: "text-warning",
    low: "text-muted-foreground",
  };

  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">
            {typeLabels[suggestion.suggestionType] || suggestion.suggestionType}
          </span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs", confidenceColors[suggestion.confidence])}
        >
          {suggestion.confidence} {t("upsell.confidence", "confidence")}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>

      {suggestion.suggestedProduct && (
        <div className="flex items-center gap-2 text-sm">
          <ChevronRight className="w-4 h-4 text-primary" />
          <span className="text-foreground">{suggestion.suggestedProduct}</span>
          {suggestion.suggestedValue && (
            <Badge variant="secondary" className="text-xs">
              £{suggestion.suggestedValue}
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button size="sm" className="flex-1">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          {t("upsell.accept", "Accept")}
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-1" />
          {t("upsell.dismiss", "Dismiss")}
        </Button>
      </div>
    </div>
  );
}

function HistorySuggestionItem({ suggestion }: { suggestion: UpsellSuggestion }) {
  const { t } = useTranslation();

  const statusStyles = {
    accepted: "bg-success/10 text-success",
    dismissed: "bg-muted text-muted-foreground",
    pending: "bg-primary/10 text-primary",
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm">
      <div className="flex items-center gap-2">
        <Package className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground">{suggestion.suggestedProduct || suggestion.suggestionType}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs", statusStyles[suggestion.status])}>
          {suggestion.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {format(suggestion.createdAt, "d MMM")}
        </span>
      </div>
    </div>
  );
}