import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { XCircle } from "lucide-react";

interface IAPUnsuccessfulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IAPUnsuccessfulDialog = ({
  open,
  onOpenChange,
}: IAPUnsuccessfulDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            Payment Unsuccessful
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your payment was unsuccessful, please try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="w-full" onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
