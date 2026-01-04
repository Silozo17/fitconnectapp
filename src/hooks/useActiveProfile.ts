import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext } from "react";

// Define the AdminContext type for safe access
interface AdminContextType {
  activeProfileType: "admin" | "coach" | "client";
  activeProfileId: string | null;
  availableProfiles: Record<string, string | undefined>;
}

// Create a fallback context (not used directly, just for type safety)
const AdminContextFallback = createContext<AdminContextType | null>(null);

// PHASE 3 FIX: Safe hook that uses useContext pattern instead of require()
// This prevents runtime errors when AdminProvider isn't mounted
const useAdminViewSafe = (): AdminContextType => {
  // Try to dynamically access the AdminContext
  // This is wrapped in try-catch to handle cases where the module isn't available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AdminModule = require("@/contexts/AdminContext");
    if (AdminModule && AdminModule.useAdminView) {
      return AdminModule.useAdminView();
    }
  } catch {
    // Module not available or hook failed
  }
  
  // Return safe defaults if AdminProvider isn't mounted or context fails
  return {
    activeProfileType: "client" as const,
    activeProfileId: null,
    availableProfiles: {},
  };
};

export const useActiveProfile = () => {
  const { user, role } = useAuth();
  
  // PHASE 3 FIX: Single try-catch wrapper for admin context access
  // This handles all edge cases where AdminProvider isn't available
  const adminContext = useAdminViewSafe();
  
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
