import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickSendFABProps {
  onClick: () => void;
  className?: string;
}

const QuickSendFAB = ({ onClick, className }: QuickSendFABProps) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed z-50 h-14 w-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "bottom-36 right-4",
        "lg:hidden", // Hide on desktop
        className
      )}
    >
      <Zap className="h-6 w-6" />
      <span className="sr-only">Quick Send</span>
    </Button>
  );
};

export default QuickSendFAB;
