import { useState } from "react";
import { useTranslation } from "react-i18next";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, BarChart3, Scale, Percent, TrendingUp, Calendar } from "lucide-react";
import { useMyProgress } from "@/hooks/useClientProgress";
import { LogProgressModal } from "@/components/progress/LogProgressModal";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { ProgressEntryCard } from "@/components/progress/ProgressEntryCard";
import { AIProgressInsights } from "@/components/ai/AIProgressInsights";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

const ClientProgress = () => {
  const { t } = useTranslation('client');
  const { data, isLoading, error } = useMyProgress();
  const [logModalOpen, setLogModalOpen] = useState(false);

  const progress = data?.progress || [];
  const clientId = data?.clientId;

  // Safe array access with guards
  const latestEntry = progress.length > 0 ? progress[progress.length - 1] : null;
  const previousEntry = progress.length > 1 ? progress[progress.length - 2] : null;

  const weightChange =
    latestEntry?.weight_kg != null && previousEntry?.weight_kg != null
      ? Number(latestEntry.weight_kg) - Number(previousEntry.weight_kg)
      : null;

  const bodyFatChange =
    latestEntry?.body_fat_percentage != null && previousEntry?.body_fat_percentage != null
      ? Number(latestEntry.body_fat_percentage) - Number(previousEntry.body_fat_percentage)
      : null;

  return (
    <ClientDashboardLayout
      title={t('progress.title')}
      description={t('progress.subtitle')}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">{t('progress.pageTitle')}</h1>
          <p className="text-muted-foreground text-lg mt-1">{t('progress.description')}</p>
        </div>
        <Button onClick={() => setLogModalOpen(true)} size="lg" className="rounded-2xl h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          {t('progress.logProgress')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : progress.length === 0 ? (
        /* Empty State */
        <Card className="rounded-3xl border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">{t('progress.noData')}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-lg">
              {t('progress.noDataDescription')}
            </p>
            <Button onClick={() => setLogModalOpen(true)} size="lg" className="rounded-2xl h-12 px-8">
              <Plus className="w-5 h-5 mr-2" />
              {t('progress.logFirstEntry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Scale className="w-7 h-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{t('progress.currentWeight')}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {latestEntry?.weight_kg ? Number(latestEntry.weight_kg).toFixed(1) : "-"} kg
                    </p>
                    {weightChange !== null && (
                      <p className={`text-sm font-medium ${weightChange < 0 ? "text-success" : "text-warning"}`}>
                        {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Percent className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{t('progress.bodyFat')}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {latestEntry?.body_fat_percentage ? Number(latestEntry.body_fat_percentage).toFixed(1) : "-"}%
                    </p>
                    {bodyFatChange !== null && (
                      <p className={`text-sm font-medium ${bodyFatChange < 0 ? "text-success" : "text-warning"}`}>
                        {bodyFatChange > 0 ? "+" : ""}{bodyFatChange.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-7 h-7 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{t('progress.totalEntries')}</p>
                    <p className="text-2xl font-bold text-foreground">{progress.length}</p>
                    <p className="text-sm text-muted-foreground">{t('progress.logged')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-7 h-7 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{t('progress.photosCount')}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {progress.reduce((acc, p) => acc + ((p.photo_urls as string[])?.length || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('progress.uploaded')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts & History Tabs */}
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="bg-secondary/50 rounded-2xl p-1.5 h-auto">
              <TabsTrigger value="charts" className="rounded-xl px-6 py-2.5">{t('progress.charts')}</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6 py-2.5">{t('progress.history')}</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl px-6 py-2.5">{t('progress.insights')}</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart data={progress} type="weight" />
                <ProgressChart data={progress} type="bodyFat" />
              </div>
              <ProgressChart data={progress} type="measurements" />
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {progress.slice().reverse().map((entry) => (
                  <ProgressEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <AIProgressInsights progressData={progress} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Log Progress Modal */}
      {clientId && (
        <LogProgressModal
          open={logModalOpen}
          onOpenChange={setLogModalOpen}
          clientId={clientId}
        />
      )}
    </ClientDashboardLayout>
  );
};

export default ClientProgress;
