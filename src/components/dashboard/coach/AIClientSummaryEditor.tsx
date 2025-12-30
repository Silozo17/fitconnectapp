import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  Save, 
  ChevronDown,
  Clock,
  Edit3
} from "lucide-react";
import { format } from "date-fns";
import type { ClientSummary, GeneratedContent } from "@/hooks/useSummaryGeneration";
import { useApproveSummary, useUpdateSummaryEdits, useShareSummary } from "@/hooks/useSummaryGeneration";

interface AIClientSummaryEditorProps {
  summary: ClientSummary;
  clientName: string;
  onRegenerate?: (section?: string) => void;
  onClose?: () => void;
}

export function AIClientSummaryEditor({ 
  summary, 
  clientName,
  onRegenerate,
  onClose 
}: AIClientSummaryEditorProps) {
  const { t } = useTranslation();
  const [editedContent, setEditedContent] = useState<GeneratedContent>(
    summary.coach_edits || summary.generated_content
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const approveSummary = useApproveSummary();
  const updateEdits = useUpdateSummaryEdits();
  const shareSummary = useShareSummary();

  useEffect(() => {
    const original = summary.coach_edits || summary.generated_content;
    const changed = JSON.stringify(editedContent) !== JSON.stringify(original);
    setHasChanges(changed);
  }, [editedContent, summary]);

  const handleSectionEdit = (section: keyof GeneratedContent, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleSave = () => {
    updateEdits.mutate({
      summaryId: summary.id,
      edits: editedContent,
    });
  };

  const handleApprove = () => {
    if (hasChanges) {
      updateEdits.mutate({
        summaryId: summary.id,
        edits: editedContent,
      }, {
        onSuccess: () => {
          approveSummary.mutate({ summaryId: summary.id });
        }
      });
    } else {
      approveSummary.mutate({ summaryId: summary.id });
    }
  };

  const handleShare = () => {
    shareSummary.mutate({ summaryId: summary.id });
  };

  const statusStyles = {
    draft: 'bg-muted text-muted-foreground',
    approved: 'bg-success/20 text-success border-success/30',
    shared: 'bg-primary/20 text-primary border-primary/30',
  };

  const sections = [
    { key: 'overview' as const, label: t('summaries.overview', 'Overview') },
    { key: 'achievements' as const, label: t('summaries.achievements', 'Achievements') },
    { key: 'areasForImprovement' as const, label: t('summaries.areasForImprovement', 'Areas for Improvement') },
    { key: 'recommendations' as const, label: t('summaries.recommendations', 'Recommendations') },
  ];

  return (
    <Card variant="glass" className="max-w-4xl mx-auto">
      <CardHeader className="border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{clientName}</CardTitle>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {t('summaries.aiGenerated', 'AI Generated')}
              </Badge>
              <Badge className={statusStyles[summary.status]}>
                {summary.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t('summaries.generated', 'Generated')} {format(new Date(summary.created_at), 'd MMM yyyy, HH:mm')}
              {summary.version > 1 && ` • v${summary.version}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={() => onRegenerate()}>
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('summaries.regenerate', 'Regenerate')}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Editable Sections */}
          <div className="lg:col-span-2 space-y-4">
            {sections.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </label>
                  {onRegenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onRegenerate(key)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {t('summaries.regenerateSection', 'Regenerate')}
                    </Button>
                  )}
                </div>
                <Textarea
                  value={editedContent[key] || ''}
                  onChange={(e) => handleSectionEdit(key, e.target.value)}
                  className="min-h-[100px] resize-y break-words"
                  placeholder={t('summaries.enterContent', 'Enter content...')}
                />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Summary Metadata */}
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <h4 className="font-medium text-sm">{t('summaries.details', 'Summary Details')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summaries.type', 'Type')}</span>
                  <span className="capitalize">{summary.summary_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('summaries.version', 'Version')}</span>
                  <span>{summary.version}</span>
                </div>
                {summary.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summaries.approved', 'Approved')}</span>
                    <span>{format(new Date(summary.approved_at), 'd MMM')}</span>
                  </div>
                )}
                {summary.shared_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summaries.shared', 'Shared')}</span>
                    <span>{format(new Date(summary.shared_at), 'd MMM')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSave}
                  disabled={updateEdits.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.saveChanges', 'Save Changes')}
                </Button>
              )}
              
              {summary.status === 'draft' && (
                <Button
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveSummary.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('summaries.approve', 'Approve')}
                </Button>
              )}
              
              {summary.status === 'approved' && (
                <Button
                  className="w-full bg-primary"
                  onClick={handleShare}
                  disabled={shareSummary.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('summaries.shareWithClient', 'Share with Client')}
                </Button>
              )}
            </div>

            {/* AI Disclaimer */}
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning">
                {t('summaries.aiDisclaimer', 'This content was generated by AI. Please review and edit before sharing with clients.')}
              </p>
            </div>
          </div>
        </div>

        {/* Version History */}
        <Separator />
        <Collapsible open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              {t('summaries.versionHistory', 'Version History')}
              <ChevronDown className={`w-4 h-4 transition-transform ${showVersionHistory ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('summaries.currentVersion', 'Showing current version (v{{version}})', { version: summary.version })}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
