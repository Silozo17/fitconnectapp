import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Target, Utensils, Dumbbell, Heart, Crown } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { parseSimpleMarkdown } from "@/lib/markdown-utils";

interface ClientAIAnalysisProps {
  clientId: string;
  clientName: string;
}

interface AnalysisReport {
  summary: string;
  trends: {
    category: string;
    trend: "improving" | "stable" | "declining";
    detail: string;
  }[];
  adherence: {
    area: string;
    score: number;
    notes: string;
  }[];
  risks: {
    level: "low" | "medium" | "high";
    description: string;
  }[];
  recommendations: string[];
  generatedAt: string;
}

export const ClientAIAnalysis = ({ clientId, clientName }: ClientAIAnalysisProps) => {
  const { hasFeature, currentTier } = useFeatureAccess();
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const canAccess = hasFeature("ai_client_analysis");

  const generateAnalysis = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-coach-client-analysis", {
        body: { clientId },
      });

      if (error) throw error;
      return data as AnalysisReport;
    },
    onSuccess: (data) => {
      setReport(data);
      toast.success("Analysis generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate analysis: " + error.message);
    },
  });

  if (!canAccess) {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Client Analysis
            <Badge variant="secondary" className="ml-2">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
          </CardTitle>
          <CardDescription>
            Get AI-powered insights on your client's progress, nutrition, and training patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-500/50" />
            <p className="text-muted-foreground mb-4">
              This feature is available on Enterprise and Founder plans.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/dashboard/coach/settings?tab=subscription"}>
              Upgrade to Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              AI-powered insights for {clientName}
            </CardDescription>
          </div>
          <Button
            onClick={() => generateAnalysis.mutate()}
            disabled={generateAnalysis.isPending}
          >
            {generateAnalysis.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : report ? (
              <RefreshCw className="w-4 h-4 mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {report ? "Regenerate" : "Generate Analysis"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!report && !generateAnalysis.isPending && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate Analysis" to get AI-powered insights</p>
            <p className="text-sm mt-2">
              The AI will analyze progress data, meal logs, training logs, and habits
            </p>
          </div>
        )}

        {generateAnalysis.isPending && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing client data...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Summary
              </h4>
              <div 
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(report.summary) }}
              />
            </div>

            {/* Trends */}
            {report.trends && report.trends.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trends & Patterns
                </h4>
                <div className="space-y-2">
                  {report.trends.map((trend, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                      <Badge
                        variant="outline"
                        className={
                          trend.trend === "improving"
                            ? "bg-green-500/10 text-green-600"
                            : trend.trend === "declining"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-gray-500/10 text-gray-600"
                        }
                      >
                        {trend.trend}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{trend.category}</p>
                        <p className="text-xs text-muted-foreground">{trend.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adherence */}
            {report.adherence && report.adherence.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Adherence
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.adherence.map((item, idx) => (
                    <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.area}</span>
                        <Badge
                          variant="outline"
                          className={
                            item.score >= 80
                              ? "bg-green-500/10 text-green-600"
                              : item.score >= 50
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                          }
                        >
                          {item.score}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {report.risks && report.risks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Potential Concerns
                </h4>
                <div className="space-y-2">
                  {report.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        risk.level === "high"
                          ? "bg-red-500/10 border-red-500/30"
                          : risk.level === "medium"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-gray-500/10 border-gray-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={
                            risk.level === "high"
                              ? "text-red-600"
                              : risk.level === "medium"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }
                        >
                          {risk.level} priority
                        </Badge>
                      </div>
                      <p className="text-sm">{risk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Generated {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "just now"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
