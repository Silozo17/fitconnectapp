import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { getEnvironment } from '@/hooks/useEnvironment';

/**
 * PWA Reload Prompt
 * 
 * IMPORTANT: Disabled in Despia native environment.
 * Despia handles OTA updates natively - a PWA service worker adds
 * another caching layer that can conflict and cause dynamic import
 * failures (black screens) on Android WebView.
 */
export function ReloadPrompt() {
  // Check environment before registering SW
  const env = getEnvironment();
  
  // Skip SW registration entirely in Despia native
  if (env.isDespia) {
    return null;
  }
  
  return <ReloadPromptInner />;
}

function ReloadPromptInner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every hour
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast('New version available!', {
        description: 'Click to update FitConnect to the latest version',
        action: {
          label: 'Update',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
