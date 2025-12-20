import { useTranslation } from "react-i18next";
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

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({ open, onStay, onLeave }: UnsavedChangesDialogProps) {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('unsavedChanges.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('unsavedChanges.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>
            {t('unsavedChanges.stayOnPage')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeave}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('unsavedChanges.leaveWithoutSaving')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
