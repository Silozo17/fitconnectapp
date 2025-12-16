import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Trophy, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIProgressAnalysis, ProgressAnalysis } from "@/hooks/useAI";

interface AIProgressInsightsProps {
  progressData: any[];
  goal?: string;
}

export const AIProgressInsights = ({ progressData, goal }: AIProgressInsightsProps) => {
  const { analyzeProgress, isLoading } = useAIProgressAnalysis();
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);

  const handleAnalyze = async () => {
    const result = await analyzeProgress({
      progressData,
      goal,
      timeframeDays: 30,
    });

    if (result) {
      setAnalysis(result);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-emerald-500';
      case 'on_track':
        return 'text-blue-500';
      case 'needs_attention':
        return 'text-yellow-500';
      case 'stalled':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!analysis) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Progress Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get AI-powered analysis of your progress trends, achievements, and personalized recommendations.
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || progressData.length < 2}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze My Progress
              </>
            )}
          </Button>
          {progressData.length < 2 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Need at least 2 progress entries for analysis
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Progress Insights
          </span>
          <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] pr-2">
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Overall Assessment</h4>
                <Badge className={getStatusColor(analysis.overallAssessment.status)}>
                  {analysis.overallAssessment.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.overallAssessment.summary}
              </p>
              {analysis.overallAssessment.score && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress Score</span>
                    <span className="font-semibold">{analysis.overallAssessment.score}/100</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${analysis.overallAssessment.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trends */}
            {analysis.trends.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Trends
                </h4>
                <div className="space-y-2">
                  {analysis.trends.map((trend, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.direction)}
                        <span className="font-medium capitalize">{trend.metric.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        {trend.rate && (
                          <p className="text-xs text-muted-foreground">{trend.rate}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {analysis.achievements && analysis.achievements.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Achievements
                </h4>
                <div className="space-y-2">
                  {analysis.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                    >
                      <span className="text-yellow-500">🏆</span>
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-border rounded-lg"
                    >
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {rec.category}
                      </Badge>
                      <p className="text-sm">{rec.suggestion}</p>
                      {rec.impact && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Impact: {rec.impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {analysis.prediction && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Predictions
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {analysis.prediction.twoWeeks && (
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">2 weeks</p>
                      <p className="text-xs font-medium">{analysis.prediction.twoWeeks}</p>
                    </div>
                  )}
                  {analysis.prediction.oneMonth && (
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">1 month</p>
                      <p className="text-xs font-medium">{analysis.prediction.oneMonth}</p>
                    </div>
                  )}
                  {analysis.prediction.threeMonths && (
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">3 months</p>
                      <p className="text-xs font-medium">{analysis.prediction.threeMonths}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Motivational Message */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm italic text-center">
                "{analysis.motivationalMessage}"
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
