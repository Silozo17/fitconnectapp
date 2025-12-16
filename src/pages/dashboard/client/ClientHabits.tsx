import { useState } from "react";
import { Flame, Target, Trophy, Calendar } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodaysHabits, useMyHabits } from "@/hooks/useHabits";
import TodayHabitCard from "@/components/habits/TodayHabitCard";
import HabitStreakCard from "@/components/habits/HabitStreakCard";
import HabitCalendarHeatmap from "@/components/habits/HabitCalendarHeatmap";

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Habits</h1>
          <p className="text-muted-foreground">Track your daily habits and build healthy routines</p>
        </div>
        
        {/* Today's Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Today's Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} habits completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
              <p className="text-2xl font-bold">{totalCurrentStreak}</p>
              <p className="text-xs text-muted-foreground">Total Streak Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="streaks">
              <Flame className="h-4 w-4 mr-2" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="history">
              <Target className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Today's Habits */}
          <TabsContent value="today" className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : todaysHabits && todaysHabits.length > 0 ? (
              todaysHabits.map((habit) => (
                <TodayHabitCard key={habit.id} habit={habit} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No habits for today</h3>
                  <p className="text-sm text-muted-foreground">
                    Your coach hasn't assigned any habits yet, or none are scheduled for today.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Streaks */}
          <TabsContent value="streaks" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : allHabits && allHabits.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {allHabits.map((habit) => (
                  <HabitStreakCard key={habit.id} habit={habit} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flame className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No streaks yet</h3>
                  <p className="text-sm text-muted-foreground">
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
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
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
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No habit history</h3>
                  <p className="text-sm text-muted-foreground">
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
