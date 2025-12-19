import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import { getErrorMessage, logError } from "@/lib/error-utils";

export const useAdminTeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const logAction = useLogAdminAction();

  const getUserEmail = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "get_user_email", userId, userType: "team" },
      });

      if (error) throw error;
      return data?.email || null;
    } catch (error: unknown) {
      logError("useAdminTeamManagement.getUserEmail", error);
      return null;
    }
  }, []);

  const getUserEmailsBatch = useCallback(async (userIds: string[]): Promise<Record<string, string | null>> => {
    if (userIds.length === 0) return {};
    
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "get_user_emails_batch", userIds, userType: "team" },
      });

      if (error) throw error;
      
      const emailMap: Record<string, string | null> = {};
      if (data?.users) {
        Object.entries(data.users).forEach(([userId, userData]) => {
          emailMap[userId] = (userData as { email: string | null }).email;
        });
      }
      return emailMap;
    } catch (error: unknown) {
      logError("useAdminTeamManagement.getUserEmailsBatch", error);
      return {};
    }
  }, []);

  const updateStatus = useCallback(async (
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

      await logAction.log({
        action: `team_${status}`,
        entityType: "team_member",
        entityId: profileId,
        newValues: { status, reason },
      });

      toast.success(`Team member ${status === "active" ? "activated" : status}`);
      return true;
    } catch (error: unknown) {
      toast.error("Failed to update status: " + getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAction]);

  const bulkUpdateStatus = useCallback(async (
    members: Array<{ id: string; user_id: string }>,
    status: string,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_update_status",
          userIds: members.map((m) => m.user_id),
          profileIds: members.map((m) => m.id),
          status,
          reason,
          userType: "team",
        },
      });

      if (error) throw error;

      await logAction.log({
        action: `bulk_team_${status}`,
        entityType: "team_member",
        entityId: members.map((m) => m.id).join(","),
        newValues: { count: members.length, status, reason },
      });

      toast.success(`${members.length} team member(s) ${status === "active" ? "activated" : status}`);
      return true;
    } catch (error: unknown) {
      toast.error("Failed to update status: " + getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAction]);

  const bulkDelete = useCallback(async (
    members: Array<{ id: string; user_id: string }>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_delete",
          profileIds: members.map((m) => m.id),
          userIds: members.map((m) => m.user_id),
          userType: "team",
        },
      });

      if (error) throw error;

      await logAction.log({
        action: "bulk_team_delete",
        entityType: "team_member",
        entityId: members.map((m) => m.id).join(","),
        newValues: { count: members.length },
      });

      toast.success(`${members.length} team member(s) deleted`);
      return true;
    } catch (error: unknown) {
      toast.error("Failed to delete team members: " + getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAction]);

  const resetPassword = useCallback(async (userId: string, profileId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-password-reset", {
        body: { userId },
      });

      if (error) throw error;

      await logAction.log({
        action: "team_password_reset",
        entityType: "team_member",
        entityId: profileId,
      });

      return true;
    } catch (error: unknown) {
      toast.error("Failed to reset password: " + getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAction]);

  return {
    loading,
    getUserEmail,
    getUserEmailsBatch,
    updateStatus,
    bulkUpdateStatus,
    bulkDelete,
    resetPassword,
  };
};
