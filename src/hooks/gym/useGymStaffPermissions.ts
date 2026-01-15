import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

/**
 * Granular permission interface for gym staff
 * Each permission is individually toggleable by the owner
 */
export interface GymStaffPermissions {
  // Membership actions
  can_cancel_membership: boolean;
  can_freeze_membership: boolean;
  can_create_membership: boolean;
  can_refund_payments: boolean;
  
  // Member management
  can_create_members: boolean;
  can_edit_members: boolean;
  can_delete_members: boolean;
  can_view_member_details: boolean;
  
  // Classes
  can_manage_classes: boolean;
  can_override_bookings: boolean;
  can_teach_classes: boolean;
  
  // Financial
  can_view_financials: boolean;
  can_process_payments: boolean;
  can_view_reports: boolean;
  can_process_refunds: boolean;
  
  // Settings & Staff
  can_manage_staff: boolean;
  can_manage_locations: boolean;
  can_manage_settings: boolean;
  can_view_activity_logs: boolean;
  
  // Marketing
  can_manage_campaigns: boolean;
  can_manage_leads: boolean;
  
  // Inventory
  can_manage_products: boolean;
  can_process_sales: boolean;
}

/**
 * Default permissions by role
 */
export const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, Partial<GymStaffPermissions>> = {
  owner: {
    can_cancel_membership: true,
    can_freeze_membership: true,
    can_create_membership: true,
    can_refund_payments: true,
    can_create_members: true,
    can_edit_members: true,
    can_delete_members: true,
    can_view_member_details: true,
    can_manage_classes: true,
    can_override_bookings: true,
    can_teach_classes: true,
    can_view_financials: true,
    can_process_payments: true,
    can_view_reports: true,
    can_process_refunds: true,
    can_manage_staff: true,
    can_manage_locations: true,
    can_manage_settings: true,
    can_view_activity_logs: true,
    can_manage_campaigns: true,
    can_manage_leads: true,
    can_manage_products: true,
    can_process_sales: true,
  },
  area_manager: {
    can_cancel_membership: true,
    can_freeze_membership: true,
    can_create_membership: true,
    can_refund_payments: true,
    can_create_members: true,
    can_edit_members: true,
    can_delete_members: false,
    can_view_member_details: true,
    can_manage_classes: true,
    can_override_bookings: true,
    can_teach_classes: true,
    can_view_financials: true,
    can_process_payments: true,
    can_view_reports: true,
    can_process_refunds: true,
    can_manage_staff: true,
    can_manage_locations: true,
    can_manage_settings: false,
    can_view_activity_logs: true,
    can_manage_campaigns: true,
    can_manage_leads: true,
    can_manage_products: true,
    can_process_sales: true,
  },
  manager: {
    can_cancel_membership: true,
    can_freeze_membership: true,
    can_create_membership: true,
    can_refund_payments: false,
    can_create_members: true,
    can_edit_members: true,
    can_delete_members: false,
    can_view_member_details: true,
    can_manage_classes: true,
    can_override_bookings: true,
    can_teach_classes: true,
    can_view_financials: true,
    can_process_payments: true,
    can_view_reports: true,
    can_process_refunds: false,
    can_manage_staff: false,
    can_manage_locations: false,
    can_manage_settings: false,
    can_view_activity_logs: true,
    can_manage_campaigns: true,
    can_manage_leads: true,
    can_manage_products: true,
    can_process_sales: true,
  },
  coach: {
    can_cancel_membership: false,
    can_freeze_membership: false,
    can_create_membership: false,
    can_refund_payments: false,
    can_create_members: false,
    can_edit_members: false,
    can_delete_members: false,
    can_view_member_details: true,
    can_manage_classes: true,
    can_override_bookings: false,
    can_teach_classes: true,
    can_view_financials: false,
    can_process_payments: false,
    can_view_reports: false,
    can_process_refunds: false,
    can_manage_staff: false,
    can_manage_locations: false,
    can_manage_settings: false,
    can_view_activity_logs: false,
    can_manage_campaigns: false,
    can_manage_leads: false,
    can_manage_products: false,
    can_process_sales: false,
  },
  marketing: {
    can_cancel_membership: false,
    can_freeze_membership: false,
    can_create_membership: false,
    can_refund_payments: false,
    can_create_members: false,
    can_edit_members: false,
    can_delete_members: false,
    can_view_member_details: false,
    can_manage_classes: false,
    can_override_bookings: false,
    can_teach_classes: false,
    can_view_financials: false,
    can_process_payments: false,
    can_view_reports: true,
    can_process_refunds: false,
    can_manage_staff: false,
    can_manage_locations: false,
    can_manage_settings: false,
    can_view_activity_logs: false,
    can_manage_campaigns: true,
    can_manage_leads: true,
    can_manage_products: false,
    can_process_sales: false,
  },
  staff: {
    can_cancel_membership: false,
    can_freeze_membership: false,
    can_create_membership: true,
    can_refund_payments: false,
    can_create_members: true,
    can_edit_members: true,
    can_delete_members: false,
    can_view_member_details: true,
    can_manage_classes: false,
    can_override_bookings: false,
    can_teach_classes: false,
    can_view_financials: false,
    can_process_payments: true,
    can_view_reports: false,
    can_process_refunds: false,
    can_manage_staff: false,
    can_manage_locations: false,
    can_manage_settings: false,
    can_view_activity_logs: false,
    can_manage_campaigns: false,
    can_manage_leads: true,
    can_manage_products: false,
    can_process_sales: true,
  },
};

/**
 * Get effective permissions for a staff member
 * Combines role defaults with custom overrides
 */
export function getEffectivePermissions(
  role: string,
  customPermissions?: Partial<GymStaffPermissions>
): GymStaffPermissions {
  const roleDefaults = DEFAULT_PERMISSIONS_BY_ROLE[role] || DEFAULT_PERMISSIONS_BY_ROLE.staff;
  
  return {
    can_cancel_membership: false,
    can_freeze_membership: false,
    can_create_membership: false,
    can_refund_payments: false,
    can_create_members: false,
    can_edit_members: false,
    can_delete_members: false,
    can_view_member_details: false,
    can_manage_classes: false,
    can_override_bookings: false,
    can_teach_classes: false,
    can_view_financials: false,
    can_process_payments: false,
    can_view_reports: false,
    can_process_refunds: false,
    can_manage_staff: false,
    can_manage_locations: false,
    can_manage_settings: false,
    can_view_activity_logs: false,
    can_manage_campaigns: false,
    can_manage_leads: false,
    can_manage_products: false,
    can_process_sales: false,
    ...roleDefaults,
    ...customPermissions,
  };
}

/**
 * Hook to check if current staff has a specific permission
 */
export function useGymStaffPermission(permission: keyof GymStaffPermissions): boolean {
  const { userRole, isOwner, staffRecord } = useGym();
  
  // Owner always has all permissions
  if (isOwner) return true;
  
  if (!userRole || !staffRecord) return false;
  
  // Get custom permissions from staff record if available
  const customPermissions = (staffRecord as any).permissions as Partial<GymStaffPermissions> | undefined;
  const effectivePermissions = getEffectivePermissions(userRole, customPermissions);
  
  return effectivePermissions[permission] ?? false;
}

/**
 * Hook to update staff permissions
 */
export function useUpdateStaffPermissions() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffId,
      permissions,
    }: {
      staffId: string;
      permissions: Partial<GymStaffPermissions>;
    }) => {
      if (!gym?.id) throw new Error("No gym context");

      const { error } = await (supabase as any)
        .from("gym_staff")
        .update({ permissions })
        .eq("id", staffId)
        .eq("gym_id", gym.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff"] });
      toast.success("Permissions updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permissions: ${error.message}`);
    },
  });
}

/**
 * Hook to update staff location assignments
 */
export function useUpdateStaffLocations() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffId,
      locationIds,
    }: {
      staffId: string;
      locationIds: string[];
    }) => {
      if (!gym?.id) throw new Error("No gym context");

      const { error } = await (supabase as any)
        .from("gym_staff")
        .update({ assigned_location_ids: locationIds })
        .eq("id", staffId)
        .eq("gym_id", gym.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff"] });
      toast.success("Location assignments updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update locations: ${error.message}`);
    },
  });
}

/**
 * Permission groups for UI organization
 */
export const PERMISSION_GROUPS = {
  membership: {
    label: "Membership Management",
    permissions: [
      { key: "can_cancel_membership", label: "Cancel memberships", requiresReview: true },
      { key: "can_freeze_membership", label: "Freeze/unfreeze memberships", requiresReview: true },
      { key: "can_create_membership", label: "Create new memberships", requiresReview: false },
    ],
  },
  members: {
    label: "Member Management",
    permissions: [
      { key: "can_create_members", label: "Create members", requiresReview: false },
      { key: "can_edit_members", label: "Edit member details", requiresReview: false },
      { key: "can_delete_members", label: "Delete members", requiresReview: true },
      { key: "can_view_member_details", label: "View member details", requiresReview: false },
    ],
  },
  classes: {
    label: "Class Management",
    permissions: [
      { key: "can_manage_classes", label: "Manage class schedules", requiresReview: false },
      { key: "can_override_bookings", label: "Override class bookings", requiresReview: true },
      { key: "can_teach_classes", label: "Teach classes", requiresReview: false },
    ],
  },
  financial: {
    label: "Financial Access",
    permissions: [
      { key: "can_view_financials", label: "View financial reports", requiresReview: false },
      { key: "can_process_payments", label: "Process payments", requiresReview: false },
      { key: "can_view_reports", label: "View analytics reports", requiresReview: false },
      { key: "can_refund_payments", label: "Issue refunds", requiresReview: true },
      { key: "can_process_refunds", label: "Process refunds", requiresReview: true },
    ],
  },
  settings: {
    label: "Settings & Administration",
    permissions: [
      { key: "can_manage_staff", label: "Manage staff members", requiresReview: false },
      { key: "can_manage_locations", label: "Manage locations", requiresReview: false },
      { key: "can_manage_settings", label: "Modify gym settings", requiresReview: false },
      { key: "can_view_activity_logs", label: "View activity logs", requiresReview: false },
    ],
  },
  marketing: {
    label: "Marketing & Leads",
    permissions: [
      { key: "can_manage_campaigns", label: "Manage marketing campaigns", requiresReview: false },
      { key: "can_manage_leads", label: "Manage leads", requiresReview: false },
    ],
  },
  inventory: {
    label: "Products & Sales",
    permissions: [
      { key: "can_manage_products", label: "Manage products", requiresReview: false },
      { key: "can_process_sales", label: "Process POS sales", requiresReview: false },
    ],
  },
} as const;
