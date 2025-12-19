import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share } from 'lucide-react';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'pwa-install-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const InstallBanner = () => {
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if previously dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_KEY);
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      setIsDismissed(true);
    }
  };

  // Don't show if: already installed, dismissed, or not on mobile
  if (isInstalled || isDismissed || !isMobile) {
    return null;
  }

  // Show different content for iOS vs Android
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg safe-area-pb">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">FC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Install FitConnect</p>
            <p className="text-xs text-muted-foreground truncate">
              Tap <Share className="w-3 h-3 inline" /> then "Add to Home Screen"
            </p>
          </div>
          <Link to="/install">
            <Button size="sm" variant="outline">
              How to
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Android / Chrome with install prompt
  if (canInstall) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg safe-area-pb">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">FC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Install FitConnect</p>
            <p className="text-xs text-muted-foreground truncate">
              Quick access from your home screen
            </p>
          </div>
          <Button size="sm" onClick={handleInstall}>
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Android without prompt - show instructions link
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg safe-area-pb">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">FC</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Install FitConnect</p>
          <p className="text-xs text-muted-foreground truncate">
            Add to home screen for quick access
          </p>
        </div>
        <Link to="/install">
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
        </Link>
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
