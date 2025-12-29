import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  FileText, 
  Plus, 
  Trash2, 
  Send, 
  Eye,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useClientReports, useDeleteReport, CoachClientReport } from "@/hooks/useCoachClientReports";
import { useTranslation } from "@/hooks/useTranslation";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientAIReportGenerator } from "./ClientAIReportGenerator";
import { ReportDetailModal } from "./ReportDetailModal";

interface ClientReportsTabProps {
  clientId: string;
  clientName: string;
  coachId: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  finalized: "bg-primary/20 text-primary",
  sent: "bg-success/20 text-success",
};

export const ClientReportsTab = ({ clientId, clientName, coachId }: ClientReportsTabProps) => {
  const { t } = useTranslation("coach");
  const { data: reports, isLoading } = useClientReports(clientId);
  const deleteReport = useDeleteReport();
  
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CoachClientReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<CoachClientReport | null>(null);

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    await deleteReport.mutateAsync({ 
      reportId: reportToDelete.id, 
      clientId: reportToDelete.client_id 
    });
    setReportToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Disclaimer Banner */}
      <div className="glass-card border-warning/30 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-warning">
            {t("clientDetail.reports.aiDisclaimer.title", "AI Analysis Disclaimer")}
          </p>
          <p className="text-muted-foreground mt-1">
            {t("clientDetail.reports.aiDisclaimer.message", "AI-generated insights are provided as a helpful tool but should not replace professional judgment. AI can sometimes be inaccurate or miss important context. Always verify insights before making recommendations to your clients.")}
          </p>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowGenerator(true)} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t("clientDetail.reports.generateReport", "Generate AI Report")}
        </Button>
      </div>

      {/* Reports List */}
      {!reports || reports.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title={t("clientDetail.reports.noReports", "No reports yet")}
              description={t("clientDetail.reports.noReportsDescription", "Generate an AI analysis to create your first report for this client.")}
              action={{
                label: t("clientDetail.reports.generateFirst", "Generate First Report"),
                onClick: () => setShowGenerator(true),
                icon: Sparkles,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{report.title}</h4>
                      <Badge className={STATUS_COLORS[report.status]}>
                        {t(`clientDetail.reports.status.${report.status}`, report.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("clientDetail.reports.createdOn", "Created on")} {format(new Date(report.created_at), "d MMM yyyy 'at' HH:mm")}
                      {report.sent_to_client_at && (
                        <> • {t("clientDetail.reports.sentOn", "Sent")} {format(new Date(report.sent_to_client_at), "d MMM yyyy")}</>
                      )}
                    </p>
                    {report.report_data?.summary && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {report.report_data.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setReportToDelete(report)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Generator Modal */}
      <ClientAIReportGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        clientId={clientId}
        clientName={clientName}
        coachId={coachId}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        clientName={clientName}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("clientDetail.reports.deleteConfirm.title", "Delete Report?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("clientDetail.reports.deleteConfirm.description", "This will permanently delete this report. This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReport.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
