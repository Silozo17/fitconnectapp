import { useState, useEffect, useMemo, ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAppLaunchCounter } from "@/hooks/useAppLaunchCounter";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPGRADE_MESSAGES = [
  "{firstName}, upgrade today and unlock AI coaching!",
  "Hey {firstName}! Your clients deserve premium features.",
  "{firstName}, ready to level up your coaching?",
  "Unlock unlimited clients, {firstName}!",
  "{firstName}, discover enterprise-level insights!",
  "Take your coaching to the next level, {firstName}!",
  "{firstName}, premium tools are just a tap away!",
  "Boost your business, {firstName}!",
  "{firstName}, your coaching empire awaits!",
  "Upgrade now and impress your clients, {firstName}!",
];

interface UpgradeSuggestionTooltipProps {
  children: ReactNode;
}

export function UpgradeSuggestionTooltip({ children }: UpgradeSuggestionTooltipProps) {
  const { profile, displayName } = useUserProfile();
  const { shouldShowSuggestion, dismissSuggestion } = useAppLaunchCounter();
  const { isNativeMobile } = usePlatformRestrictions();
  const { tier } = useSubscriptionStatus();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for web/PWA users on free or starter tier
  const shouldShowForUser = !isNativeMobile && (tier === "free" || tier === "starter");

  // Pick a random message
  const message = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * UPGRADE_MESSAGES.length);
    const template = UPGRADE_MESSAGES[randomIndex];
    const firstName = profile?.first_name;
    const name = firstName || displayName?.split(" ")[0] || "there";
    return template.replace("{firstName}", name);
  }, [profile?.first_name, displayName]);

  // Auto-show the popover when conditions are met
  useEffect(() => {
    if (shouldShowSuggestion && shouldShowForUser) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      // Auto-dismiss after 8 seconds
      const dismissTimer = setTimeout(() => {
        setIsOpen(false);
        dismissSuggestion();
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [shouldShowSuggestion, shouldShowForUser, dismissSuggestion]);

  const handleClose = () => {
    setIsOpen(false);
    dismissSuggestion();
  };

  // Don't show for native apps or enterprise users
  if (isNativeMobile || tier === "enterprise" || tier === "pro" || tier === "founder") {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="end" 
        className="w-72 p-3 bg-gradient-to-br from-amber-500/10 to-primary/10 border-amber-500/30"
      >
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap the crown to explore premium plans
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 shrink-0"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
