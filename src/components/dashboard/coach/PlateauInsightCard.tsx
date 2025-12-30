import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, TrendingDown, CheckCircle2, ChevronDown, Clock, MessageSquare } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import type { PlateauDetection, PlateauHistory } from "@/hooks/usePlateauDetection";
import { useMarkPlateau, useMarkBreakthrough, usePlateauHistory } from "@/hooks/usePlateauDetection";

interface PlateauInsightCardProps {
  plateau: PlateauDetection;
  onDismiss?: () => void;
}

export function PlateauInsightCard({ plateau, onDismiss }: PlateauInsightCardProps) {
  const { t } = useTranslation();
  const [coachNotes, setCoachNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  
  const { data: history = [] } = usePlateauHistory(plateau.clientId);
  const markPlateau = useMarkPlateau();
  const markBreakthrough = useMarkBreakthrough();

  const severityStyles = {
    mild: 'bg-warning/20 text-warning border-warning/30',
    moderate: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    severe: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  // Generate mini chart data from plateau baseline and current values
  const chartData = Array.from({ length: plateau.durationWeeks }, (_, index) => ({
    week: index + 1,
    value: plateau.baselineValue + ((plateau.currentValue - plateau.baselineValue) * (index / (plateau.durationWeeks - 1 || 1))),
  }));

  const handleMarkAcknowledged = () => {
    markPlateau.mutate({
      clientId: plateau.clientId,
      metricType: plateau.metricType,
      startDate: plateau.startDate,
      notes: coachNotes || undefined,
    });
  };

  const handleMarkBreakthrough = (plateauId: string) => {
    markBreakthrough.mutate(plateauId);
  };

  return (
    <Card variant="glass" className="border-warning/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t('insights.plateauDetected', 'Plateau Detected')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {plateau.clientName}
              </p>
            </div>
          </div>
          <Badge className={severityStyles[plateau.severity]}>
            {plateau.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metric Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <p className="text-sm font-medium text-foreground capitalize">
              {plateau.metricType}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {plateau.durationWeeks} {t('insights.weeks', 'weeks')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {plateau.currentValue?.toFixed(1)} kg
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <TrendingDown className="w-3 h-3" />
              {t('insights.noChange', 'No significant change')}
            </p>
          </div>
        </div>

        {/* Mini Trend Chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Coach Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t('insights.coachNotes', 'Coach Notes')}
          </label>
          <Textarea
            placeholder={t('insights.notesPlaceholder', 'Add notes about this plateau...')}
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAcknowledged}
            disabled={markPlateau.isPending}
            className="flex-1 sm:flex-none"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t('insights.acknowledge', 'Acknowledge')}
          </Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                {t('insights.plateauHistory', 'Plateau History')} ({history.length})
                <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-secondary/30 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium capitalize">{item.metricType}</span>
                    {item.breakthroughAt ? (
                      <Badge variant="outline" className="bg-success/10 text-success text-xs">
                        {t('insights.resolved', 'Resolved')}
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleMarkBreakthrough(item.id)}
                        disabled={markBreakthrough.isPending}
                      >
                        {t('insights.markBreakthrough', 'Breakthrough')}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.durationWeeks} {t('insights.weeks', 'weeks')} • {item.baselineValue?.toFixed(1)} → {item.currentValue?.toFixed(1)} kg
                  </p>
                  {item.coachNotes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{item.coachNotes}"
                    </p>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}