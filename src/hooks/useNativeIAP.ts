import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachProfileId } from '@/hooks/useCoachProfileId';
import { useCoachProfile } from '@/hooks/useCoachClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  isNativeIAPAvailable,
  registerIAPCallbacks,
  unregisterIAPCallbacks,
  triggerRevenueCatPurchase,
  getPlatformProductId,
  IAPSuccessData,
  triggerHaptic,
} from '@/lib/despia';

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

/**
 * Explicit purchase status for clean state management
 */
export type PurchaseStatus = 
  | 'idle'           // Ready to purchase
  | 'purchasing'     // Native IAP dialog is active
  | 'success'        // Purchase succeeded, may be polling for confirmation
  | 'cancelled'      // User cancelled - treated as idle for retry
  | 'failed'         // Error occurred - show retry option
  | 'pending';       // StoreKit returned deferred (e.g., Ask to Buy)

interface NativeIAPState {
  isAvailable: boolean;
  purchaseStatus: PurchaseStatus;
  isPolling: boolean;
  purchasedProductId: string | null;
  error: string | null;
  showUnsuccessfulModal: boolean;
}

interface UseNativeIAPOptions {
  onPurchaseComplete?: (tier: SubscriptionTier) => void;
}

interface UseNativeIAPReturn {
  state: NativeIAPState;
  purchase: (tier: SubscriptionTier, interval: BillingInterval) => Promise<void>;
  isAvailable: boolean;
  dismissUnsuccessfulModal: () => void;
  resetState: () => void;
  reconcileSubscription: () => Promise<void>;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60 seconds max polling
const PURCHASE_TIMEOUT_MS = 120000; // 2 minutes timeout for stuck purchases

/**
 * Hook for handling native in-app purchases via Despia + RevenueCat
 */
export const useNativeIAP = (options?: UseNativeIAPOptions): UseNativeIAPReturn => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();
  const { data: coachProfile } = useCoachProfile();
  
  // Check if current tier is Founder - Founders skip all reconciliation
  const isFounder = coachProfile?.subscription_tier === 'founder';
  const queryClient = useQueryClient();
  const [state, setState] = useState<NativeIAPState>({
    isAvailable: false,
    purchaseStatus: 'idle',
    isPolling: false,
    purchasedProductId: null,
    error: null,
    showUnsuccessfulModal: false,
  });
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);
  const purchaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconciliationAttemptedRef = useRef(false);

  // Cleanup purchase timeout helper
  const clearPurchaseTimeout = useCallback(() => {
    if (purchaseTimeoutRef.current) {
      clearTimeout(purchaseTimeoutRef.current);
      purchaseTimeoutRef.current = null;
    }
  }, []);

  // Check availability on mount
  useEffect(() => {
    setState(prev => ({ ...prev, isAvailable: isNativeIAPAvailable() }));
  }, []);

  // Cleanup polling and timeout on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (purchaseTimeoutRef.current) {
        clearTimeout(purchaseTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Reconcile subscription entitlement with RevenueCat
   * Calls the verify-subscription-entitlement edge function to check RevenueCat
   * and reconcile DB state if there's a mismatch
   * 
   * CRITICAL: Founders are NEVER reconciled - their tier is immutable and protected
   */
  const reconcileSubscription = useCallback(async () => {
    // FOUNDER PROTECTION: Skip reconciliation entirely for Founders
    // Founder tier is permanent and cannot be modified by automated processes
    if (isFounder) {
      console.log('[NativeIAP] Skipping reconciliation - Founder tier is immutable');
      return;
    }

    if (!coachProfileId || !user || reconciliationAttemptedRef.current) {
      return;
    }

    reconciliationAttemptedRef.current = true;

    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription-entitlement');
      
      if (error) {
        console.error('[NativeIAP] Subscription reconciliation failed:', error);
        return;
      }

      // Handle founder_immutable response from edge function
      if (data?.status === 'founder_immutable') {
        console.log('[NativeIAP] Edge function confirmed Founder tier is immutable');
        return;
      }

      if (data?.reconciled) {
        // Invalidate queries to refresh subscription data
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['feature-access'] });
        
        if (data.tier && data.tier !== 'free') {
          toast.success('Subscription activated!', {
            description: `Your ${data.tier} plan is now active.`,
          });
          
          // Trigger celebration
          triggerHaptic('success');
        }
      }
    } catch (e) {
      console.error('[NativeIAP] Subscription reconciliation exception:', e);
    }
  }, [coachProfileId, user, queryClient, isFounder]);

  /**
   * Auto-reconcile on mount when native IAP is available
   * This recovers from webhook failures or delayed processing
   * 
   * CRITICAL: Founders are excluded from auto-reconciliation
   */
  useEffect(() => {
    // FOUNDER PROTECTION: Skip auto-reconciliation for Founders
    if (isFounder) {
      console.log('[NativeIAP] Skipping auto-reconciliation - Founder tier is immutable');
      return;
    }

    if (state.isAvailable && coachProfileId && user) {
      // Delay slightly to avoid race conditions on app startup
      const timer = setTimeout(() => {
        reconcileSubscription();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [state.isAvailable, coachProfileId, user, reconcileSubscription, isFounder]);

  /**
   * Foreground/resume reconciliation and safety reset
   * When app returns to foreground:
   * 1. Re-check subscription entitlement (handles StoreKit interruptions, slow webhooks)
   * 2. Clear stuck purchasing state if no polling is active
   * 
   * CRITICAL: Founders are excluded from visibility-based reconciliation
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // FOUNDER PROTECTION: Skip visibility reconciliation for Founders
        if (!isFounder) {
          // Reset reconciliation flag and re-check entitlement
          // This handles: StoreKit interruptions, background purchases, slow webhooks
          reconciliationAttemptedRef.current = false;
          reconcileSubscription();
        }
        
        // Give callbacks 2 seconds to fire if there's a pending response
        setTimeout(() => {
          setState(prev => {
            // Only reset if stuck in purchasing (not polling, not pending)
            if (prev.purchaseStatus === 'purchasing' && !prev.isPolling) {
              return { ...prev, purchaseStatus: 'idle' };
            }
            return prev;
          });
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [reconcileSubscription, isFounder]);

  /**
   * Poll the backend to check if the subscription has been updated via webhook
   */
  const pollSubscriptionStatus = useCallback(async (expectedTier: SubscriptionTier): Promise<boolean> => {
    if (!coachProfileId) return false;

    try {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('tier, status, updated_at')
        .eq('coach_id', coachProfileId)
        .maybeSingle();

      if (error) {
        console.error('[NativeIAP] Poll error:', error);
        return false;
      }

      // Check if subscription was updated to the expected tier
      if (data && data.tier === expectedTier && data.status === 'active') {
        return true;
      }

      return false;
    } catch (e) {
      console.error('[NativeIAP] Poll exception:', e);
      return false;
    }
  }, [coachProfileId]);

  /**
   * Start polling for subscription confirmation
   */
  const startPolling = useCallback((expectedTier: SubscriptionTier) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollAttemptsRef.current = 0;
    setState(prev => ({ ...prev, isPolling: true, purchaseStatus: 'success' }));

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;

      const confirmed = await pollSubscriptionStatus(expectedTier);

      if (confirmed) {
        // Success! Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setState(prev => ({
          ...prev,
          isPolling: false,
          purchaseStatus: 'idle',
        }));

        // Invalidate queries to refresh subscription data throughout the app
        queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
        queryClient.invalidateQueries({ queryKey: ['platform-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['feature-access'] });
        
        // Call the success callback if provided (handles celebration/navigation)
        options?.onPurchaseComplete?.(expectedTier);
        return;
      }

      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        // Max attempts reached, stop polling and try reconciliation as fallback
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setState(prev => ({
          ...prev,
          isPolling: false,
          purchaseStatus: 'idle',
        }));
        
        // Try reconciliation as last resort for webhook failures
        toast.info('Verifying your subscription...', {
          description: 'If your plan doesn\'t activate shortly, please contact support.',
        });
        
        // Reset reconciliation flag and try again
        reconciliationAttemptedRef.current = false;
        await reconcileSubscription();
        
        // Still call success callback - payment was successful, just webhook is slow
        options?.onPurchaseComplete?.(expectedTier);
      }
    }, POLL_INTERVAL_MS);
  }, [pollSubscriptionStatus, queryClient, options, reconcileSubscription]);

  /**
   * Handle IAP success callback from Despia
   */
  const handleIAPSuccess = useCallback((data: IAPSuccessData) => {
    clearPurchaseTimeout();
    
    // Extract tier from product ID
    const productIdLower = data.planID.toLowerCase();
    let tier: SubscriptionTier = 'starter';
    
    if (productIdLower.includes('pro')) {
      tier = 'pro';
    } else if (productIdLower.includes('enterprise')) {
      tier = 'enterprise';
    }

    setState(prev => ({
      ...prev,
      purchasedProductId: data.planID,
    }));

    // Start polling for webhook confirmation
    startPolling(tier);
  }, [startPolling, clearPurchaseTimeout]);

  /**
   * Handle IAP cancel callback from Despia
   * Cancel is a user choice, not an error - immediately reset to idle for retry
   */
  const handleIAPCancel = useCallback(() => {
    clearPurchaseTimeout();
    setState(prev => ({
      ...prev,
      purchaseStatus: 'idle', // Immediately retryable
      error: null,
      showUnsuccessfulModal: false,
      purchasedProductId: null,
    }));
    toast.info('Purchase cancelled', { duration: 2000 });
  }, [clearPurchaseTimeout]);

  /**
   * Dismiss the unsuccessful modal and reset to idle for retry
   */
  const dismissUnsuccessfulModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showUnsuccessfulModal: false,
      purchaseStatus: 'idle', // Allow immediate retry
      error: null,
    }));
  }, []);

  /**
   * Handle IAP error callback from Despia
   */
  const handleIAPError = useCallback((error: string) => {
    console.error('[NativeIAP] IAP Error:', error);
    clearPurchaseTimeout();
    triggerHaptic('error');
    setState(prev => ({
      ...prev,
      purchaseStatus: 'failed',
      error,
      showUnsuccessfulModal: true,
    }));
  }, [clearPurchaseTimeout]);

  /**
   * Handle IAP pending callback from Despia (Ask to Buy / deferred)
   * Only set pending when StoreKit explicitly returns a deferred transaction
   */
  const handleIAPPending = useCallback(() => {
    clearPurchaseTimeout();
    setState(prev => ({
      ...prev,
      purchaseStatus: 'pending',
      error: null,
    }));
    toast.info('Purchase requires approval', {
      description: 'A parent or guardian needs to approve this purchase.',
      duration: 5000,
    });
  }, [clearPurchaseTimeout]);

  // Register IAP callbacks once on mount when available
  useEffect(() => {
    if (state.isAvailable) {
      registerIAPCallbacks({
        onSuccess: handleIAPSuccess,
        onError: handleIAPError,
        onCancel: handleIAPCancel,
        onPending: handleIAPPending,
      });
    }

    return () => {
      unregisterIAPCallbacks();
    };
  }, [state.isAvailable, handleIAPSuccess, handleIAPError, handleIAPCancel, handleIAPPending]);

  /**
   * Trigger a purchase
   */
  const purchase = useCallback(async (tier: SubscriptionTier, interval: BillingInterval) => {
    if (!state.isAvailable) {
      toast.error('Native purchases not available');
      return;
    }

    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // Get the user ID to use as external_id for RevenueCat
    // Use auth user ID so RevenueCat can match with webhook
    const externalId = user.id;

    // Get the platform-specific product ID (iOS or Android)
    const productId = getPlatformProductId(tier, interval);

    if (!productId) {
      toast.error('Invalid subscription selection for this platform');
      return;
    }

    setState(prev => ({
      ...prev,
      purchaseStatus: 'purchasing',
      error: null,
      purchasedProductId: null,
    }));

    // Clear any existing timeout
    clearPurchaseTimeout();

    // Set a timeout to reset if no response received (2 minutes)
    purchaseTimeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.purchaseStatus === 'purchasing' && !prev.isPolling) {
          toast.error('Purchase timed out', {
            description: 'Please try again or contact support if the issue persists.',
          });
          return {
            ...prev,
            purchaseStatus: 'failed',
            error: 'Purchase timed out. Please try again.',
            showUnsuccessfulModal: true,
          };
        }
        return prev;
      });
    }, PURCHASE_TIMEOUT_MS);

    // Use requestAnimationFrame to batch state updates and prevent UI jitter
    requestAnimationFrame(() => {
      triggerHaptic('light');
      
      // Trigger the native purchase
      const triggered = triggerRevenueCatPurchase(externalId, productId);

      if (!triggered) {
        clearPurchaseTimeout();
        setState(prev => ({
          ...prev,
          purchaseStatus: 'failed',
          error: 'Failed to start purchase',
          showUnsuccessfulModal: true,
        }));
        toast.error('Failed to start purchase');
      }
    });
  }, [state.isAvailable, user, clearPurchaseTimeout]);

  /**
   * Reset all state - useful for recovering from stuck states
   */
  const resetState = useCallback(() => {
    clearPurchaseTimeout();
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
    reconciliationAttemptedRef.current = false;
    setState({
      isAvailable: isNativeIAPAvailable(),
      purchaseStatus: 'idle',
      isPolling: false,
      purchasedProductId: null,
      error: null,
      showUnsuccessfulModal: false,
    });
  }, [clearPurchaseTimeout]);

  return {
    state,
    purchase,
    isAvailable: state.isAvailable,
    dismissUnsuccessfulModal,
    resetState,
    reconcileSubscription,
  };
};

export default useNativeIAP;
