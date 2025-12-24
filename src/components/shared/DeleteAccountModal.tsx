import { useState } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, logError } from "@/lib/error-utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "client" | "coach";
}

export const DeleteAccountModal = ({ open, onOpenChange, role }: DeleteAccountModalProps) => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(t('deleteAccount.success'), {
        description: t('deleteAccount.successDescription'),
      });

      await signOut();
      navigate("/get-started");
    } catch (error: unknown) {
      logError("DeleteAccountModal", error);
      toast.error(t('deleteAccount.error'), {
        description: getErrorMessage(error, t('deleteAccount.errorDescription')),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      onOpenChange(false);
    }
  };

  const deletedItems = role === "client" 
    ? [
        t('deleteAccount.clientItems.profile'),
        t('deleteAccount.clientItems.sessions'),
        t('deleteAccount.clientItems.messages'),
        t('deleteAccount.clientItems.progress'),
        t('deleteAccount.clientItems.connections'),
        t('deleteAccount.clientItems.subscriptions'),
        t('deleteAccount.clientItems.achievements'),
      ]
    : [
        t('deleteAccount.coachItems.profile'),
        t('deleteAccount.coachItems.clients'),
        t('deleteAccount.coachItems.sessions'),
        t('deleteAccount.coachItems.messages'),
        t('deleteAccount.coachItems.plans'),
        t('deleteAccount.coachItems.packages'),
        t('deleteAccount.coachItems.reviews'),
        t('deleteAccount.coachItems.documents'),
      ];

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('deleteAccount.title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('deleteAccount.permanent')) }} />
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {deletedItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirm-delete" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('deleteAccount.confirmLabel')) }} />
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder={t('deleteAccount.confirmPlaceholder')}
            disabled={isDeleting}
            className="font-mono"
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            {t('deleteAccount.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('deleteAccount.deleteButton')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
