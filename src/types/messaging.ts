// Types for Quick Send interactive messages

export interface QuickSendMetadata {
  type: 'quick_send';
  itemType: 'package' | 'subscription' | 'digital-product' | 'digital-bundle' | 'training-plan' | 'meal-plan';
  itemId: string;
  itemName: string;
  itemDescription?: string;
  price?: number;
  currency?: string;
  coachId: string;
  status: 'pending' | 'accepted' | 'declined';
  respondedAt?: string;
  checkoutSessionId?: string;
  // Additional data for specific item types
  sessionCount?: number; // For packages
  billingPeriod?: string; // For subscriptions
}

export interface MessageWithMetadata {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  metadata?: QuickSendMetadata | null;
  created_at: string;
  read_at: string | null;
}
