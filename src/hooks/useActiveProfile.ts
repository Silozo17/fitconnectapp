import { useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminContext } from "@/contexts/AdminContext";

/**
 * Safe hook to get active profile information.
 * Works both inside and outside AdminProvider.
 * Returns sensible defaults when context is unavailable.
 */
export const useActiveProfile = () => {
  const { user, role } = useAuth();

  // useContext returns undefined when outside AdminProvider (safe, no throw)
  const adminContext = useContext(AdminContext);

  // Use defaults if context is not available
  const activeProfileType = adminContext?.activeProfileType ?? "client";
  const activeProfileId = adminContext?.activeProfileId ?? null;
  const availableProfiles = adminContext?.availableProfiles ?? {};

  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const canSwitchRoles = isAdminUser || role === "coach";

  // If user cannot switch roles (pure clients), return based on their actual role
  if (!canSwitchRoles) {
    return {
      profileId: null, // Will be fetched by individual components
      profileType: "client" as const,
      isAdmin: false,
      isCoach: false,
      isClient: true,
      isRoleSwitching: false,
      userId: user?.id || null,
    };
  }

  // For admin/coach users, return the active profile based on their selection
  return {
    profileId: activeProfileId,
    profileType: activeProfileType,
    isAdmin: activeProfileType === "admin",
    isCoach: activeProfileType === "coach",
    isClient: activeProfileType === "client",
    isRoleSwitching: true,
    userId: user?.id || null,
    availableProfiles,
  };
};
