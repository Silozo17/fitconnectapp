import { useState } from "react";
import { Plus, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientHabits, Habit } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HabitCard from "./HabitCard";
import CreateHabitModal from "./CreateHabitModal";
import { useTranslation } from "@/hooks/useTranslation";

interface HabitManagerProps {
  coachId: string;
  clientId: string;
}

const HabitManager = ({ coachId, clientId }: HabitManagerProps) => {
  const { t } = useTranslation("coach");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  
  const { data: habits, isLoading } = useClientHabits(clientId);
  
  // Get streaks for all habits
  const { data: streaks } = useQuery({
    queryKey: ['client-habit-streaks', clientId],
    queryFn: async () => {
      const habitIds = habits?.map(h => h.id) || [];
      if (habitIds.length === 0) return [];
      
      const { data } = await supabase
        .from('habit_streaks')
        .select('*')
        .in('habit_id', habitIds);
      
      return data || [];
    },
    enabled: !!habits?.length,
  });
  
  const getStreakForHabit = (habitId: string) => {
    return streaks?.find(s => s.habit_id === habitId);
  };
  
  // Calculate stats
  const activeHabits = habits?.filter(h => h.is_active) || [];
  const totalStreaks = streaks?.reduce((sum, s) => sum + (s.current_streak || 0), 0) || 0;
  const streakValues = streaks?.map(s => s.longest_streak || 0) || [];
  const bestStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;
  
  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsCreateModalOpen(true);
  };
  
  const handleCloseModal = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) setEditingHabit(undefined);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{activeHabits.length}</p>
            <p className="text-xs text-muted-foreground">{t('clientDetail.habits.activeHabits')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{totalStreaks}</p>
            <p className="text-xs text-muted-foreground">{t('clientDetail.habits.totalStreakDays')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{bestStreak}</p>
            <p className="text-xs text-muted-foreground">{t('clientDetail.habits.bestStreak')}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('clientDetail.habits.assignedHabits')}</h3>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('clientDetail.habits.addHabit')}
        </Button>
      </div>
      
      {/* Habits List */}
      {habits && habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getStreakForHabit(habit.id)}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">{t('clientDetail.habits.noHabitsYet')}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('clientDetail.habits.createHabitsDescription')}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('clientDetail.habits.createFirstHabit')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Create/Edit Modal */}
      <CreateHabitModal
        open={isCreateModalOpen}
        onOpenChange={handleCloseModal}
        coachId={coachId}
        clientId={clientId}
        habit={editingHabit}
      />
    </div>
  );
};

export default HabitManager;
