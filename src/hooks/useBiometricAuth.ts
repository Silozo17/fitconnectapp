import { useState, useCallback, useEffect } from 'react';
import { 
  isDespia, 
  registerBioAuthCallbacks, 
  triggerBioAuth 
} from '@/lib/despia';

export interface UseBiometricAuthResult {
  /** Whether biometric auth is available (running in Despia) */
  isAvailable: boolean;
  /** Whether authentication is currently in progress */
  isAuthenticating: boolean;
  /** Whether the last authentication was successful */
  isAuthenticated: boolean;
  /** Error message from the last failed attempt */
  error: string | null;
  /** Trigger biometric authentication */
  authenticate: () => Promise<boolean>;
  /** Reset the authentication state */
  reset: () => void;
}

/**
 * Hook for handling biometric authentication in Despia native environment
 * Supports Face ID, Touch ID, and fingerprint authentication
 */
export const useBiometricAuth = (): UseBiometricAuthResult => {
  const [isAvailable] = useState(() => isDespia());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track promise resolver for async authenticate()
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  // Register callbacks on mount
  useEffect(() => {
    if (!isDespia()) return;

    registerBioAuthCallbacks({
      onSuccess: () => {
        console.log('Biometric authentication successful');
        setIsAuthenticating(false);
        setIsAuthenticated(true);
        setError(null);
        resolver?.resolve(true);
      },
      onFailure: (errorCode, errorMessage) => {
        console.log('Biometric authentication failed:', errorCode, errorMessage);
        setIsAuthenticating(false);
        setIsAuthenticated(false);
        setError(errorMessage || `Authentication failed (${errorCode})`);
        resolver?.resolve(false);
      },
      onUnavailable: () => {
        console.log('Biometric authentication unavailable');
        setIsAuthenticating(false);
        setIsAuthenticated(false);
        setError('Biometric authentication is not available on this device');
        resolver?.resolve(false);
      },
    });
  }, [resolver]);

  const authenticate = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isDespia()) {
        setError('Biometric authentication is only available in the native app');
        resolve(false);
        return;
      }

      setIsAuthenticating(true);
      setError(null);
      setResolver({ resolve });

      const triggered = triggerBioAuth();
      if (!triggered) {
        setIsAuthenticating(false);
        setError('Failed to trigger biometric authentication');
        resolve(false);
      }
    });
  }, []);

  const reset = useCallback(() => {
    setIsAuthenticating(false);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    isAvailable,
    isAuthenticating,
    isAuthenticated,
    error,
    authenticate,
    reset,
  };
};
