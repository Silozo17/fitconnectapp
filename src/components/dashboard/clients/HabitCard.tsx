import { MoreVertical, Pencil, Trash2, Flame, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Habit, getHabitCategory, useUpdateHabit, useDeleteHabit } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/habit-icons";

interface HabitCardProps {
  habit: Habit;
  streak?: { current_streak: number; longest_streak: number };
  onEdit: (habit: Habit) => void;
}

const HabitCard = ({ habit, streak, onEdit }: HabitCardProps) => {
  const category = getHabitCategory(habit.category);
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  
  const handleToggleActive = () => {
    updateHabit.mutate({ id: habit.id, is_active: !habit.is_active });
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit.mutate({ id: habit.id, clientId: habit.client_id });
    }
  };
  
  const formatFrequency = () => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'specific_days') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return habit.specific_days?.map(d => days[d]).join(', ') || 'Specific days';
    }
    return habit.frequency;
  };
  
  return (
    <Card className={cn(!habit.is_active && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className={cn("shrink-0", category.color)}>{getCategoryIcon(category.icon, "h-6 w-6")}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium truncate">{habit.name}</h4>
                {!habit.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              {habit.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {habit.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn("text-xs", category.color)}>
                  {category.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFrequency()}
                </span>
                {habit.target_count > 1 && (
                  <span className="text-xs text-muted-foreground">
                    • {habit.target_count}x
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {streak && streak.current_streak > 0 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{streak.current_streak}</span>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive}>
                  {habit.is_active ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
