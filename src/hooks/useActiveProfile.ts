import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";

export const useActiveProfile = () => {
  const { user, role } = useAuth();
  const { activeProfileType, activeProfileId, availableProfiles } = useAdminView();

  const isAdminUser = role === "admin" || role === "manager" || role === "staff";

  // If not an admin user, return based on their actual role
  if (!isAdminUser) {
    return {
      profileId: null, // Will be fetched by individual components
      profileType: role as "client" | "coach" | "admin",
      isAdmin: false,
      isCoach: role === "coach",
      isClient: role === "client",
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
