import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachProfileId } from '@/hooks/useCoachProfileId';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  isNativeIAPAvailable,
  registerIAPCallbacks,
  unregisterIAPCallbacks,
  triggerRevenueCatPurchase,
  IAP_PRODUCT_IDS,
  IAPSuccessData,
  triggerHaptic,
} from '@/lib/despia';

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

interface NativeIAPState {
  isAvailable: boolean;
  isPurchasing: boolean;
  isPolling: boolean;
  purchasedProductId: string | null;
  error: string | null;
}

interface UseNativeIAPReturn {
  state: NativeIAPState;
  purchase: (tier: SubscriptionTier, interval: BillingInterval) => Promise<void>;
  isAvailable: boolean;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60 seconds max polling

/**
 * Hook for handling native in-app purchases via Despia + RevenueCat
 */
export const useNativeIAP = (): UseNativeIAPReturn => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();
  const [state, setState] = useState<NativeIAPState>({
    isAvailable: false,
    isPurchasing: false,
    isPolling: false,
    purchasedProductId: null,
    error: null,
  });
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);

  // Check availability on mount
  useEffect(() => {
    setState(prev => ({ ...prev, isAvailable: isNativeIAPAvailable() }));
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

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
        console.log('[NativeIAP] Subscription confirmed:', data);
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
    setState(prev => ({ ...prev, isPolling: true }));

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
          isPurchasing: false,
        }));
        
        triggerHaptic('success');
        toast.success('Subscription activated!', {
          description: `Your ${expectedTier} plan is now active.`,
        });

        // Refresh the page to update UI
        window.location.reload();
        return;
      }

      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        // Max attempts reached, stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setState(prev => ({
          ...prev,
          isPolling: false,
          isPurchasing: false,
          error: 'Subscription confirmation is taking longer than expected. Please check back later.',
        }));
        
        toast.info('Subscription pending', {
          description: 'Your purchase is being processed. It may take a few minutes to reflect.',
        });
      }
    }, POLL_INTERVAL_MS);
  }, [pollSubscriptionStatus]);

  /**
   * Handle IAP success callback from Despia
   */
  const handleIAPSuccess = useCallback((data: IAPSuccessData) => {
    console.log('[NativeIAP] IAP Success received:', data);
    
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
  }, [startPolling]);

  // Register IAP callbacks
  useEffect(() => {
    if (state.isAvailable) {
      registerIAPCallbacks({
        onSuccess: handleIAPSuccess,
        onError: (error) => {
          console.error('[NativeIAP] IAP Error:', error);
          triggerHaptic('error');
          setState(prev => ({
            ...prev,
            isPurchasing: false,
            error,
          }));
          toast.error('Purchase failed', { description: error });
        },
      });
    }

    return () => {
      unregisterIAPCallbacks();
    };
  }, [state.isAvailable, handleIAPSuccess]);

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

    // Get the product ID
    const productKey = `${tier}_${interval}` as keyof typeof IAP_PRODUCT_IDS;
    const productId = IAP_PRODUCT_IDS[productKey];

    if (!productId) {
      toast.error('Invalid subscription selection');
      return;
    }

    setState(prev => ({
      ...prev,
      isPurchasing: true,
      error: null,
      purchasedProductId: null,
    }));

    triggerHaptic('light');

    // Trigger the native purchase
    const triggered = triggerRevenueCatPurchase(externalId, productId);

    if (!triggered) {
      setState(prev => ({
        ...prev,
        isPurchasing: false,
        error: 'Failed to start purchase',
      }));
      toast.error('Failed to start purchase');
    }
  }, [state.isAvailable, user]);

  return {
    state,
    purchase,
    isAvailable: state.isAvailable,
  };
};

export default useNativeIAP;
