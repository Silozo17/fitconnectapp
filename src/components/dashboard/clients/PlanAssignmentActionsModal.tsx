import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
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
  const { t } = useTranslation("coach");
  const [status, setStatus] = useState(assignment?.status || "active");
  const [startDate, setStartDate] = useState<Date | undefined>(
    assignment?.start_date ? new Date(assignment.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    assignment?.end_date ? new Date(assignment.end_date) : undefined
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Reset state when assignment changes
  useState(() => {
    if (assignment) {
      setStatus(assignment.status);
      setStartDate(assignment.start_date ? new Date(assignment.start_date) : undefined);
      setEndDate(assignment.end_date ? new Date(assignment.end_date) : undefined);
    }
  });

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("clientDetail.planActions.editAssignment")}</DialogTitle>
            <DialogDescription>
              {assignment.training_plan?.name || t("clientDetail.plans.workoutPlan")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Status */}
            <div className="grid gap-2">
              <Label>{t("clientDetail.planActions.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t("clientDetail.planActions.statusOptions.active")}
                  </SelectItem>
                  <SelectItem value="paused">
                    {t("clientDetail.planActions.statusOptions.paused")}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("clientDetail.planActions.statusOptions.completed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label>{t("clientDetail.planActions.startDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : t("clientDetail.planActions.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
            <div className="grid gap-2">
              <Label>{t("clientDetail.planActions.endDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : t("clientDetail.planActions.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleRemoveClick}
              disabled={isUpdating || isRemoving}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("clientDetail.planActions.removePlan")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || isRemoving}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("clientDetail.planActions.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clientDetail.planActions.confirmRemoveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clientDetail.planActions.confirmRemoveDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("clientDetail.planActions.removePlan")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
