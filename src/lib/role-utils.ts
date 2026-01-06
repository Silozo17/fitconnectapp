/**
 * Role utilities for consistent role checking across the codebase
 * 
 * This centralizes all role-related logic to:
 * 1. Prevent duplication of role checking patterns
 * 2. Enable easy updates when role requirements change
 * 3. Provide type-safe role checking
 */

import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Roles that have admin panel access (admin, manager, staff)
 */
export const ADMIN_ROLES: readonly AppRole[] = ['admin', 'manager', 'staff'] as const;

/**
 * Roles that require 2FA and have elevated privileges (admin, manager, staff, coach)
 */
export const PRIVILEGED_ROLES: readonly AppRole[] = ['admin', 'manager', 'staff', 'coach'] as const;

/**
 * Check if a role is an admin-level role (admin, manager, staff)
 */
export const isAdminRole = (role: AppRole | null): boolean => 
  role !== null && (ADMIN_ROLES as readonly string[]).includes(role);

/**
 * Check if a role is privileged (requires 2FA) - admin, manager, staff, coach
 */
export const isPrivilegedRole = (role: AppRole | null): boolean =>
  role !== null && (PRIVILEGED_ROLES as readonly string[]).includes(role);

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (userRoles: AppRole[], requiredRoles: readonly AppRole[]): boolean =>
  userRoles.some(r => (requiredRoles as readonly string[]).includes(r));

/**
 * Check if user has a specific role
 */
export const hasRole = (userRoles: AppRole[], role: AppRole): boolean =>
  userRoles.includes(role);

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (userRoles: AppRole[], requiredRoles: readonly AppRole[]): boolean =>
  requiredRoles.every(r => userRoles.includes(r));

/**
 * Check if user has admin access (any of admin, manager, staff)
 */
export const hasAdminAccess = (userRoles: AppRole[]): boolean =>
  hasAnyRole(userRoles, ADMIN_ROLES);

/**
 * Check if user is privileged (requires 2FA) - any of admin, manager, staff, coach
 */
export const isUserPrivileged = (userRoles: AppRole[]): boolean =>
  hasAnyRole(userRoles, PRIVILEGED_ROLES);
