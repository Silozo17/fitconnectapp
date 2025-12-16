import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";

export const useAdminUserManagement = (userType: "client" | "coach") => {
  const [loading, setLoading] = useState(false);
  const logAction = useLogAdminAction();

  const getUserEmail = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "get_user_email", userId },
      });
      if (error) throw error;
      return data.email;
    } catch (error: any) {
      console.error("Get email error:", error);
      return null;
    }
  };

  const updateEmail = async (userId: string, profileId: string, newEmail: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: { action: "update_email", userId, newEmail },
      });
      if (error) throw error;

      logAction.mutate({
        action: "UPDATE_EMAIL",
        entityType: userType === "coach" ? "coach_profiles" : "client_profiles",
        entityId: profileId,
        newValues: { email: newEmail },
      });

      toast.success("Email updated successfully");
      return true;
    } catch (error: any) {
      console.error("Update email error:", error);
      toast.error(error.message || "Failed to update email");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    userId: string,
    profileId: string,
    status: string,
    reason?: string
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "update_status",
          userId,
          profileId,
          userType,
          status,
          reason,
        },
      });
      if (error) throw error;

      logAction.mutate({
        action: `UPDATE_STATUS_${status.toUpperCase()}`,
        entityType: userType === "coach" ? "coach_profiles" : "client_profiles",
        entityId: profileId,
        newValues: { status, reason },
      });

      toast.success(`Account ${status === "active" ? "activated" : status}`);
      return true;
    } catch (error: any) {
      console.error("Update status error:", error);
      toast.error(error.message || "Failed to update status");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (
    users: Array<{ id: string; user_id: string }>,
    status: string,
    reason?: string
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_update_status",
          userIds: users.map((u) => u.user_id),
          profileIds: users.map((u) => u.id),
          userType,
          status,
          reason,
        },
      });
      if (error) throw error;

      logAction.mutate({
        action: `BULK_UPDATE_STATUS_${status.toUpperCase()}`,
        entityType: userType === "coach" ? "coach_profiles" : "client_profiles",
        newValues: { status, count: users.length, reason },
      });

      toast.success(`${data.count} accounts updated`);
      return true;
    } catch (error: any) {
      console.error("Bulk update error:", error);
      toast.error(error.message || "Failed to update accounts");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (users: Array<{ id: string; user_id: string }>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-management", {
        body: {
          action: "bulk_delete",
          profileIds: users.map((u) => u.id),
          userType,
        },
      });
      if (error) throw error;

      logAction.mutate({
        action: "BULK_DELETE",
        entityType: userType === "coach" ? "coach_profiles" : "client_profiles",
        newValues: { count: users.length },
      });

      toast.success(`${data.count} accounts deleted`);
      return true;
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast.error(error.message || "Failed to delete accounts");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserEmail,
    updateEmail,
    updateStatus,
    bulkUpdateStatus,
    bulkDelete,
  };
};
