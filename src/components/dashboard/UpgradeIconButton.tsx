import { memo } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";

interface UpgradeIconButtonProps {
  onClick: () => void;
}

/**
 * Animated golden crown icon that opens the upgrade drawer
 * Always visible for coaches - allows viewing/managing subscription
 * On native: only show on mobile (xl:hidden)
 * On web/PWA: show on all screen sizes
 */
const UpgradeIconButton = memo(({ onClick }: UpgradeIconButtonProps) => {
  const { isNativeMobile } = usePlatformRestrictions();
  
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
