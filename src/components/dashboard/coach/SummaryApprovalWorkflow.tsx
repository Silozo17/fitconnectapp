import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  Send, 
  Mail, 
  Calendar as CalendarIcon, 
  Eye,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import type { ClientSummary, GeneratedContent } from "@/hooks/useSummaryGeneration";
import { useApproveSummary, useShareSummary, useScheduleSummary } from "@/hooks/useSummaryGeneration";
import { cn } from "@/lib/utils";

interface SummaryApprovalWorkflowProps {
  summary: ClientSummary;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SummaryApprovalWorkflow({
  summary,
  clientName,
  open,
  onOpenChange,
}: SummaryApprovalWorkflowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sendEmail, setSendEmail] = useState(true);
  const [includeInPortal, setIncludeInPortal] = useState(true);
  const [scheduleFor, setScheduleFor] = useState<Date | undefined>();
  const [isScheduled, setIsScheduled] = useState(false);

  const approveSummary = useApproveSummary();
  const shareSummary = useShareSummary();
  const scheduleSummary = useScheduleSummary();

  const content = summary.coachEdits || summary.generatedContent;

  const handleApprove = () => {
    approveSummary.mutate(summary.id, {
      onSuccess: () => setStep(2),
    });
  };

  const handleShare = () => {
    if (isScheduled && scheduleFor) {
      scheduleSummary.mutate({
        clientId: summary.clientId,
        summaryType: summary.summaryType,
        scheduledFor: scheduleFor,
      }, {
        onSuccess: () => {
          setStep(3);
          setTimeout(() => onOpenChange(false), 2000);
        },
      });
    } else {
      shareSummary.mutate(summary.id, {
        onSuccess: () => {
          setStep(3);
          setTimeout(() => onOpenChange(false), 2000);
        },
      });
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {s}
          </div>
          {s < 3 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-1",
                step > s ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && t('summaries.workflow.reviewApprove', 'Review & Approve')}
            {step === 2 && t('summaries.workflow.shareOptions', 'Share Options')}
            {step === 3 && t('summaries.workflow.complete', 'Complete!')}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && t('summaries.workflow.reviewDesc', 'Review the summary before approving')}
            {step === 2 && t('summaries.workflow.shareDesc', 'Choose how to share with {{name}}', { name: clientName })}
            {step === 3 && t('summaries.workflow.completeDesc', 'Summary has been shared successfully')}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator />

        {step === 1 && (
          <div className="space-y-4">
            {/* Summary Preview */}
            <Card className="glass-subtle max-h-64 overflow-y-auto">
              <CardContent className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('summaries.overview', 'Overview')}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{content.overview}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('summaries.achievements', 'Achievements')}</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {content.achievements.slice(0, 2).map((a, i) => (
                      <li key={i} className="truncate">{a}</li>
                    ))}
                    {content.achievements.length > 2 && (
                      <li className="text-muted-foreground/60">+{content.achievements.length - 2} more</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* AI Warning */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning">
                {t('summaries.aiWarning', 'This summary was AI-generated. Ensure content is accurate before sharing with your client.')}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Sharing Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('summaries.includePortal', 'Include in Client Portal')}</Label>
                    <p className="text-xs text-muted-foreground">{t('summaries.portalDesc', 'Client can view in their dashboard')}</p>
                  </div>
                </div>
                <Switch checked={includeInPortal} onCheckedChange={setIncludeInPortal} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('summaries.sendEmail', 'Send Email Notification')}</Label>
                    <p className="text-xs text-muted-foreground">{t('summaries.emailDesc', 'Notify client by email')}</p>
                  </div>
                </div>
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('summaries.scheduleLater', 'Schedule for Later')}</Label>
                    <p className="text-xs text-muted-foreground">{t('summaries.scheduleDesc', 'Share at a specific date')}</p>
                  </div>
                </div>
                <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
              </div>

              {isScheduled && (
                <div className="pl-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduleFor && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleFor ? format(scheduleFor, "PPP") : t("summaries.pickDate", "Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={scheduleFor} onSelect={setScheduleFor} disabled={(date) => date < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isScheduled 
                ? t('summaries.scheduled', 'Summary Scheduled!')
                : t('summaries.shared', 'Summary Shared!')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isScheduled && scheduleFor
                ? t('summaries.scheduledFor', 'Will be shared on {{date}}', { date: format(scheduleFor, 'd MMMM yyyy') })
                : t('summaries.sharedNow', '{{name}} will receive this summary shortly', { name: clientName })}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleApprove} disabled={approveSummary.isPending}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('summaries.approve', 'Approve')}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('common.back', 'Back')}
              </Button>
              <Button 
                onClick={handleShare} 
                disabled={shareSummary.isPending || scheduleSummary.isPending || (isScheduled && !scheduleFor)}
              >
                <Send className="w-4 h-4 mr-2" />
                {isScheduled 
                  ? t('summaries.schedule', 'Schedule')
                  : t('summaries.shareNow', 'Share Now')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}