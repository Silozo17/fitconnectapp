import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dumbbell, Clock, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useTrainingLogs, TrainingLog } from "@/hooks/useTrainingLogs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientTrainingLogsProps {
  clientId: string;
  clientName?: string;
}

const RPE_COLORS: Record<number, string> = {
  1: "bg-green-500/20 text-green-700",
  2: "bg-green-500/20 text-green-700",
  3: "bg-green-500/20 text-green-700",
  4: "bg-yellow-500/20 text-yellow-700",
  5: "bg-yellow-500/20 text-yellow-700",
  6: "bg-yellow-500/20 text-yellow-700",
  7: "bg-orange-500/20 text-orange-700",
  8: "bg-orange-500/20 text-orange-700",
  9: "bg-red-500/20 text-red-700",
  10: "bg-red-500/20 text-red-700",
};

const TrainingLogItem = ({ log }: { log: TrainingLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSets = log.exercises?.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0
  ) || 0;

  const totalVolume = log.exercises?.reduce((acc, ex) => {
    return acc + (ex.sets?.reduce((setAcc, set) => {
      return setAcc + (set.reps || 0) * (set.weight_kg || 0);
    }, 0) || 0);
  }, 0) || 0;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary" />
            {log.workout_name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(log.logged_at), "EEEE, d MMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {log.duration_minutes && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {log.duration_minutes} min
            </Badge>
          )}
          {log.rpe && (
            <Badge className={RPE_COLORS[log.rpe]}>
              RPE {log.rpe}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
        <span>{log.exercises?.length || 0} exercises</span>
        <span>•</span>
        <span>{totalSets} sets</span>
        {totalVolume > 0 && (
          <>
            <span>•</span>
            <span>{totalVolume.toLocaleString()} kg volume</span>
          </>
        )}
      </div>

      {log.notes && (
        <p className="text-sm text-muted-foreground italic mb-2">{log.notes}</p>
      )}

      {log.exercises && log.exercises.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
              <span className="text-xs">Exercise details</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {log.exercises.map((exercise, idx) => (
              <div key={exercise.id || idx} className="bg-secondary/50 rounded p-2">
                <p className="font-medium text-sm">{exercise.exercise_name}</p>
                {exercise.sets && exercise.sets.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {exercise.sets.map((set, setIdx) => (
                      <p key={set.id || setIdx} className="text-xs text-muted-foreground">
                        {set.is_warmup ? "Warmup" : `Set ${set.set_number}`}:
                        {set.reps && set.weight_kg && ` ${set.reps} × ${set.weight_kg}kg`}
                        {set.reps && !set.weight_kg && ` ${set.reps} reps`}
                        {set.rpe && ` (RPE ${set.rpe})`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export const ClientTrainingLogs = ({ clientId, clientName }: ClientTrainingLogsProps) => {
  const { data: logs, isLoading, error } = useTrainingLogs(clientId);

  // Check if access is denied
  const isAccessDenied = error?.message?.includes("permission") || 
    error?.message?.includes("policy");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || isAccessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Training Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {clientName || "This client"} has restricted access to their training logs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Training Logs
        </CardTitle>
        <CardDescription>
          {logs?.length || 0} workouts logged
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => (
              <TrainingLogItem key={log.id} log={log} />
            ))}
            {logs.length > 10 && (
              <p className="text-center text-sm text-muted-foreground">
                Showing 10 of {logs.length} workouts
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No training logs yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
