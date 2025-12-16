import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { toast } from "sonner";

export const useAdminTeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const { mutateAsync: logAction } = useLogAdminAction();

  const getUserEmail = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "get_user_email", userId, userType: "team" },
      });

      if (error) throw error;
      return data?.email || null;
    } catch (error) {
      console.error("Failed to get user email:", error);
      return null;
    }
  };

  const updateStatus = async (
    userId: string,
    profileId: string,
    status: string,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_status",
          userId,
          profileId,
          status,
          reason,
          userType: "team",
        },
      });

      if (error) throw error;

      await logAction({
        action: `team_${status}`,
        entityType: "team_member",
        entityId: profileId,
        newValues: { status, reason },
      });

      toast.success(`Team member ${status === "active" ? "activated" : status}`);
      return true;
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (
    members: Array<{ id: string; user_id: string }>,
    status: string,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_update_status",
          users: members,
          status,
          reason,
          userType: "team",
        },
      });

      if (error) throw error;

      await logAction({
        action: `bulk_team_${status}`,
        entityType: "team_member",
        entityId: members.map((m) => m.id).join(","),
        newValues: { count: members.length, status, reason },
      });

      toast.success(`${members.length} team member(s) ${status === "active" ? "activated" : status}`);
      return true;
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (
    members: Array<{ id: string; user_id: string }>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_delete",
          users: members,
          userType: "team",
        },
      });

      if (error) throw error;

      await logAction({
        action: "bulk_team_delete",
        entityType: "team_member",
        entityId: members.map((m) => m.id).join(","),
        newValues: { count: members.length },
      });

      toast.success(`${members.length} team member(s) deleted`);
      return true;
    } catch (error: any) {
      toast.error("Failed to delete team members: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (userId: string, profileId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-password-reset", {
        body: { userId },
      });

      if (error) throw error;

      await logAction({
        action: "team_password_reset",
        entityType: "team_member",
        entityId: profileId,
      });

      return true;
    } catch (error: any) {
      toast.error("Failed to reset password: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserEmail,
    updateStatus,
    bulkUpdateStatus,
    bulkDelete,
    resetPassword,
  };
};
