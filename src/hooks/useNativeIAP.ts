import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachProfileId } from '@/hooks/useCoachProfileId';
import { useCoachProfile } from '@/hooks/useCoachClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRegisterResumeHandler } from '@/contexts/ResumeManagerContext';
import { BACKGROUND_DELAYS } from '@/hooks/useAppResumeManager';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import {
  isNativeIAPAvailable,
  registerIAPCallbacksWithId,
  unregisterIAPCallbacksWithId,
  setIAPCallbacks,
  triggerRevenueCatPurchase,
  getPlatformProductId,
  IAPSuccessData,
  triggerHaptic,
  isDespiaAndroid,
  AndroidUpgradeInfo,
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

// TIER PRIORITY: Lower index = higher priority (enterprise=0, pro=1, starter=2, free=3)
const TIER_PRIORITY: Record<string, number> = {
  'enterprise': 0,
  'pro': 1,
  'starter': 2,
  'free': 3,
};

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

// PHASE 3 FIX: Faster initial polling, then slower
// First 10 attempts: 1 second each (10s total)
// Next 10 attempts: 2 seconds each (20s total)
// Final 5 attempts: 3 seconds each (15s total)
// Total: 45 seconds max polling time (improved from 60s)
const INITIAL_POLL_INTERVAL_MS = 1000;
const SECONDARY_POLL_INTERVAL_MS = 2000;
const FINAL_POLL_INTERVAL_MS = 3000;
const INITIAL_POLL_COUNT = 10;
const SECONDARY_POLL_COUNT = 10;
const MAX_POLL_ATTEMPTS = 25; // Reduced from 30
const PURCHASE_TIMEOUT_MS = 120000; // 2 minutes timeout for stuck purchases

/**
 * Hook for handling native in-app purchases via Despia + RevenueCat
 */
export const useNativeIAP = (options?: UseNativeIAPOptions): UseNativeIAPReturn => {
  const { user } = useAuth();
  const { data: coachProfileId } = useCoachProfileId();
  const { data: coachProfile, isLoading: isProfileLoading } = useCoachProfile();
  
  // CRITICAL: Check BOTH database tier AND localStorage cache for Founder
  // This provides double protection against reconciliation running before profile loads
  const isFounderFromDB = coachProfile?.subscription_tier === 'founder';
  const isFounderFromCache = (() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CACHED_TIER) === 'founder';
    } catch {
      return false;
    }
  })();
  const isFounder = isFounderFromDB || isFounderFromCache;
  
  const queryClient = useQueryClient();
  // Initialize isAvailable synchronously to prevent race conditions
  const [state, setState] = useState<NativeIAPState>(() => ({
    isAvailable: isNativeIAPAvailable(),
    purchaseStatus: 'idle',
    isPolling: false,
    purchasedProductId: null,
    error: null,
    showUnsuccessfulModal: false,
  }));
  
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

  // Cleanup polling and timeout on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current); // Changed to clearTimeout for setTimeout-based polling
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
   * CRITICAL: Never run reconciliation while profile is still loading
   */
  const reconcileSubscription = useCallback(async () => {
    // GUARD 1: Wait for profile to actually load before any reconciliation
    // This prevents race conditions where reconciliation runs before we know the tier
    if (isProfileLoading) {
      console.log('[NativeIAP] Profile still loading - deferring reconciliation');
      return;
    }
    
    // FOUNDER PROTECTION: Skip reconciliation entirely for Founders
    // Check both DB and localStorage cache for maximum protection
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
        // PHASE 2 FIX: Use resetQueries for critical tier queries to force fresh data
        // This clears cache completely rather than just marking as stale
        localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
        localStorage.removeItem(STORAGE_KEYS.TIER_TIMESTAMP);
        
        await Promise.all([
          queryClient.resetQueries({ queryKey: ['subscription-status'] }),
          queryClient.resetQueries({ queryKey: ['feature-access'] }),
          queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
        ]);
        
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
  }, [coachProfileId, user, queryClient, isFounder, isProfileLoading]);

  /**
   * Auto-reconcile on mount when native IAP is available
   * This recovers from webhook failures or delayed processing
   * 
   * CRITICAL: Founders are excluded from auto-reconciliation
   * CRITICAL: Never run until profile has loaded to prevent race conditions
   */
  useEffect(() => {
    // GUARD: Wait for profile to load before any auto-reconciliation
    if (isProfileLoading) {
      return;
    }
    
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
  }, [state.isAvailable, coachProfileId, user, reconcileSubscription, isFounder, isProfileLoading]);

  /**
   * Resume handler for visibility - called via unified ResumeManager
   * Handles: StoreKit interruptions, background purchases, slow webhooks
   */
  const handleResumeReconciliation = useCallback(() => {
    // FOUNDER PROTECTION: Skip visibility reconciliation for Founders
    if (isFounder) {
      console.log('[NativeIAP] Skipping visibility reconciliation - Founder tier is immutable');
      return;
    }
    
    // Reset reconciliation flag and re-check entitlement
    reconciliationAttemptedRef.current = false;
    reconcileSubscription();
    
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
  }, [reconcileSubscription, isFounder]);

  // Register with unified ResumeManager instead of local visibility handler
  useRegisterResumeHandler(
    useMemo(() => ({
      id: 'subscription',
      priority: 'background' as const,
      delay: BACKGROUND_DELAYS.subscription,
      handler: handleResumeReconciliation,
    }), [handleResumeReconciliation])
  );

  /**
   * Poll the backend to check if the subscription has been updated via webhook
   * FIX: Accept ANY active paid tier (not just expected tier) to handle RevenueCat timing issues
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

      // Accept ANY active paid subscription (not just expected tier)
      // This handles RevenueCat timing issues where tier may temporarily mismatch
      const activePaidTiers = ['starter', 'pro', 'enterprise'];
      if (data && activePaidTiers.includes(data.tier) && data.status === 'active') {
        console.log('[NativeIAP] Poll found active subscription:', data.tier, '(expected:', expectedTier, ')');
        return true;
      }

      return false;
    } catch (e) {
      console.error('[NativeIAP] Poll exception:', e);
      return false;
    }
  }, [coachProfileId]);

  /**
   * Start polling for subscription confirmation with adaptive intervals
   * PHASE 3 FIX: Faster initial polling for better UX
   */
  const startPolling = useCallback((expectedTier: SubscriptionTier) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollAttemptsRef.current = 0;
    setState(prev => ({ ...prev, isPolling: true, purchaseStatus: 'success' }));

    // Helper to get current poll interval based on attempt count
    const getPollInterval = (attempt: number): number => {
      if (attempt < INITIAL_POLL_COUNT) return INITIAL_POLL_INTERVAL_MS;
      if (attempt < INITIAL_POLL_COUNT + SECONDARY_POLL_COUNT) return SECONDARY_POLL_INTERVAL_MS;
      return FINAL_POLL_INTERVAL_MS;
    };

    // Use recursive setTimeout for adaptive intervals
    const poll = async () => {
      pollAttemptsRef.current += 1;
      const currentAttempt = pollAttemptsRef.current;

      const confirmed = await pollSubscriptionStatus(expectedTier);

      if (confirmed) {
        // Success! Stop polling
        setState(prev => ({
          ...prev,
          isPolling: false,
          purchaseStatus: 'idle',
        }));

        // Clear localStorage cache and upgrade protection
        localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
        localStorage.removeItem(STORAGE_KEYS.TIER_TIMESTAMP);
        localStorage.removeItem(STORAGE_KEYS.UPGRADE_PROTECTION);
        localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
        
        // Use resetQueries for tier-related queries to force complete cache clear and refetch
        await Promise.all([
          queryClient.resetQueries({ queryKey: ['subscription-status'] }),
          queryClient.resetQueries({ queryKey: ['feature-access'] }),
          queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['coach-onboarding-status'], refetchType: 'all' }),
        ]);
        
        // Call the success callback if provided (handles celebration/navigation)
        options?.onPurchaseComplete?.(expectedTier);
        return;
      }

      if (currentAttempt >= MAX_POLL_ATTEMPTS) {
        // Max attempts reached, stop polling and try reconciliation as fallback
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
        return;
      }

      // Schedule next poll with adaptive interval
      pollIntervalRef.current = setTimeout(poll, getPollInterval(currentAttempt)) as unknown as NodeJS.Timeout;
    };

    // Start first poll immediately
    poll();
  }, [pollSubscriptionStatus, queryClient, options, reconcileSubscription]);

  /**
   * Handle IAP success callback from Despia
   * UPGRADE FIX: For upgrades, skip immediate reconciliation (stale RevenueCat data)
   * and go straight to polling which checks the DATABASE directly
   */
  const handleIAPSuccess = useCallback(async (data: IAPSuccessData) => {
    clearPurchaseTimeout();
    
    // Only handle subscription product IDs (not boost)
    const productIdLower = data.planID.toLowerCase();
    if (productIdLower.includes('boost')) {
      console.log('[NativeIAP] Ignoring boost product in subscription handler');
      return;
    }
    
    // Extract tier from product ID
    let tier: SubscriptionTier = 'starter';
    
    if (productIdLower.includes('pro')) {
      tier = 'pro';
    } else if (productIdLower.includes('enterprise')) {
      tier = 'enterprise';
    }

    setState(prev => ({
      ...prev,
      purchasedProductId: data.planID,
      purchaseStatus: 'success',
    }));

    // Store upgrade protection in localStorage for extra safety
    localStorage.setItem(STORAGE_KEYS.UPGRADE_PROTECTION, JSON.stringify({
      tier,
      timestamp: Date.now(),
    }));

    // Determine if this is an UPGRADE from current tier
    const currentTierFromCache = localStorage.getItem(STORAGE_KEYS.CACHED_TIER) || 'free';
    const currentPriority = TIER_PRIORITY[currentTierFromCache] ?? 3;
    const newPriority = TIER_PRIORITY[tier] ?? 3;
    const isUpgrade = newPriority < currentPriority;

    console.log('[NativeIAP] Purchase success', { 
      tier, 
      currentTierFromCache, 
      isUpgrade,
      productId: data.planID 
    });

    // UPGRADE FIX: For UPGRADES, skip immediate reconciliation entirely
    // RevenueCat API has 30-60s lag and returns stale data which would revert the tier
    // The webhook already updated the DB, so polling (which reads DB) is reliable
    if (isUpgrade) {
      console.log('[NativeIAP] UPGRADE detected - skipping reconciliation, using polling');
      // Go straight to polling which checks the DATABASE directly
      startPolling(tier);
      return;
    }

    // For NEW subscriptions (not upgrades), try immediate reconciliation
    console.log('[NativeIAP] New subscription - trying immediate reconciliation');
    reconciliationAttemptedRef.current = false;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data: reconcileResult, error } = await supabase.functions.invoke('verify-subscription-entitlement');
      
      // Accept success if we have any valid tier
      const activePaidTiers = ['starter', 'pro', 'enterprise'];
      if (!error && reconcileResult?.tier && activePaidTiers.includes(reconcileResult.tier)) {
        console.log('[NativeIAP] Immediate reconciliation succeeded:', reconcileResult.tier);
        
        setState(prev => ({
          ...prev,
          isPolling: false,
          purchaseStatus: 'idle',
        }));
        
        localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
        localStorage.removeItem(STORAGE_KEYS.TIER_TIMESTAMP);
        localStorage.removeItem(STORAGE_KEYS.UPGRADE_PROTECTION);
        localStorage.setItem(STORAGE_KEYS.COACH_ONBOARDED, 'true');
        
        await Promise.all([
          queryClient.resetQueries({ queryKey: ['subscription-status'] }),
          queryClient.resetQueries({ queryKey: ['feature-access'] }),
          queryClient.invalidateQueries({ queryKey: ['coach-profile'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['platform-subscription'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['coach-onboarding-status'], refetchType: 'all' }),
        ]);
        
        triggerHaptic('success');
        options?.onPurchaseComplete?.(tier);
        return;
      }
      
      console.log('[NativeIAP] Immediate reconciliation did not activate - falling back to polling');
    } catch (e) {
      console.error('[NativeIAP] Immediate reconciliation failed:', e);
    }

    // Fallback to polling if immediate reconciliation didn't work
    startPolling(tier);
  }, [startPolling, clearPurchaseTimeout, queryClient, options]);

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

  // Note: Callbacks are registered just before purchase in the purchase() function
  // This ensures they're always fresh and avoids race conditions

  /**
   * Trigger a purchase
   * ANDROID FIX: For upgrades, pass oldProductId and replacementMode to RevenueCat
   */
  const purchase = useCallback(async (tier: SubscriptionTier, interval: BillingInterval) => {
    console.log('[NativeIAP] purchase() called', { tier, interval, isAvailable: state.isAvailable, userId: user?.id });
    
    if (!state.isAvailable) {
      toast.error('Native purchases not available');
      return;
    }

    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // Get the user ID to use as external_id for RevenueCat
    const externalId = user.id;

    // Get the platform-specific product ID (iOS or Android)
    const productId = getPlatformProductId(tier, interval);
    console.log('[NativeIAP] Product ID:', productId);

    if (!productId) {
      toast.error('Invalid subscription selection for this platform');
      return;
    }

    // ANDROID FIX: Detect if this is an upgrade and pass old product info
    let upgradeInfo: AndroidUpgradeInfo | undefined;
    
    if (isDespiaAndroid()) {
      const currentTier = coachProfile?.subscription_tier || 'free';
      const currentPriority = TIER_PRIORITY[currentTier] ?? 3;
      const newPriority = TIER_PRIORITY[tier] ?? 3;
      const isUpgrade = newPriority < currentPriority && currentTier !== 'free';
      
      if (isUpgrade) {
        // For upgrades, we need the old product ID
        // Try to get the current billing interval from localStorage or default to monthly
        const cachedInterval = localStorage.getItem('fitconnect_current_billing_interval') as BillingInterval || 'monthly';
        const oldProductId = getPlatformProductId(currentTier as SubscriptionTier, cachedInterval);
        
        if (oldProductId) {
          upgradeInfo = {
            oldProductId,
            replacementMode: 'IMMEDIATE_AND_CHARGE_PRORATED_PRICE',
          };
          console.log('[NativeIAP] Android upgrade detected', {
            fromTier: currentTier,
            toTier: tier,
            oldProductId,
            newProductId: productId,
          });
        }
      }
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

    // Ensure callbacks are set right before purchase
    setIAPCallbacks({
      onSuccess: handleIAPSuccess,
      onError: handleIAPError,
      onCancel: handleIAPCancel,
      onPending: handleIAPPending,
    });

    // Trigger the purchase
    console.log('[NativeIAP] Triggering purchase...');
    triggerHaptic('light');
    
    const triggered = triggerRevenueCatPurchase(externalId, productId, upgradeInfo);
    console.log('[NativeIAP] Purchase triggered:', triggered);

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
  }, [state.isAvailable, user, clearPurchaseTimeout, coachProfile?.subscription_tier, handleIAPSuccess, handleIAPError, handleIAPCancel, handleIAPPending]);

  /**
   * Reset all state - useful for recovering from stuck states
   */
  const resetState = useCallback(() => {
    clearPurchaseTimeout();
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current); // Changed to clearTimeout for setTimeout-based polling
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
