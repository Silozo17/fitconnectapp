import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Dumbbell, Apple, Heart, RefreshCw, Check, X, Loader2, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIPlanRecommendations } from "@/hooks/useAIPlanRecommendations";
import { AIPlanRecommendationCard } from "@/components/coach/AIPlanRecommendationCard";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const CoachAIRecommendations = () => {
  const { t } = useTranslation("coach");
  const [activeTab, setActiveTab] = useState<string>("pending");
  
  const {
    recommendations,
    isLoading,
    generateRecommendations,
    isGenerating,
    applyRecommendation,
    dismissRecommendation,
  } = useAIPlanRecommendations();

  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeTab === "pending") return rec.status === "pending";
    if (activeTab === "applied") return rec.status === "applied";
    if (activeTab === "dismissed") return rec.status === "dismissed";
    return true;
  });

  const priorityCounts = {
    high: recommendations.filter((r) => r.priority === "high" && r.status === "pending").length,
    medium: recommendations.filter((r) => r.priority === "medium" && r.status === "pending").length,
    low: recommendations.filter((r) => r.priority === "low" && r.status === "pending").length,
  };

  const typeIcons = {
    workout: Dumbbell,
    nutrition: Apple,
    recovery: Heart,
    general: Sparkles,
  };

  return (
    <DashboardLayout
      title={t("aiRecommendations.title")}
      description={t("aiRecommendations.subtitle")}
    >
      <PageHelpBanner
        pageKey="coach_ai_recommendations"
        title="AI-Powered Insights"
        description="Get AI-generated recommendations to optimize your clients' training plans"
      />

      {/* Stats Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <Card variant="glass" className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{priorityCounts.high}</p>
                  <p className="text-sm text-muted-foreground">{t("aiRecommendations.priority.high")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{priorityCounts.medium}</p>
                  <p className="text-sm text-muted-foreground">{t("aiRecommendations.priority.medium")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="glass-card rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{priorityCounts.low}</p>
                  <p className="text-sm text-muted-foreground">{t("aiRecommendations.priority.low")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="shrink-0 flex items-center">
          <Button
            onClick={() => generateRecommendations()}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("aiRecommendations.generating")}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("aiRecommendations.generateNew")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Recommendations List */}
      <Card variant="glass" className="glass-card rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("aiRecommendations.title")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {t("aiRecommendations.pending", "Pending")}
                        </span>
                        <span className="ml-1">({recommendations.filter((r) => r.status === "pending").length})</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      {t("aiRecommendations.pending", "Pending")}
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="applied">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <Check className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {t("aiRecommendations.applied")}
                        </span>
                        <span className="ml-1">({recommendations.filter((r) => r.status === "applied").length})</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      {t("aiRecommendations.applied")}
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="dismissed">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <X className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {t("aiRecommendations.dismissed")}
                        </span>
                        <span className="ml-1">({recommendations.filter((r) => r.status === "dismissed").length})</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="sm:hidden">
                      {t("aiRecommendations.dismissed")}
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRecommendations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t("aiRecommendations.noRecommendations")}</p>
                  {activeTab === "pending" && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => generateRecommendations()}
                      disabled={isGenerating}
                    >
                      {t("aiRecommendations.generateNew")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations.map((recommendation) => (
                    <AIPlanRecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onApply={() => applyRecommendation(recommendation.id)}
                      onDismiss={() => dismissRecommendation(recommendation.id)}
                      typeIcons={typeIcons}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            </Tabs>
          </TooltipProvider>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CoachAIRecommendations;
