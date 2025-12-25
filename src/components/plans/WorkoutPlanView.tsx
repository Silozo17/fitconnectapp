import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, RotateCcw, FileText, Play } from "lucide-react";
import { PlanDay, PlanExercise } from "@/hooks/useTrainingPlans";

interface WorkoutPlanViewProps {
  content: PlanDay[];
}

const WorkoutPlanView = ({ content }: WorkoutPlanViewProps) => {
  if (!content || content.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No workout content available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Workout Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {content.map((day, index) => (
            <AccordionItem 
              key={day.id || index} 
              value={day.id || `day-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    Day {index + 1}
                  </Badge>
                  <span className="font-medium">{day.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {day.exercises?.length || 0} exercises
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {day.exercises?.length > 0 ? (
                    day.exercises.map((exercise, exIndex) => (
                      <ExerciseCard key={exercise.id || exIndex} exercise={exercise} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      No exercises added for this day
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const ExerciseCard = ({ exercise }: { exercise: PlanExercise }) => {
  return (
    <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
      <div className="p-2 bg-background rounded-md">
        <Dumbbell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{exercise.exercise_name}</h4>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            {exercise.sets} sets × {exercise.reps}
          </span>
          {exercise.rest && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exercise.rest} rest
            </span>
          )}
        </div>
        {exercise.notes && (
          <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
            {exercise.notes}
          </p>
        )}
        {exercise.video_url && (
          <a 
            href={exercise.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
          >
            <Play className="h-3 w-3" />
            Watch demo
          </a>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanView;
