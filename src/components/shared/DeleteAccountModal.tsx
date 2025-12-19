import { useState } from "react";
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

      toast.success("Account deleted successfully", {
        description: "Your account and all associated data have been permanently removed.",
      });

      // Sign out and redirect
      await signOut();
      navigate("/");
    } catch (error: unknown) {
      logError("DeleteAccountModal", error);
      toast.error("Failed to delete account", {
        description: getErrorMessage(error, "Please try again or contact support."),
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
        "Your profile and personal information",
        "All sessions and bookings",
        "Messages and conversations",
        "Progress data and photos",
        "Connections with coaches",
        "Subscriptions and packages",
        "Achievements and badges",
      ]
    : [
        "Your coach profile and business information",
        "All client relationships",
        "Sessions and bookings",
        "Messages and conversations",
        "Training and nutrition plans",
        "Packages and subscription plans",
        "Reviews and ratings",
        "Verification documents",
      ];

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Your Account?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                This action is <strong>permanent</strong> and cannot be reversed. 
                The following will be deleted:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {deletedItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirm-delete">
            Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Type DELETE"
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
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete My Account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
