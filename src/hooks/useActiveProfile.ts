import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext } from "react";

// Re-export the hook from AdminContext but with a safe fallback
// This prevents crashes when used outside AdminProvider
const AdminContext = createContext<{
  activeProfileType: "admin" | "coach" | "client";
  activeProfileId: string | null;
  availableProfiles: Record<string, string | undefined>;
} | null>(null);

// Try to import the real useAdminView, but handle cases where context isn't available
const useAdminViewSafe = () => {
  try {
    // Dynamic import to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAdminView } = require("@/contexts/AdminContext");
    return useAdminView();
  } catch {
    // Return safe defaults if AdminProvider isn't mounted
    return {
      activeProfileType: "client" as const,
      activeProfileId: null,
      availableProfiles: {},
    };
  }
};

export const useActiveProfile = () => {
  const { user, role } = useAuth();
  
  // Safely get admin view context - returns defaults if not in AdminProvider
  let adminContext;
  try {
    adminContext = useAdminViewSafe();
  } catch {
    // Fallback for edge cases
    adminContext = {
      activeProfileType: "client" as const,
      activeProfileId: null,
      availableProfiles: {},
    };
  }
  
  const { activeProfileType, activeProfileId, availableProfiles } = adminContext;

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

  // For admin users, return the active profile based on their selection
  return {
    profileId: activeProfileId,
    profileType: activeProfileType,
    isAdmin: activeProfileType === "admin",
    isCoach: activeProfileType === "coach",
    isClient: activeProfileType === "client",
    isRoleSwitching: true, // Admin is using role switching
    userId: user?.id || null,
    availableProfiles,
  };
};
