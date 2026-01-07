import { memo } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface UpgradeIconButtonProps {
  onClick: () => void;
}

/**
 * Animated golden crown icon that opens the upgrade drawer
 * Shown on:
 * - Mobile (all platforms) for non-enterprise users
 * - Desktop for Web/PWA users (not native apps) for non-enterprise users
 */
const UpgradeIconButton = memo(({ onClick }: UpgradeIconButtonProps) => {
  const { isNativeMobile } = usePlatformRestrictions();
  const { tier } = useSubscriptionStatus();

  // Hide for enterprise/pro/founder users (they have the best plan)
  const isTopTier = tier === "enterprise" || tier === "founder";
  
  // For native: only show on mobile (xl:hidden) - they use IAP drawer
  // For web/PWA: show on all screen sizes for non-top-tier users
  if (isTopTier) return null;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={isNativeMobile ? "xl:hidden h-9 w-9 rounded-xl" : "h-9 w-9 rounded-xl"}
      onClick={onClick}
      aria-label="Upgrade your plan"
    >
      <Crown className="w-5 h-5 text-amber-400 animate-gold-glow" />
    </Button>
  );
});

UpgradeIconButton.displayName = "UpgradeIconButton";

export default UpgradeIconButton;
