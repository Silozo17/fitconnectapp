import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { XCircle, Clock } from "lucide-react";

interface IAPUnsuccessfulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Error message from IAP - used to show custom content for specific errors */
  error?: string | null;
}

export const IAPUnsuccessfulDialog = ({
  open,
  onOpenChange,
  error,
}: IAPUnsuccessfulDialogProps) => {
  // Check if this is a "product in review" error (subscriptions pending Apple approval)
  const isProductInReview = error === 'PRODUCT_IN_REVIEW';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="text-center">
          {isProductInReview ? (
            <>
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-warning" />
              </div>
              <AlertDialogTitle className="text-center">
                Subscriptions Coming Soon
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center space-y-2">
                <p>
                  Our subscription plans are currently being reviewed by Apple and will be available shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please try again in a few hours. We apologize for the inconvenience!
                </p>
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center">
                Payment Unsuccessful
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Your payment was unsuccessful, please try again.
              </AlertDialogDescription>
            </>
          )}
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
