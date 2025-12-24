/**
 * Hook to centralize platform-based restrictions.
 * Handles iOS, Android, and PWA restrictions for marketplace and purchases.
 * 
 * @deprecated Use usePlatformRestrictions from './usePlatformRestrictions' instead.
 * This file is kept for backwards compatibility.
 */

export { usePlatformRestrictions as useIOSRestrictions } from "./usePlatformRestrictions";
export type { PlatformRestrictions as IOSRestrictions } from "./usePlatformRestrictions";
