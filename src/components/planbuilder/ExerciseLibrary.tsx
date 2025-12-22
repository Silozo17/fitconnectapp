import { useState } from "react";
import { Search, Plus, Dumbbell, Video, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExercises, useExerciseCategories, Exercise } from "@/hooks/useExercises";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";

interface ExerciseLibraryProps {
  onAddExercise: (exercise: Exercise) => void;
  onCreateCustom: () => void;
}

const ExerciseLibrary = ({ onAddExercise, onCreateCustom }: ExerciseLibraryProps) => {
  const { t } = useTranslation('coach');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: categories, isLoading: categoriesLoading } = useExerciseCategories();
  const { data: exercises, isLoading: exercisesLoading } = useExercises(
    selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery || undefined
  );

  const getCategoryColor = (color: string | null) => {
    const colors: Record<string, string> = {
      red: "bg-red-500/20 text-red-400",
      blue: "bg-blue-500/20 text-blue-400",
      orange: "bg-orange-500/20 text-orange-400",
      purple: "bg-purple-500/20 text-purple-400",
      green: "bg-green-500/20 text-green-400",
      yellow: "bg-yellow-500/20 text-yellow-400",
      pink: "bg-pink-500/20 text-pink-400",
      cyan: "bg-cyan-500/20 text-cyan-400",
    };
    return colors[color || "blue"] || "bg-primary/20 text-primary";
  };

  return (
    <div className="card-glow rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-bold text-foreground mb-4">
          {t('workoutBuilder.exerciseLibrary.title')}
        </h3>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('workoutBuilder.exerciseLibrary.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t('workoutBuilder.exerciseLibrary.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('workoutBuilder.exerciseLibrary.allCategories')}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-2">
          {exercisesLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : exercises?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('workoutBuilder.exerciseLibrary.noExercises')}</p>
            </div>
          ) : (
            exercises?.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors group"
                onClick={() => onAddExercise(exercise)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(exercise.category?.color || null)}`}>
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{exercise.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {exercise.category?.name || t('workoutBuilder.exerciseLibrary.uncategorized')}
                      </span>
                      {exercise.video_url && (
                        <Video className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={onCreateCustom}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('workoutBuilder.exerciseLibrary.createCustom')}
        </Button>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
