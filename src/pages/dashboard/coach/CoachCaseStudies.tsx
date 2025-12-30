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
      <PageHelpBanner
        pageKey="coach_case_studies"
        title="Client Transformation Stories"
        description="Generate professional case studies from your client showcases"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{caseStudies.length}</p>
                <p className="text-sm text-muted-foreground">{t("caseStudies.totalCaseStudies")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-sm text-muted-foreground">{t("caseStudies.published")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="glass-card rounded-2xl">
          <CardContent className="p-6 flex items-center justify-center h-full">
            <Button onClick={() => setGeneratorOpen(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t("caseStudies.generate")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Case Studies List */}
      <Card variant="glass" className="glass-card rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t("caseStudies.yourCaseStudies")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">{t("caseStudies.noCaseStudies")}</p>
              <Button onClick={() => setGeneratorOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("caseStudies.generateFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {caseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} variant="glass" className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">{caseStudy.title}</h3>
                          <Badge variant={caseStudy.is_published ? "default" : "secondary"}>
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
                        {caseStudy.content?.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {caseStudy.content.summary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t("caseStudies.createdOn")} {format(new Date(caseStudy.created_at), "PPP")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewCaseStudy(caseStudy)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {caseStudy.is_published && caseStudy.public_url && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(caseStudy.public_url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
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
                          onClick={() => togglePublish(caseStudy.id, !caseStudy.is_published)}
                        >
                          {caseStudy.is_published ? t("caseStudies.unpublish") : t("caseStudies.publish")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
    </DashboardLayout>
  );
};

export default CoachCaseStudies;
