import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { SUPPORT_PROFILE_ID } from '@/lib/support-config';
import { cn } from '@/lib/utils';

interface SupportChatButtonProps {
  variant?: 'header' | 'navbar';
  className?: string;
}

export function SupportChatButton({ variant = 'header', className }: SupportChatButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if tooltip should show on mount (first time user sees this)
  useEffect(() => {
    if (!user) return;

    const hasSeenTooltip = localStorage.getItem(STORAGE_KEYS.SUPPORT_TOOLTIP_SEEN);
    
    if (!hasSeenTooltip) {
      // Small delay before showing tooltip for smoother UX
      const showTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 500);

      // Auto-hide after 3.5 seconds
      const hideTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShowTooltip(false);
          setIsExiting(false);
          localStorage.setItem(STORAGE_KEYS.SUPPORT_TOOLTIP_SEEN, 'true');
        }, 300);
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [user]);

  const handleClick = useCallback(() => {
    // Dismiss tooltip immediately on click
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem(STORAGE_KEYS.SUPPORT_TOOLTIP_SEEN, 'true');
    }

    // Determine the correct dashboard path based on current location
    let basePath = '/dashboard/client';
    if (location.pathname.includes('/dashboard/coach')) {
      basePath = '/dashboard/coach';
    } else if (location.pathname.includes('/dashboard/admin')) {
      basePath = '/dashboard/admin';
    } else if (location.pathname.includes('/gym-admin')) {
      // For gym admin, navigate to regular dashboard messages
      basePath = '/dashboard/client';
    }

    navigate(`${basePath}/messages/${SUPPORT_PROFILE_ID}`);
  }, [navigate, location.pathname, showTooltip]);

  if (!user) return null;

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-xl transition-colors",
          variant === 'navbar' && "text-foreground/80 hover:text-foreground"
        )}
        onClick={handleClick}
        aria-label="Contact support"
      >
        <LifeBuoy className="w-4 h-4" />
      </Button>

      {/* First-time tooltip */}
      {showTooltip && (
        <div
          className={cn(
            "absolute z-50 top-full mt-2 right-0 transform",
            "transition-all duration-300 ease-out",
            isExiting ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          {/* Arrow pointing up */}
          <div className="absolute -top-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary" />
          
          {/* Tooltip content */}
          <div className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg max-w-[180px] whitespace-nowrap">
            Need help? Chat with us! 💬
          </div>
        </div>
      )}
    </div>
  );
}
