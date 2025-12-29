import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  Save, 
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCreateReport } from "@/hooks/useCoachClientReports";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ClientAIReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  coachId: string;
}

interface GeneratedReport {
  summary: string;
  trends: Array<{ category: string; trend: string; detail: string }>;
  adherence: Array<{ area: string; score: number; notes: string }>;
  risks: Array<{ level: string; description: string }>;
  recommendations: string[];
  photoAnalysis?: any;
  measurementsTrend?: any;
  wearableInsights?: any;
  suggestedNextSteps?: string[];
  generatedAt: string;
}

export const ClientAIReportGenerator = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName,
  coachId 
}: ClientAIReportGeneratorProps) => {
  const { t } = useTranslation("coach");
  const createReport = useCreateReport();
  
  const [step, setStep] = useState<"generate" | "review" | "save">("generate");
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-coach-client-analysis", {
        body: { clientId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as GeneratedReport;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      setReportTitle(`${clientName} - Analysis ${new Date().toLocaleDateString()}`);
      setStep("review");
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate analysis: ${error.message}`);
    },
  });

  const handleSaveReport = async (sendToClient: boolean = false) => {
    if (!generatedReport || !disclaimerAcknowledged) return;

    await createReport.mutateAsync({
      coach_id: coachId,
      client_id: clientId,
      title: reportTitle,
      report_data: generatedReport,
      coach_notes: coachNotes || undefined,
      status: sendToClient ? "sent" : "draft",
      sent_to_client_at: sendToClient ? new Date().toISOString() : undefined,
      ai_disclaimer_acknowledged: true,
    });

    // Reset state
    setStep("generate");
    setGeneratedReport(null);
    setReportTitle("");
    setCoachNotes("");
    setDisclaimerAcknowledged(false);
    onOpenChange(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-success" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-warning/20 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("clientDetail.reports.generator.title", "AI Client Analysis")}
          </DialogTitle>
          <DialogDescription>
            {t("clientDetail.reports.generator.description", "Generate a comprehensive analysis report for")} {clientName}
          </DialogDescription>
        </DialogHeader>

        {step === "generate" && (
          <div className="space-y-6 py-4">
            {/* AI Disclaimer */}
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">
                  {t("clientDetail.reports.aiDisclaimer.title", "Important Disclaimer")}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t("clientDetail.reports.aiDisclaimer.generateWarning", "The AI will analyze all available client data including progress photos, measurements, meal logs, training logs, habits, and wearable data. The analysis is for informational purposes only and should not replace your professional judgment.")}
                </p>
              </div>
            </div>

            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t("clientDetail.reports.generator.ready", "Ready to Analyze")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("clientDetail.reports.generator.readyDescription", "Click below to generate a comprehensive AI analysis of your client's progress, trends, and recommendations.")}
              </p>
              <Button 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("clientDetail.reports.generator.generating", "Analyzing...")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("clientDetail.reports.generator.generate", "Generate Analysis")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "review" && generatedReport && (
          <div className="space-y-6 py-4">
            {/* Summary */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{t("clientDetail.reports.sections.summary", "Summary")}</h4>
                <p className="text-muted-foreground">{generatedReport.summary}</p>
              </CardContent>
            </Card>

            {/* Trends */}
            {generatedReport.trends && generatedReport.trends.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.trends", "Trends & Patterns")}</h4>
                  <div className="space-y-3">
                    {generatedReport.trends.map((trend, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                        {getTrendIcon(trend.trend)}
                        <div>
                          <p className="font-medium">{trend.category}</p>
                          <p className="text-sm text-muted-foreground">{trend.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adherence */}
            {generatedReport.adherence && generatedReport.adherence.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.adherence", "Adherence")}</h4>
                  <div className="space-y-3">
                    {generatedReport.adherence.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.area}</span>
                          <span className="text-sm text-muted-foreground">{item.score}%</span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risks */}
            {generatedReport.risks && generatedReport.risks.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.concerns", "Potential Concerns")}</h4>
                  <div className="space-y-2">
                    {generatedReport.risks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Badge className={getRiskColor(risk.level)}>{risk.level}</Badge>
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {generatedReport.recommendations && generatedReport.recommendations.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.recommendations", "Recommendations")}</h4>
                  <ul className="space-y-2">
                    {generatedReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Save Section */}
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("clientDetail.reports.reportTitle", "Report Title")}</Label>
                <Input 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder={t("clientDetail.reports.reportTitlePlaceholder", "Enter a title for this report")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("clientDetail.reports.coachNotes", "Your Notes (Optional)")}</Label>
                <Textarea 
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder={t("clientDetail.reports.coachNotesPlaceholder", "Add your personal notes, observations, or context...")}
                  rows={3}
                />
              </div>

              {/* Disclaimer Acknowledgment */}
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <Checkbox 
                  id="disclaimer"
                  checked={disclaimerAcknowledged}
                  onCheckedChange={(checked) => setDisclaimerAcknowledged(checked as boolean)}
                />
                <label htmlFor="disclaimer" className="text-sm cursor-pointer">
                  <span className="font-medium text-warning">
                    {t("clientDetail.reports.disclaimerAcknowledge", "I acknowledge that this AI analysis is for informational purposes only")}
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {t("clientDetail.reports.disclaimerAcknowledgeDetail", "I understand that AI can be inaccurate and will verify insights before sharing with my client or making recommendations.")}
                  </p>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep("generate")}>
                  {t("common.back", "Back")}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSaveReport(false)}
                  disabled={!disclaimerAcknowledged || !reportTitle || createReport.isPending}
                >
                  {createReport.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t("clientDetail.reports.saveDraft", "Save as Draft")}
                </Button>
                <Button 
                  onClick={() => handleSaveReport(true)}
                  disabled={!disclaimerAcknowledged || !reportTitle || createReport.isPending}
                >
                  {createReport.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {t("clientDetail.reports.saveAndSend", "Save & Send to Client")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
