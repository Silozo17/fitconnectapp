import { ReactNode } from 'react';
import { useDeferredMount } from '@/hooks/useDeferredMount';
import { CelebrationProvider } from '@/contexts/CelebrationContext';
import { CelebrationListeners } from '@/components/gamification/CelebrationListeners';
import { SessionActivityTracker } from '@/components/auth/SessionActivityTracker';
import { PushNotificationInitializer } from '@/components/notifications/PushNotificationInitializer';

interface DeferredProvidersProps {
  children: ReactNode;
}

/**
 * Wraps non-critical providers that can be deferred until after initial render.
 * This reduces time to first meaningful paint on cold start.
 */
export function DeferredProviders({ children }: DeferredProvidersProps) {
  // Defer celebration provider - not needed for initial render
  const shouldMountCelebration = useDeferredMount(100);
  
  if (shouldMountCelebration) {
    return (
      <CelebrationProvider>
        <CelebrationListeners />
        {children}
      </CelebrationProvider>
    );
  }

  // Render children without celebration context initially
  return <>{children}</>;
}

/**
 * Deferred trackers that don't affect UI but can slow down initial render.
 */
export function DeferredTrackers() {
  const shouldMount = useDeferredMount(200);

  if (!shouldMount) {
    return null;
  }

  return (
    <>
      <SessionActivityTracker />
      <PushNotificationInitializer />
    </>
  );
}
