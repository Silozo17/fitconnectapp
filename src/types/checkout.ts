/**
 * Canonical Checkout Types
 * 
 * Consolidates checkout-related type definitions used across
 * payment flows, hooks, and components.
 */

/**
 * All supported checkout types.
 * Used by UnifiedEmbeddedCheckout and useCheckoutItem.
 */
export type CheckoutType = 
  | "digital-product" 
  | "digital-bundle" 
  | "package" 
  | "subscription" 
  | "booking";

/**
 * Unified checkout item structure.
 * Represents any purchasable item with common and type-specific fields.
 */
export interface CheckoutItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  type: CheckoutType;
  
  // Digital product specific
  contentType?: string;
  durationMinutes?: number;
  pageCount?: number;
  
  // Package specific
  sessionCount?: number;
  validityDays?: number;
  
  // Subscription specific
  billingPeriod?: string;
  sessionsPerPeriod?: number;
  features?: string[];
  
  // Bundle specific
  productCount?: number;
  
  // Coach info (common to all)
  coach: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    username: string | null;
  } | null;
}

/**
 * Booking details for session checkout.
 */
export interface BookingDetails {
  sessionTypeId: string;
  requestedAt: string;
  durationMinutes: number;
  isOnline: boolean;
  message?: string;
}
