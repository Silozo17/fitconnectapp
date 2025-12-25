import { Flame, Target, Trophy, Calendar } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTodaysHabits, useMyHabits } from "@/hooks/useHabits";
import TodayHabitCard from "@/components/habits/TodayHabitCard";
import HabitStreakCard from "@/components/habits/HabitStreakCard";
import HabitCalendarHeatmap from "@/components/habits/HabitCalendarHeatmap";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";

const ClientHabits = () => {
  const { data: todaysHabits, completedCount, totalCount, isLoading: todayLoading } = useTodaysHabits();
  const { data: allHabits, isLoading: habitsLoading } = useMyHabits();
  
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Calculate total streaks
  const totalCurrentStreak = allHabits?.reduce((sum, h) => sum + (h.streak?.current_streak || 0), 0) || 0;
  const bestStreak = Math.max(...(allHabits?.map(h => h.streak?.longest_streak || 0) || [0]));
  const totalCompletions = allHabits?.reduce((sum, h) => sum + (h.streak?.total_completions || 0), 0) || 0;
  
  const isLoading = todayLoading || habitsLoading;
  
  return (
    <ClientDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">My Habits</h1>
          <p className="text-muted-foreground text-lg mt-1">Track your daily habits and build healthy routines</p>
        </div>
        
        {/* Today's Progress - Hero Card */}
        <Card className="rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 pointer-events-none" />
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-display">Today's Progress</h2>
                <p className="text-muted-foreground mt-1">
                  {completedCount} of {totalCount} habits completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-bold text-primary font-display">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-4 rounded-full" />
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
                <Flame className="h-7 w-7 text-orange-500" />
              </div>
              <p className="text-3xl font-bold font-display">{totalCurrentStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Streak Days</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-3">
                <Trophy className="h-7 w-7 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold font-display">{bestStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">Best Streak</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold font-display">{totalCompletions}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Completions</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="bg-secondary/50 rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="today" className="rounded-xl px-5 py-2.5 gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="streaks" className="rounded-xl px-5 py-2.5 gap-2">
              <Flame className="h-4 w-4" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-5 py-2.5 gap-2">
              <Target className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Today's Habits */}
          <TabsContent value="today" className="space-y-4">
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
              <Card className="rounded-3xl border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 font-display">No habits for today</h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Your coach hasn't assigned any habits yet, or none are scheduled for today.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Streaks */}
          <TabsContent value="streaks" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                <ShimmerSkeleton className="h-48 w-full rounded-3xl" />
                <ShimmerSkeleton className="h-48 w-full rounded-3xl" />
              </div>
            ) : allHabits && allHabits.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {allHabits.map((habit) => (
                  <HabitStreakCard key={habit.id} habit={habit} />
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                    <Flame className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 font-display">No streaks yet</h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Complete habits daily to build your streaks!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* History */}
          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <>
                <ShimmerSkeleton className="h-32 w-full rounded-3xl" />
                <ShimmerSkeleton className="h-32 w-full rounded-3xl" />
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
              <Card className="rounded-3xl border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                    <Target className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 font-display">No habit history</h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Start completing habits to see your history here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientHabits;
