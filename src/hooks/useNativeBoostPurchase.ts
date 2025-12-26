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

/**
 * Explicit purchase status for clean state management
 */
export type BoostPurchaseStatus = 
  | 'idle'           // Ready to purchase
  | 'purchasing'     // Native IAP dialog is active
  | 'success'        // Purchase succeeded, may be polling for confirmation
  | 'cancelled'      // User cancelled - treated as idle for retry
  | 'failed'         // Error occurred - show retry option
  | 'pending';       // StoreKit returned deferred (e.g., Ask to Buy)

interface NativeBoostPurchaseState {
  isAvailable: boolean;
  purchaseStatus: BoostPurchaseStatus;
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
    purchaseStatus: 'idle',
    isPolling: false,
    error: null,
    showUnsuccessfulModal: false,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);
  const purchaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
   * Safety reset on app resume/foreground
   * Clears stuck purchasing state if no polling is active
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Give callbacks 2 seconds to fire if there's a pending response
        setTimeout(() => {
          setState(prev => {
            // Only reset if stuck in purchasing (not polling, not pending)
            if (prev.purchaseStatus === 'purchasing' && !prev.isPolling) {
              console.log('[NativeBoostIAP] Safety reset on app resume - stuck in purchasing state');
              return { ...prev, purchaseStatus: 'idle' };
            }
            return prev;
          });
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    setState(prev => ({ ...prev, isPolling: true, purchaseStatus: 'success' }));

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
          purchaseStatus: 'idle',
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
          purchaseStatus: 'idle',
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
   * Cancel is a user choice - reset database pending status and allow immediate retry
   */
  const handleIAPCancel = useCallback(async () => {
    console.log('[NativeBoostIAP] Purchase cancelled by user');
    clearPurchaseTimeout();
    
    // Reset any pending database record so user can retry
    if (coachProfileId) {
      try {
        await supabase
          .from('coach_boosts')
          .delete()
          .eq('coach_id', coachProfileId)
          .eq('payment_status', 'pending');
        
        queryClient.invalidateQueries({ queryKey: ['coach-boost-status'] });
      } catch (e) {
        console.error('[NativeBoostIAP] Failed to reset pending boost:', e);
      }
    }
    
    setState(prev => ({
      ...prev,
      purchaseStatus: 'idle', // Immediately retryable
      error: null,
      showUnsuccessfulModal: false,
    }));
    toast.info('Purchase cancelled', { duration: 2000 });
  }, [clearPurchaseTimeout, coachProfileId, queryClient]);

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
    console.error('[NativeBoostIAP] IAP Error:', error);
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
    console.log('[NativeBoostIAP] Purchase pending (Ask to Buy or deferred)');
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

    setState(prev => ({
      ...prev,
      purchaseStatus: 'purchasing',
      error: null,
    }));

    // Clear any existing timeout
    clearPurchaseTimeout();

    // Set a timeout to reset if no response received
    purchaseTimeoutRef.current = setTimeout(() => {
      console.warn('[NativeBoostIAP] Purchase timeout');
      setState(prev => {
        if (prev.purchaseStatus === 'purchasing' && !prev.isPolling) {
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

    // Trigger haptic and start purchase
    triggerHaptic('light');
    const triggered = triggerRevenueCatPurchase(user.id, productId);

    if (!triggered) {
      clearPurchaseTimeout();
      setState(prev => ({
        ...prev,
        purchaseStatus: 'failed',
        error: 'Failed to start purchase',
        showUnsuccessfulModal: true,
      }));
    }
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
    setState({
      isAvailable: isNativeIAPAvailable(),
      purchaseStatus: 'idle',
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
