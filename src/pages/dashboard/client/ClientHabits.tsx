import { Flame, Target, Trophy, Calendar } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTodaysHabits, useMyHabits } from "@/hooks/useHabits";
import TodayHabitCard from "@/components/habits/TodayHabitCard";
import HabitStreakCard from "@/components/habits/HabitStreakCard";
import HabitCalendarHeatmap from "@/components/habits/HabitCalendarHeatmap";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DashboardSectionHeader, MetricCard, ContentSection, StatsGrid } from "@/components/shared";

const ClientHabits = () => {
  const { data: todaysHabits, completedCount, totalCount, isLoading: todayLoading } = useTodaysHabits();
  const { data: allHabits, isLoading: habitsLoading } = useMyHabits();
  
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Calculate total streaks
  const totalCurrentStreak = allHabits?.reduce((sum, h) => sum + (h.streak?.current_streak || 0), 0) || 0;
  const streakValues = allHabits?.map(h => h.streak?.longest_streak || 0) || [];
  const bestStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;
  const totalCompletions = allHabits?.reduce((sum, h) => sum + (h.streak?.total_completions || 0), 0) || 0;
  
  const isLoading = todayLoading || habitsLoading;
  
  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_habits"
        title="Build Healthy Routines"
        description="Track daily habits assigned by your coach and build streaks"
      />
      <div className="space-y-11">
        {/* Header */}
        <DashboardSectionHeader
          title="My Habits"
          description="Track your daily habits and build healthy routines"
          className="mb-0"
        />
        
        {/* Today's Progress - Hero Card */}
        <ContentSection colorTheme="primary" className="p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">Today's Progress</h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                {completedCount} of {totalCount} habits completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-5xl font-bold text-primary font-display">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 sm:h-4 rounded-full" />
        </ContentSection>
        
        {/* Stats Cards */}
        <StatsGrid columns={3}>
          <MetricCard
            icon={Flame}
            value={totalCurrentStreak}
            label="Streak Days"
            colorTheme="orange"
          />
          <MetricCard
            icon={Trophy}
            value={bestStreak}
            label="Best Streak"
            colorTheme="yellow"
          />
          <MetricCard
            icon={Target}
            value={totalCompletions}
            label="Completions"
            colorTheme="primary"
          />
        </StatsGrid>
        
        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-secondary/50 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 h-auto w-full justify-start">
            <TabsTrigger value="today" className="rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden xs:inline">Today</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Flame className="h-4 w-4" />
              <span className="hidden xs:inline">Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden xs:inline">History</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Today's Habits */}
          <TabsContent value="today" className="space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <>
                <ShimmerSkeleton className="h-24 w-full rounded-2xl" />
                <ShimmerSkeleton className="h-24 w-full rounded-2xl" />
                <ShimmerSkeleton className="h-24 w-full rounded-2xl" />
              </>
            ) : todaysHabits && todaysHabits.length > 0 ? (
              todaysHabits.map((habit) => (
                <TodayHabitCard key={habit.id} habit={habit} />
              ))
            ) : (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2 font-display">No habits for today</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Your coach hasn't assigned any habits yet, or none are scheduled for today.
                </p>
              </ContentSection>
            )}
          </TabsContent>
          
          {/* Streaks */}
          <TabsContent value="streaks" className="space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                <ShimmerSkeleton className="h-48 w-full rounded-2xl" />
                <ShimmerSkeleton className="h-48 w-full rounded-2xl" />
              </div>
            ) : allHabits && allHabits.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {allHabits.map((habit) => (
                  <HabitStreakCard key={habit.id} habit={habit} />
                ))}
              </div>
            ) : (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Flame className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2 font-display">No streaks yet</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Complete habits daily to build your streaks!
                </p>
              </ContentSection>
            )}
          </TabsContent>
          
          {/* History */}
          <TabsContent value="history" className="space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <>
                <ShimmerSkeleton className="h-32 w-full rounded-2xl" />
                <ShimmerSkeleton className="h-32 w-full rounded-2xl" />
              </>
            ) : allHabits && allHabits.length > 0 ? (
              allHabits.map((habit) => (
                <HabitCalendarHeatmap
                  key={habit.id}
                  habitId={habit.id}
                  habitName={habit.name}
                />
              ))
            ) : (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Target className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2 font-display">No habit history</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Start completing habits to see your history here.
                </p>
              </ContentSection>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientHabits;
