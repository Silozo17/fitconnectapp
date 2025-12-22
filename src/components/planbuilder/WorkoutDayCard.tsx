import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanDay, PlanExercise } from "@/hooks/useTrainingPlans";
import SortableExerciseItem from "./SortableExerciseItem";
import { useTranslation } from "@/hooks/useTranslation";

interface WorkoutDayCardProps {
  day: PlanDay;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateDay: (updates: Partial<PlanDay>) => void;
  onDeleteDay: () => void;
  onAddExercise: () => void;
}

const WorkoutDayCard = ({
  day,
  isExpanded,
  onToggleExpand,
  onUpdateDay,
  onDeleteDay,
  onAddExercise,
}: WorkoutDayCardProps) => {
  const { t } = useTranslation('coach');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = day.exercises.findIndex((e) => e.id === active.id);
      const newIndex = day.exercises.findIndex((e) => e.id === over.id);
      
      const newExercises = arrayMove(day.exercises, oldIndex, newIndex);
      onUpdateDay({ exercises: newExercises });
    }
  };

  const handleUpdateExercise = (exerciseId: string, updates: Partial<PlanExercise>) => {
    const newExercises = day.exercises.map((e) =>
      e.id === exerciseId ? { ...e, ...updates } : e
    );
    onUpdateDay({ exercises: newExercises });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const newExercises = day.exercises.filter((e) => e.id !== exerciseId);
    onUpdateDay({ exercises: newExercises });
  };

  return (
    <div className="card-glow rounded-2xl overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground">{day.name}</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {day.exercises.length} {t('workoutBuilder.exerciseLibrary.exercises')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDay();
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border bg-secondary/10">
          <div className="mb-4">
            <Input
              value={day.name}
              onChange={(e) => onUpdateDay({ name: e.target.value })}
              className="font-medium"
              placeholder="Day name..."
            />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={day.exercises.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {day.exercises.map((exercise) => (
                  <SortableExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
                    onRemove={() => handleRemoveExercise(exercise.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            className="w-full mt-4 border-dashed border-primary/30 text-primary hover:bg-primary/10"
            onClick={onAddExercise}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('workoutBuilder.exerciseLibrary.addExercise')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutDayCard;
