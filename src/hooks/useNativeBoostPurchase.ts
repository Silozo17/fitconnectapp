import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachProfileId } from '@/hooks/useCoachProfileId';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  isNativeIAPAvailable,
  registerIAPCallbacks,
  unregisterIAPCallbacks,
  triggerRevenueCatPurchase,
  getBoostProductId,
  IAPSuccessData,
  triggerHaptic,
} from '@/lib/despia';

interface NativeBoostPurchaseState {
  isAvailable: boolean;
  isPurchasing: boolean;
  isPolling: boolean;
  error: string | null;
  showUnsuccessfulModal: boolean;
}

interface UseNativeBoostPurchaseReturn {
  state: NativeBoostPurchaseState;
  purchase: () => void;
  isAvailable: boolean;
  dismissUnsuccessfulModal: () => void;
  resetState: () => void;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // 60 seconds max polling
const PURCHASE_TIMEOUT_MS = 120000; // 2 minutes timeout

/**
 * Hook for handling native in-app purchases for Boost via Despia + RevenueCat
 * Similar to useNativeIAP but specifically for one-time Boost purchases
 */
export const useNativeBoostPurchase = (): UseNativeBoostPurchaseReturn => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();
  const queryClient = useQueryClient();
  const [state, setState] = useState<NativeBoostPurchaseState>({
    isAvailable: false,
    isPurchasing: false,
    isPolling: false,
    error: null,
    showUnsuccessfulModal: false,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);
  const purchaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRegisteredRef = useRef(false);

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
   * Trigger celebration effects
   */
  const triggerCelebration = useCallback(() => {
    // Haptic feedback
    triggerHaptic('success');

    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#10b981', '#059669', '#16a34a'],
    });
  }, []);

  /**
   * Poll the backend to check if boost has been activated via webhook
   */
  const pollBoostStatus = useCallback(async (): Promise<boolean> => {
    if (!coachProfileId) return false;

    try {
      const { data, error } = await supabase
        .from('coach_boosts')
        .select('is_active, payment_status, boost_end_date, updated_at')
        .eq('coach_id', coachProfileId)
        .maybeSingle();

      if (error) {
        console.error('[NativeBoostIAP] Poll error:', error);
        return false;
      }

      // Check if boost was activated successfully
      if (data && data.is_active && data.payment_status === 'succeeded' && data.boost_end_date) {
        console.log('[NativeBoostIAP] Boost confirmed:', data);
        return true;
      }

      return false;
    } catch (e) {
      console.error('[NativeBoostIAP] Poll exception:', e);
      return false;
    }
  }, [coachProfileId]);

  /**
   * Start polling for boost activation confirmation
   */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollAttemptsRef.current = 0;
    setState(prev => ({ ...prev, isPolling: true }));

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;

      const confirmed = await pollBoostStatus();

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

        // Invalidate queries to refresh boost data
        queryClient.invalidateQueries({ queryKey: ['coach-boost-status'] });
        queryClient.invalidateQueries({ queryKey: ['boost-attributions'] });

        // Trigger celebration
        triggerCelebration();
        toast.success('Boost activated!', {
          description: 'Your profile is now boosted for priority visibility.',
        });
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
        }));

        // Still show success - payment was successful, webhook might be slow
        triggerCelebration();
        toast.success('Boost purchase successful!', {
          description: 'Your boost will be active momentarily.',
        });

        queryClient.invalidateQueries({ queryKey: ['coach-boost-status'] });
      }
    }, POLL_INTERVAL_MS);
  }, [pollBoostStatus, queryClient, triggerCelebration]);

  /**
   * Handle IAP success callback from Despia
   */
  const handleIAPSuccess = useCallback((data: IAPSuccessData) => {
    console.log('[NativeBoostIAP] IAP Success received:', data);
    clearPurchaseTimeout();

    // Start polling for webhook confirmation
    startPolling();
  }, [startPolling, clearPurchaseTimeout]);

  /**
   * Handle IAP cancel callback from Despia
   */
  const handleIAPCancel = useCallback(() => {
    console.log('[NativeBoostIAP] Purchase cancelled by user');
    clearPurchaseTimeout();
    setState(prev => ({
      ...prev,
      isPurchasing: false,
      error: null,
      showUnsuccessfulModal: false,
    }));
    toast.info('Purchase cancelled', { duration: 2000 });
  }, [clearPurchaseTimeout]);

  /**
   * Dismiss the unsuccessful modal
   */
  const dismissUnsuccessfulModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showUnsuccessfulModal: false,
    }));
  }, []);

  /**
   * Handle IAP error callback from Despia
   */
  const handleIAPError = useCallback((error: string) => {
    console.error('[NativeBoostIAP] IAP Error:', error);
    clearPurchaseTimeout();
    triggerHaptic('error');
    setState(prev => ({
      ...prev,
      isPurchasing: false,
      error,
      showUnsuccessfulModal: true,
    }));
  }, [clearPurchaseTimeout]);

  // Register IAP callbacks when purchasing boost
  useEffect(() => {
    if (state.isAvailable && state.isPurchasing && !isRegisteredRef.current) {
      isRegisteredRef.current = true;
      registerIAPCallbacks({
        onSuccess: handleIAPSuccess,
        onError: handleIAPError,
        onCancel: handleIAPCancel,
      });
    }

    // Only unregister when we're done purchasing
    if (!state.isPurchasing && !state.isPolling && isRegisteredRef.current) {
      isRegisteredRef.current = false;
      // Don't unregister immediately - let callbacks settle
    }
  }, [state.isAvailable, state.isPurchasing, state.isPolling, handleIAPSuccess, handleIAPError, handleIAPCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRegisteredRef.current) {
        unregisterIAPCallbacks();
        isRegisteredRef.current = false;
      }
    };
  }, []);

  /**
   * Trigger a boost purchase
   */
  const purchase = useCallback(() => {
    console.log('[NativeBoostIAP] === BOOST PURCHASE START ===');

    if (!state.isAvailable) {
      toast.error('Native purchases not available');
      return;
    }

    if (!user) {
      toast.error('Please sign in to purchase boost');
      return;
    }

    const productId = getBoostProductId();
    console.log('[NativeBoostIAP] Product ID:', productId);

    if (!productId) {
      toast.error('Boost not available on this platform');
      return;
    }

    // Register callbacks before starting purchase
    registerIAPCallbacks({
      onSuccess: handleIAPSuccess,
      onError: handleIAPError,
      onCancel: handleIAPCancel,
    });
    isRegisteredRef.current = true;

    setState(prev => ({
      ...prev,
      isPurchasing: true,
      error: null,
    }));

    // Clear any existing timeout
    clearPurchaseTimeout();

    // Set a timeout to reset if no response received
    purchaseTimeoutRef.current = setTimeout(() => {
      console.warn('[NativeBoostIAP] Purchase timeout');
      setState(prev => {
        if (prev.isPurchasing && !prev.isPolling) {
          return {
            ...prev,
            isPurchasing: false,
            error: 'Purchase timed out. Please try again.',
            showUnsuccessfulModal: true,
          };
        }
        return prev;
      });
    }, PURCHASE_TIMEOUT_MS);

    // Trigger haptic and start purchase
    triggerHaptic('light');
    const triggered = triggerRevenueCatPurchase(user.id, productId);

    if (!triggered) {
      clearPurchaseTimeout();
      setState(prev => ({
        ...prev,
        isPurchasing: false,
        error: 'Failed to start purchase',
        showUnsuccessfulModal: true,
      }));
    }
  }, [state.isAvailable, user, clearPurchaseTimeout, handleIAPSuccess, handleIAPError, handleIAPCancel]);

  /**
   * Reset all state
   */
  const resetState = useCallback(() => {
    clearPurchaseTimeout();
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
    if (isRegisteredRef.current) {
      unregisterIAPCallbacks();
      isRegisteredRef.current = false;
    }
    setState({
      isAvailable: isNativeIAPAvailable(),
      isPurchasing: false,
      isPolling: false,
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
  };
};

export default useNativeBoostPurchase;
