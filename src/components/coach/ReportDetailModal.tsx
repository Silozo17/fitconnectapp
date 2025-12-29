import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Send, 
  Save,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { CoachClientReport, useUpdateReport, useSendReportToClient } from "@/hooks/useCoachClientReports";
import { useTranslation } from "@/hooks/useTranslation";

interface ReportDetailModalProps {
  report: CoachClientReport | null;
  onClose: () => void;
  clientName: string;
}

export const ReportDetailModal = ({ report, onClose, clientName }: ReportDetailModalProps) => {
  const { t } = useTranslation("coach");
  const updateReport = useUpdateReport();
  const sendReport = useSendReportToClient();
  
  const [coachNotes, setCoachNotes] = useState(report?.coach_notes || "");
  const [hasChanges, setHasChanges] = useState(false);

  if (!report) return null;

  const handleNotesChange = (value: string) => {
    setCoachNotes(value);
    setHasChanges(value !== (report.coach_notes || ""));
  };

  const handleSaveNotes = async () => {
    await updateReport.mutateAsync({
      reportId: report.id,
      updates: { coach_notes: coachNotes },
    });
    setHasChanges(false);
  };

  const handleSendToClient = async () => {
    await sendReport.mutateAsync({
      reportId: report.id,
      clientId: report.client_id,
    });
    onClose();
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

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    finalized: "bg-primary/20 text-primary",
    sent: "bg-success/20 text-success",
  };

  return (
    <Dialog open={!!report} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{report.title}</DialogTitle>
              <DialogDescription>
                {t("clientDetail.reports.reportFor", "Report for")} {clientName} • {format(new Date(report.created_at), "d MMM yyyy")}
              </DialogDescription>
            </div>
            <Badge className={statusColors[report.status]}>
              {t(`clientDetail.reports.status.${report.status}`, report.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Disclaimer */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t("clientDetail.reports.aiDisclaimer.viewWarning", "This AI-generated analysis is for informational purposes only. Always apply your professional judgment when reviewing and sharing insights with clients.")}
            </p>
          </div>

          {/* Summary */}
          {report.report_data?.summary && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{t("clientDetail.reports.sections.summary", "Summary")}</h4>
                <p className="text-muted-foreground">{report.report_data.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Trends */}
          {report.report_data?.trends && report.report_data.trends.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.trends", "Trends & Patterns")}</h4>
                <div className="space-y-3">
                  {report.report_data.trends.map((trend, i) => (
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
          {report.report_data?.adherence && report.report_data.adherence.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.adherence", "Adherence")}</h4>
                <div className="space-y-3">
                  {report.report_data.adherence.map((item, i) => (
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
          {report.report_data?.risks && report.report_data.risks.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.concerns", "Potential Concerns")}</h4>
                <div className="space-y-2">
                  {report.report_data.risks.map((risk, i) => (
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
          {report.report_data?.recommendations && report.report_data.recommendations.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">{t("clientDetail.reports.sections.recommendations", "Recommendations")}</h4>
                <ul className="space-y-2">
                  {report.report_data.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Coach Notes */}
          <div className="space-y-2">
            <Label>{t("clientDetail.reports.coachNotes", "Your Notes")}</Label>
            <Textarea 
              value={coachNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={t("clientDetail.reports.coachNotesPlaceholder", "Add your personal notes, observations, or context...")}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={handleSaveNotes}
                disabled={updateReport.isPending}
              >
                {updateReport.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {t("common.saveChanges", "Save Changes")}
              </Button>
            )}
            {report.status !== "sent" && (
              <Button 
                onClick={handleSendToClient}
                disabled={sendReport.isPending}
              >
                {sendReport.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t("clientDetail.reports.sendToClient", "Send to Client")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
