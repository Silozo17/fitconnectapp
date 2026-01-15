import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useDeactivateGymStaff } from "@/hooks/gym/useGymStaffManagement";
import { Loader2, AlertTriangle } from "lucide-react";

interface RemoveStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string | null;
  staffName: string;
  onSuccess?: () => void;
}

export function RemoveStaffDialog({
  open,
  onOpenChange,
  staffId,
  staffName,
  onSuccess,
}: RemoveStaffDialogProps) {
  const [deleteType, setDeleteType] = useState<"deactivate" | "permanent">("deactivate");
  const deactivateStaff = useDeactivateGymStaff();

  const handleConfirm = async () => {
    if (!staffId) return;

    try {
      await deactivateStaff.mutateAsync({
        staffId,
        hardDelete: deleteType === "permanent",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Staff Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{staffName}</strong> from your team?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <RadioGroup
            value={deleteType}
            onValueChange={(v) => setDeleteType(v as "deactivate" | "permanent")}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 rounded-lg border p-3">
              <RadioGroupItem value="deactivate" id="deactivate" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="deactivate" className="font-medium cursor-pointer">
                  Deactivate (Recommended)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Staff member won't be able to access the system but their history is preserved.
                  You can reactivate them later.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-destructive/50 p-3">
              <RadioGroupItem value="permanent" id="permanent" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="permanent" className="font-medium cursor-pointer text-destructive">
                  Permanently Delete
                </Label>
                <p className="text-sm text-muted-foreground">
                  This will permanently remove the staff member and their associated records.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deactivateStaff.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deactivateStaff.isPending}
          >
            {deactivateStaff.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleteType === "permanent" ? "Delete Permanently" : "Deactivate"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}