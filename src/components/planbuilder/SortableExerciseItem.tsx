import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Clock, Video, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlanExercise } from "@/hooks/useTrainingPlans";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SortableExerciseItemProps {
  exercise: PlanExercise;
  onUpdate: (updates: Partial<PlanExercise>) => void;
  onRemove: () => void;
}

const SortableExerciseItem = ({ exercise, onUpdate, onRemove }: SortableExerciseItemProps) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Collapsible open={videoOpen} onOpenChange={setVideoOpen}>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-card rounded-xl border border-border ${isDragging ? "shadow-glow" : ""}`}
      >
        <div className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{exercise.exercise_name}</p>
            {exercise.video_url && (
              <CollapsibleTrigger asChild>
                <button
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Video className="w-3 h-3" />
                  {videoOpen ? "Hide video" : "Watch video"}
                </button>
              </CollapsibleTrigger>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm flex-shrink-0">
            <Input
              value={exercise.sets}
              onChange={(e) => onUpdate({ sets: parseInt(e.target.value) || 0 })}
              className="w-14 h-8 text-center"
              placeholder="Sets"
              type="number"
              min={1}
            />
            <span className="text-muted-foreground">×</span>
            <Input
              value={exercise.reps}
              onChange={(e) => onUpdate({ reps: e.target.value })}
              className="w-20 h-8 text-center"
              placeholder="Reps"
            />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Input
                value={exercise.rest}
                onChange={(e) => onUpdate({ rest: e.target.value })}
                className="w-16 h-8 text-center"
                placeholder="Rest"
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-destructive flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CollapsibleContent>
          {exercise.video_url && (
            <div className="px-3 pb-3">
              <VideoEmbed url={exercise.video_url} restricted title={exercise.exercise_name} />
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SortableExerciseItem;
