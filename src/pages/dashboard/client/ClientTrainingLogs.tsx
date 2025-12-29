import { useState } from "react";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Dumbbell, Clock, Flame, ChevronDown, ChevronUp, Trash2, Edit2, Calendar } from "lucide-react";
import { useTrainingLogs, useDeleteTrainingLog, TrainingLog } from "@/hooks/useTrainingLogs";
import { LogWorkoutModal } from "@/components/training/LogWorkoutModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RPE_COLORS: Record<number, string> = {
  1: "bg-green-500/20 text-green-700 dark:text-green-400",
  2: "bg-green-500/20 text-green-700 dark:text-green-400",
  3: "bg-green-500/20 text-green-700 dark:text-green-400",
  4: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  5: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  6: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  7: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  8: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  9: "bg-red-500/20 text-red-700 dark:text-red-400",
  10: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const FATIGUE_COLORS = {
  low: "bg-green-500/20 text-green-700 dark:text-green-400",
  moderate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
};

interface TrainingLogCardProps {
  log: TrainingLog;
  onEdit: () => void;
  onDelete: () => void;
}

const TrainingLogCard = ({ log, onEdit, onDelete }: TrainingLogCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSets = log.exercises?.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0
  ) || 0;

  const totalVolume = log.exercises?.reduce((acc, ex) => {
    return (
      acc +
      (ex.sets?.reduce((setAcc, set) => {
        return setAcc + (set.reps || 0) * (set.weight_kg || 0);
      }, 0) || 0)
    );
  }, 0) || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              {log.workout_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(log.logged_at), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 mb-3">
          {log.duration_minutes && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {log.duration_minutes} min
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            {log.exercises?.length || 0} exercises
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {totalSets} sets
          </Badge>
          {totalVolume > 0 && (
            <Badge variant="secondary" className="gap-1">
              {totalVolume.toLocaleString()} kg volume
            </Badge>
          )}
          {log.rpe && (
            <Badge className={RPE_COLORS[log.rpe]}>
              RPE {log.rpe}
            </Badge>
          )}
          {log.fatigue_level && (
            <Badge className={FATIGUE_COLORS[log.fatigue_level]}>
              {log.fatigue_level} fatigue
            </Badge>
          )}
        </div>

        {log.notes && (
          <p className="text-sm text-muted-foreground mb-3">{log.notes}</p>
        )}

        {/* Expandable Exercise Details */}
        {log.exercises && log.exercises.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm">View exercise details</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="space-y-4">
                {log.exercises.map((exercise, idx) => (
                  <div key={exercise.id || idx} className="bg-secondary/50 rounded-lg p-3">
                    <h4 className="font-medium mb-2">{exercise.exercise_name}</h4>
                    {exercise.sets && exercise.sets.length > 0 && (
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIdx) => (
                          <div
                            key={set.id || setIdx}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <span className="w-16 shrink-0">
                              {set.is_warmup ? "Warmup" : `Set ${set.set_number}`}
                            </span>
                            {set.reps && set.weight_kg && (
                              <span>
                                {set.reps} × {set.weight_kg} kg
                              </span>
                            )}
                            {set.reps && !set.weight_kg && (
                              <span>{set.reps} reps</span>
                            )}
                            {set.duration_seconds && (
                              <span>{set.duration_seconds}s</span>
                            )}
                            {set.distance_meters && (
                              <span>{set.distance_meters}m</span>
                            )}
                            {set.rpe && (
                              <Badge variant="outline" className="text-xs">
                                RPE {set.rpe}
                              </Badge>
                            )}
                            {set.is_drop_set && (
                              <Badge variant="outline" className="text-xs">
                                Drop
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

const ClientTrainingLogs = () => {
  const { data: logs, isLoading } = useTrainingLogs();
  const deleteLog = useDeleteTrainingLog();
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState<TrainingLog | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (log: TrainingLog) => {
    setEditingLog(log);
    setShowLogModal(true);
  };

  const handleDelete = (logId: string) => {
    setDeleteConfirmId(logId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteLog.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleModalClose = () => {
    setShowLogModal(false);
    setEditingLog(null);
  };

  if (isLoading) {
    return (
      <ClientDashboardLayout title="Training Logs">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout
      title="Training Logs"
      description="Track your workouts and monitor your progress"
    >
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Training Logs</h1>
            <p className="text-muted-foreground">
              Log your workouts to track progress over time
            </p>
          </div>
          <Button onClick={() => setShowLogModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        </div>

        {logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <TrainingLogCard
                key={log.id}
                log={log}
                onEdit={() => handleEdit(log)}
                onDelete={() => handleDelete(log.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg mb-1">No workouts logged yet</h3>
                <p className="text-sm mb-4">
                  Start tracking your training to monitor progress and improvements
                </p>
                <Button onClick={() => setShowLogModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <LogWorkoutModal
        open={showLogModal}
        onOpenChange={handleModalClose}
        editingLog={editingLog}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout log and all its exercises. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientDashboardLayout>
  );
};

export default ClientTrainingLogs;
