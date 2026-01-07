import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MetricCard } from "@/components/shared/MetricCard";
import { ContentSection } from "@/components/shared/ContentSection";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import {
  Footprints,
  Moon,
  Heart,
  Flame,
  Dumbbell,
  UtensilsCrossed,
  Scale,
  Battery,
  MessageSquare,
  User,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSleepDuration } from "@/lib/format-utils";
import { useClientQuickViewData } from "@/hooks/useClientQuickViewData";

interface ClientQuickViewModalProps {
  clientId: string | null;
  open: boolean;
  onClose: () => void;
}

export const ClientQuickViewModal = memo(({
  clientId,
  open,
  onClose,
}: ClientQuickViewModalProps) => {
  const { t } = useTranslation("coach");
  const navigate = useNavigate();
  const { data, isLoading } = useClientQuickViewData(clientId);

  const handleMessage = () => {
    if (clientId) {
      navigate(`/dashboard/coach/messages?client=${clientId}`);
      onClose();
    }
  };

  const handleViewProfile = () => {
    if (clientId) {
      navigate(`/dashboard/coach/clients/${clientId}`);
      onClose();
    }
  };

  const firstName = data?.profile.firstName || "";
  const lastName = data?.profile.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Client";

  // Readiness color helpers
  const getReadinessColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "orange";
    return "red";
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[95vh] h-[95vh] flex flex-col outline-none">
        {/* Header with gradient */}
        <DrawerHeader className="relative pb-4 border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarImage
                  src={data?.profile.avatarUrl || undefined}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="text-xl font-bold text-foreground">
                  {fullName}
                </DrawerTitle>
                <p className="text-sm text-muted-foreground">
                  Last 7 days overview
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="p-4 pb-8 space-y-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : data ? (
              <>
                {/* Health Stats Grid */}
                <section>
                  <DashboardSectionHeader
                    title="Health Stats"
                    description="Average over last 7 days"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      icon={Footprints}
                      label="Avg Steps"
                      value={data.healthStats.avgSteps.toLocaleString()}
                      color="primary"
                      size="sm"
                    />
                    <MetricCard
                      icon={Moon}
                      label="Avg Sleep"
                      value={formatSleepDuration(data.healthStats.avgSleep)}
                      color="purple"
                      size="sm"
                    />
                    <MetricCard
                      icon={Heart}
                      label="Avg Heart Rate"
                      value={data.healthStats.avgHeartRate}
                      unit="bpm"
                      color="red"
                      size="sm"
                    />
                    <MetricCard
                      icon={Flame}
                      label="Avg Calories"
                      value={data.healthStats.avgCalories.toLocaleString()}
                      unit="kcal"
                      color="orange"
                      size="sm"
                    />
                  </div>
                </section>

                {/* Readiness Score */}
                {data.readiness && (
                  <section>
                    <DashboardSectionHeader title="Training Readiness" />
                    <ContentSection
                      colorTheme={getReadinessColor(data.readiness.score)}
                      className="rounded-3xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-3 rounded-2xl",
                            data.readiness.score >= 80 ? "bg-green-500/15" :
                            data.readiness.score >= 60 ? "bg-orange-500/15" : "bg-red-500/15"
                          )}>
                            <Battery className={cn(
                              "h-5 w-5",
                              data.readiness.score >= 80 ? "text-green-400" :
                              data.readiness.score >= 60 ? "text-orange-400" : "text-red-400"
                            )} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Readiness Score</p>
                            <p className="text-sm text-muted-foreground capitalize">{data.readiness.level}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-3xl font-bold",
                          data.readiness.score >= 80 ? "text-green-400" :
                          data.readiness.score >= 60 ? "text-orange-400" : "text-red-400"
                        )}>
                          {data.readiness.score}
                        </span>
                      </div>
                    </ContentSection>
                  </section>
                )}

                {/* Training Summary */}
                <section>
                  <DashboardSectionHeader
                    title="Training Activity"
                    description={`${data.training.totalWorkouts} workouts completed`}
                  />
                  <ContentSection colorTheme="blue" className="rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-2xl bg-blue-500/15">
                        <Dumbbell className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {data.training.totalWorkouts} workouts
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.training.totalMinutes} total minutes
                        </p>
                      </div>
                    </div>
                    {data.training.logs.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        {data.training.logs.slice(0, 3).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground truncate max-w-[60%]">
                              {log.name}
                            </span>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{log.duration}min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ContentSection>
                </section>

                {/* Nutrition Summary */}
                <section>
                  <DashboardSectionHeader
                    title="Nutrition Summary"
                    description={`${data.nutrition.mealsLogged} meals logged`}
                  />
                  <ContentSection colorTheme="green" className="rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-green-500/15">
                        <UtensilsCrossed className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {data.nutrition.avgCalories.toLocaleString()} avg cal/day
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.nutrition.mealsLogged} meals tracked
                        </p>
                      </div>
                    </div>
                  </ContentSection>
                </section>

                {/* Weight Progress */}
                {data.progress.latestWeight && (
                  <section>
                    <DashboardSectionHeader title="Weight Progress" />
                    <ContentSection colorTheme="cyan" className="rounded-3xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/15">
                          <Scale className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {data.progress.latestWeight} kg
                          </p>
                          {data.progress.weightChange !== null && (
                            <div className="flex items-center gap-1 text-sm">
                              {data.progress.weightChange > 0 ? (
                                <TrendingUp className="h-3 w-3 text-orange-400" />
                              ) : data.progress.weightChange < 0 ? (
                                <TrendingDown className="h-3 w-3 text-green-400" />
                              ) : null}
                              <span className={cn(
                                data.progress.weightChange > 0 ? "text-orange-400" :
                                data.progress.weightChange < 0 ? "text-green-400" : "text-muted-foreground"
                              )}>
                                {data.progress.weightChange > 0 ? "+" : ""}
                                {data.progress.weightChange} kg
                              </span>
                              <span className="text-muted-foreground">vs previous</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </ContentSection>
                  </section>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No data available for this client
              </div>
            )}
          </div>
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="sticky bottom-0 p-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={handleMessage}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={handleViewProfile}
            >
              <User className="h-4 w-4 mr-2" />
              Full Profile
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

ClientQuickViewModal.displayName = "ClientQuickViewModal";

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div>
      <ShimmerSkeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
    <div>
      <ShimmerSkeleton className="h-6 w-40 mb-4" />
      <ShimmerSkeleton className="h-32 rounded-3xl" />
    </div>
    <div>
      <ShimmerSkeleton className="h-6 w-36 mb-4" />
      <ShimmerSkeleton className="h-28 rounded-3xl" />
    </div>
  </div>
);
