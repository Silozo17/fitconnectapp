import { GymRole } from "@/contexts/GymContext";

/**
 * Staff Role Hierarchy Levels
 * Level 6: Gym Owner - Ultimate power over all roles
 * Level 5: Area Manager - Can manage 1 or more locations
 * Level 4: Manager - Location-specific management
 * Level 3: Front Desk Staff - Location-specific
 * Level 2: Coach - Location-specific
 * Level 1: Marketing - Can manage 1 or more locations
 */
export const ROLE_HIERARCHY: Record<GymRole, number> = {
  owner: 6,
  area_manager: 5,
  manager: 4,
  staff: 3,  // Front Desk Staff
  coach: 2,
  marketing: 1,
};

export const ROLE_LABELS: Record<GymRole, string> = {
  owner: "Gym Owner",
  area_manager: "Area Manager",
  manager: "Manager",
  staff: "Front Desk Staff",
  coach: "Coach / Instructor",
  marketing: "Marketing",
};

export const ROLE_DESCRIPTIONS: Record<GymRole, string> = {
  owner: "Ultimate power over the gym and all staff",
  area_manager: "Manages one or more locations",
  manager: "Location-specific management",
  staff: "Front desk operations (location-specific)",
  coach: "Coaching and instruction (location-specific)",
  marketing: "Marketing and promotions (1+ locations)",
};

// Roles that can access multiple locations
export const MULTI_LOCATION_ROLES: GymRole[] = ["owner", "area_manager", "marketing"];

// Roles that are location-specific
export const LOCATION_SPECIFIC_ROLES: GymRole[] = ["manager", "staff", "coach"];

/**
 * Check if a manager role can manage a target role
 * Higher hierarchy levels can manage lower levels
 * Same level cannot manage each other (except owner managing other owners)
 */
export function canManageRole(managerRole: GymRole, targetRole: GymRole): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  // Owner can manage everyone including other owners
  if (managerRole === "owner") return true;
  
  // Others can only manage roles below them
  return managerLevel > targetLevel;
}

/**
 * Get the roles that can be assigned by a given role
 */
export function getAssignableRoles(managerRole: GymRole): GymRole[] {
  const allRoles: GymRole[] = ["owner", "area_manager", "manager", "staff", "coach", "marketing"];
  
  return allRoles.filter(role => canManageRole(managerRole, role));
}

/**
 * Get a color class for the role badge
 */
export function getRoleBadgeVariant(role: GymRole): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "area_manager":
      return "secondary";
    case "manager":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Get hierarchy level for a role
 */
export function getHierarchyLevel(role: GymRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

/**
 * Check if a role is a multi-location role
 */
export function isMultiLocationRole(role: GymRole): boolean {
  return MULTI_LOCATION_ROLES.includes(role);
}
