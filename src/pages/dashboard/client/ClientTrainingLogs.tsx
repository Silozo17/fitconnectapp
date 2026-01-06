import { useState } from "react";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Dumbbell, Clock, ChevronDown, ChevronUp, Trash2, Edit2, Calendar } from "lucide-react";
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
import { DashboardSectionHeader, ContentSection } from "@/components/shared";

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
    <ContentSection colorTheme="primary" className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            {log.workout_name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 ml-12">
            <Calendar className="w-4 h-4" />
            {format(new Date(log.logged_at), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-xl">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive rounded-xl">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-2 mb-3">
        {log.duration_minutes && (
          <Badge variant="secondary" className="gap-1 rounded-lg">
            <Clock className="w-3 h-3" />
            {log.duration_minutes} min
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1 rounded-lg">
          {log.exercises?.length || 0} exercises
        </Badge>
        <Badge variant="secondary" className="gap-1 rounded-lg">
          {totalSets} sets
        </Badge>
        {totalVolume > 0 && (
          <Badge variant="secondary" className="gap-1 rounded-lg">
            {totalVolume.toLocaleString()} kg volume
          </Badge>
        )}
        {log.rpe && (
          <Badge className={`${RPE_COLORS[log.rpe]} rounded-lg`}>
            RPE {log.rpe}
          </Badge>
        )}
        {log.fatigue_level && (
          <Badge className={`${FATIGUE_COLORS[log.fatigue_level]} rounded-lg`}>
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
            <Button variant="ghost" size="sm" className="w-full justify-between rounded-xl">
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
                <div key={exercise.id || idx} className="bg-secondary/50 rounded-xl p-3">
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
                            <Badge variant="outline" className="text-xs rounded-lg">
                              RPE {set.rpe}
                            </Badge>
                          )}
                          {set.is_drop_set && (
                            <Badge variant="outline" className="text-xs rounded-lg">
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
    </ContentSection>
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
      <div className="max-w-4xl space-y-11">
        <DashboardSectionHeader
          title="Training Logs"
          description="Log your workouts to track progress over time"
          action={
            <Button onClick={() => setShowLogModal(true)} className="rounded-2xl h-11">
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          }
          className="mb-0"
        />

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
          <ContentSection colorTheme="muted" className="py-12 text-center border-dashed">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-1 font-display">No workouts logged yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking your training to monitor progress and improvements
            </p>
            <Button onClick={() => setShowLogModal(true)} className="rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </Button>
          </ContentSection>
        )}
      </div>

      <LogWorkoutModal
        open={showLogModal}
        onOpenChange={handleModalClose}
        editingLog={editingLog}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout log and all its exercises. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientDashboardLayout>
  );
};

export default ClientTrainingLogs;
