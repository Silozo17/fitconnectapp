import { memo } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeIconButtonProps {
  onClick: () => void;
}

/**
 * Animated golden crown icon that opens the upgrade drawer
 * Only shown on mobile, next to the hamburger menu
 */
const UpgradeIconButton = memo(({ onClick }: UpgradeIconButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="xl:hidden h-9 w-9 rounded-xl"
      onClick={onClick}
      aria-label="Upgrade your plan"
    >
      <Crown className="w-5 h-5 text-amber-400 animate-gold-glow" />
    </Button>
  );
});

UpgradeIconButton.displayName = "UpgradeIconButton";

export default UpgradeIconButton;
