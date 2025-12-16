import { useState } from "react";
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

const ClientProgress = () => {
  const { data, isLoading, error } = useMyProgress();
  const [logModalOpen, setLogModalOpen] = useState(false);

  const progress = data?.progress || [];
  const clientId = data?.clientId;

  const latestEntry = progress[progress.length - 1];
  const previousEntry = progress[progress.length - 2];

  const weightChange =
    latestEntry?.weight_kg && previousEntry?.weight_kg
      ? Number(latestEntry.weight_kg) - Number(previousEntry.weight_kg)
      : null;

  const bodyFatChange =
    latestEntry?.body_fat_percentage && previousEntry?.body_fat_percentage
      ? Number(latestEntry.body_fat_percentage) - Number(previousEntry.body_fat_percentage)
      : null;

  return (
    <ClientDashboardLayout
      title="Progress"
      description="Track your fitness progress"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey over time</p>
        </div>
        <Button onClick={() => setLogModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Progress
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : progress.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
            <p className="text-muted-foreground mb-4">
              Start logging your progress to see trends and track your transformation.
            </p>
            <Button onClick={() => setLogModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="text-xl font-bold text-foreground">
                      {latestEntry?.weight_kg ? Number(latestEntry.weight_kg).toFixed(1) : "-"} kg
                    </p>
                    {weightChange !== null && (
                      <p className={`text-xs ${weightChange < 0 ? "text-green-500" : "text-orange-500"}`}>
                        {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-yellow-500/10">
                    <Percent className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Body Fat</p>
                    <p className="text-xl font-bold text-foreground">
                      {latestEntry?.body_fat_percentage ? Number(latestEntry.body_fat_percentage).toFixed(1) : "-"}%
                    </p>
                    {bodyFatChange !== null && (
                      <p className={`text-xs ${bodyFatChange < 0 ? "text-green-500" : "text-orange-500"}`}>
                        {bodyFatChange > 0 ? "+" : ""}{bodyFatChange.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <p className="text-xl font-bold text-foreground">{progress.length}</p>
                    <p className="text-xs text-muted-foreground">logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-accent/10">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Photos</p>
                    <p className="text-xl font-bold text-foreground">
                      {progress.reduce((acc, p) => acc + ((p.photo_urls as string[])?.length || 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">uploaded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts & History Tabs */}
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
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
