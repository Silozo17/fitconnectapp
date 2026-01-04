import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

interface PlanAssignment {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  training_plan?: {
    id: string;
    name: string;
    plan_type: string;
  } | null;
}

interface PlanAssignmentActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: PlanAssignment | null;
  onUpdate: (data: { status: string; startDate?: Date; endDate?: Date }) => void;
  onRemove: () => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export function PlanAssignmentActionsModal({
  open,
  onOpenChange,
  assignment,
  onUpdate,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}: PlanAssignmentActionsModalProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(assignment?.status || "active");
  const [startDate, setStartDate] = useState<Date | undefined>(
    assignment?.start_date ? new Date(assignment.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    assignment?.end_date ? new Date(assignment.end_date) : undefined
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Reset state when assignment changes
  useEffect(() => {
    if (assignment) {
      setStatus(assignment.status);
      setStartDate(assignment.start_date ? new Date(assignment.start_date) : undefined);
      setEndDate(assignment.end_date ? new Date(assignment.end_date) : undefined);
    }
  }, [assignment]);

  const handleUpdate = () => {
    onUpdate({
      status,
      startDate,
      endDate,
    });
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = () => {
    setShowRemoveConfirm(false);
    onRemove();
  };

  if (!assignment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("coach:clientDetail.planActions.editAssignment")}</DialogTitle>
            <DialogDescription>
              {assignment.training_plan?.name || t("coach:clientDetail.plans.workoutPlan")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-4 py-4">
              {/* Status */}
              <div className="grid gap-2 min-w-0">
                <Label>{t("coach:clientDetail.planActions.status")}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full min-w-0 max-w-full overflow-hidden">
                    <span className="flex-1 min-w-0 truncate">
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("coach:clientDetail.planActions.statusOptions.active")}
                    </SelectItem>
                    <SelectItem value="paused">
                      {t("coach:clientDetail.planActions.statusOptions.paused")}
                    </SelectItem>
                    <SelectItem value="completed">
                      {t("coach:clientDetail.planActions.statusOptions.completed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="grid gap-2 min-w-0">
                <Label>{t("coach:clientDetail.planActions.startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full min-w-0 max-w-full overflow-hidden justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="flex-1 min-w-0 truncate">
                        {startDate ? format(startDate, "PPP") : t("coach:clientDetail.planActions.selectDate")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="grid gap-2 min-w-0">
                <Label>{t("coach:clientDetail.planActions.endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full min-w-0 max-w-full overflow-hidden justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="flex-1 min-w-0 truncate">
                        {endDate ? format(endDate, "PPP") : t("coach:clientDetail.planActions.selectDate")}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleRemoveClick}
              disabled={isUpdating || isRemoving}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("coach:clientDetail.planActions.removePlan")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common:common.cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || isRemoving}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("coach:clientDetail.planActions.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("coach:clientDetail.planActions.confirmRemoveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("coach:clientDetail.planActions.confirmRemoveDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("coach:clientDetail.planActions.removePlan")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
