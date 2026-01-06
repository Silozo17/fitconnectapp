import { useState } from "react";
import { useTranslation } from "react-i18next";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, BarChart3, Scale, Percent, TrendingUp, Calendar } from "lucide-react";
import { useMyProgress } from "@/hooks/useClientProgress";
import { LogProgressModal } from "@/components/progress/LogProgressModal";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { ProgressEntryCard } from "@/components/progress/ProgressEntryCard";
import { AIProgressInsights } from "@/components/ai/AIProgressInsights";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DashboardSectionHeader, MetricCard, ContentSection, StatsGrid } from "@/components/shared";

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

  const photosCount = progress.reduce((acc, p) => acc + ((p.photo_urls as string[])?.length || 0), 0);

  return (
    <ClientDashboardLayout
      title={t('progress.title')}
      description={t('progress.subtitle')}
    >
      <PageHelpBanner
        pageKey="client_progress"
        title="Track Your Journey"
        description="Log weight, measurements, and photos to visualize your progress over time"
      />
      
      <div className="space-y-11">
        {/* Header */}
        <DashboardSectionHeader
          title={t('progress.pageTitle')}
          description={t('progress.description')}
          action={
            <Button onClick={() => setLogModalOpen(true)} size="lg" className="rounded-2xl h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              {t('progress.logProgress')}
            </Button>
          }
          className="mb-0"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : progress.length === 0 ? (
          /* Empty State */
          <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
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
          </ContentSection>
        ) : (
          <>
            {/* Stats Cards */}
            <StatsGrid columns={4}>
              <MetricCard
                icon={Scale}
                value={latestEntry?.weight_kg ? `${Number(latestEntry.weight_kg).toFixed(1)}` : "-"}
                label={t('progress.currentWeight')}
                unit="kg"
                trend={weightChange !== null ? {
                  value: weightChange,
                  direction: weightChange < 0 ? "down" : "up",
                  suffix: " kg"
                } : undefined}
                colorTheme="primary"
              />

              <MetricCard
                icon={Percent}
                value={latestEntry?.body_fat_percentage ? `${Number(latestEntry.body_fat_percentage).toFixed(1)}` : "-"}
                label={t('progress.bodyFat')}
                unit="%"
                trend={bodyFatChange !== null ? {
                  value: bodyFatChange,
                  direction: bodyFatChange < 0 ? "down" : "up",
                  suffix: "%"
                } : undefined}
                colorTheme="yellow"
              />

              <MetricCard
                icon={TrendingUp}
                value={progress.length}
                label={t('progress.totalEntries')}
                description={t('progress.logged')}
                colorTheme="green"
              />

              <MetricCard
                icon={Calendar}
                value={photosCount}
                label={t('progress.photosCount')}
                description={t('progress.uploaded')}
                colorTheme="purple"
              />
            </StatsGrid>

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
      </div>

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
