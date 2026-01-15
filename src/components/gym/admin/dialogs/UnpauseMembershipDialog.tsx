import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGym } from "@/contexts/GymContext";
import { supabase } from "@/integrations/supabase/client";
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
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface UnpauseMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: {
    id: string;
    member_id: string;
    plan?: { name: string };
  };
  memberName: string;
}

export function UnpauseMembershipDialog({
  open,
  onOpenChange,
  membership,
  memberName,
}: UnpauseMembershipDialogProps) {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  const unpauseMembership = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("gym_memberships")
        .update({
          status: "active",
          paused_at: null,
          pause_until: null,
          pause_reason: null,
        })
        .eq("id", membership.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-memberships", gym?.id] });
      toast.success("Membership resumed");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to resume membership:", error);
      toast.error("Failed to resume membership");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Resume Membership
          </AlertDialogTitle>
          <AlertDialogDescription>
            Resume <strong>{memberName}</strong>'s membership for{" "}
            <strong>{membership.plan?.name || "this plan"}</strong>? They will
            regain access to classes and billing will continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => unpauseMembership.mutate()}
            disabled={unpauseMembership.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {unpauseMembership.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Resume Membership
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
