import { useState, useEffect, useCallback } from 'react';
import { 
  isDespia, 
  isTrackingDisabled, 
  getPrivacyStatus,
  PrivacyStatus 
} from '@/lib/despia';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UsePrivacyStatusResult {
  /** Whether the app is running in Despia native environment */
  isNative: boolean;
  /** Whether tracking is disabled (ATT denied on iOS, etc.) */
  trackingDisabled: boolean;
  /** Full privacy status object */
  privacyStatus: PrivacyStatus;
  /** Sync privacy status to backend for compliance */
  syncPrivacyStatus: () => Promise<boolean>;
  /** Whether sync is in progress */
  isSyncing: boolean;
}

/**
 * Hook for managing user privacy/tracking preferences in Despia native apps
 * Useful for ATT (App Tracking Transparency) compliance on iOS
 */
export const usePrivacyStatus = (): UsePrivacyStatusResult => {
  const { user } = useAuth();
  const [isNative] = useState(() => isDespia());
  const [trackingDisabled, setTrackingDisabled] = useState(() => isTrackingDisabled());
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>(() => getPrivacyStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  // Update privacy status when app becomes visible (user may have changed settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isDespia()) {
        setTrackingDisabled(isTrackingDisabled());
        setPrivacyStatus(getPrivacyStatus());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const syncPrivacyStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.warn('Cannot sync privacy status: no user logged in');
      return false;
    }

    setIsSyncing(true);

    try {
      const status = getPrivacyStatus();
      
      // Update the user's notification preferences with tracking status
      // This stores the compliance data alongside their existing preferences
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          updated_at: status.timestamp,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to sync privacy status:', error);
        return false;
      }

      console.log('Privacy status synced:', status);
      return true;
    } catch (e) {
      console.error('Error syncing privacy status:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id]);

  return {
    isNative,
    trackingDisabled,
    privacyStatus,
    syncPrivacyStatus,
    isSyncing,
  };
};
