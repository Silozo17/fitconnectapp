import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Eye, 
  ExternalLink, 
  Trash2, 
  Copy,
  Loader2,
  Globe,
  Lock,
  Sparkles
} from "lucide-react";
import { useCaseStudyGenerator } from "@/hooks/useCaseStudyGenerator";
import { CaseStudyGenerator } from "@/components/showcase/CaseStudyGenerator";
import { CaseStudyPreview } from "@/components/showcase/CaseStudyPreview";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { FeatureGate } from "@/components/FeatureGate";
import { format } from "date-fns";
import { toast } from "sonner";
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

const CoachCaseStudies = () => {
  const { t } = useTranslation("coach");
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [previewCaseStudy, setPreviewCaseStudy] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseStudyToDelete, setCaseStudyToDelete] = useState<string | null>(null);

  const {
    caseStudies,
    isLoading,
    deleteCaseStudy,
    togglePublish,
    isDeleting,
  } = useCaseStudyGenerator();

  const handleDelete = (id: string) => {
    setCaseStudyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (caseStudyToDelete) {
      deleteCaseStudy(caseStudyToDelete);
      setDeleteDialogOpen(false);
      setCaseStudyToDelete(null);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t("caseStudies.linkCopied"));
  };

  const publishedCount = caseStudies.filter((cs) => cs.is_published).length;

  return (
    <DashboardLayout
      title={t("caseStudies.title")}
      description={t("caseStudies.subtitle")}
    >
      <FeatureGate feature="case_study_generator">
      <PageHelpBanner
        pageKey="coach_case_studies"
        title="Client Transformation Stories"
        description="Generate professional case studies from your client showcases"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6">
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg sm:text-2xl font-bold">{caseStudies.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("caseStudies.totalCaseStudies")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-success/10 flex items-center justify-center">
                <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg sm:text-2xl font-bold">{publishedCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("caseStudies.published")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-xl sm:rounded-2xl col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-6 flex items-center justify-center h-full">
            <Button onClick={() => setGeneratorOpen(true)} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t("caseStudies.generate")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Case Studies List */}
      <Card variant="glass" className="glass-card rounded-2xl sm:rounded-3xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t("caseStudies.yourCaseStudies")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">{t("caseStudies.noCaseStudies")}</p>
              <Button onClick={() => setGeneratorOpen(true)} size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                {t("caseStudies.generateFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {caseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} variant="glass" className="glass-card">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="font-medium truncate text-sm sm:text-base">{caseStudy.title}</h3>
                          <Badge variant={caseStudy.is_published ? "default" : "secondary"} className="text-xs">
                            {caseStudy.is_published ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                {t("caseStudies.published")}
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                {t("caseStudies.draft")}
                              </>
                            )}
                          </Badge>
                        </div>
                        {(caseStudy.content as { summary?: string })?.summary && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                            {(caseStudy.content as { summary?: string }).summary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t("caseStudies.createdOn")} {format(new Date(caseStudy.created_at), "PPP")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start flex-wrap justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewCaseStudy(caseStudy)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {caseStudy.is_published && caseStudy.public_url && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyLink(caseStudy.public_url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a href={caseStudy.public_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </>
                        )}
                        <Button
                          variant={caseStudy.is_published ? "outline" : "default"}
                          size="sm"
                          className="text-xs"
                          onClick={() => togglePublish(caseStudy.id, !caseStudy.is_published)}
                        >
                          {caseStudy.is_published ? t("caseStudies.unpublish") : t("caseStudies.publish")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(caseStudy.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generator Modal */}
      <CaseStudyGenerator
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
      />

      {/* Preview Modal */}
      {previewCaseStudy && (
        <CaseStudyPreview
          open={!!previewCaseStudy}
          onOpenChange={() => setPreviewCaseStudy(null)}
          caseStudy={previewCaseStudy}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("caseStudies.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("caseStudies.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachCaseStudies;
