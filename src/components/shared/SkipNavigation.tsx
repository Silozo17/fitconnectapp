import { cn } from "@/lib/utils";

interface SkipNavigationProps {
  mainContentId?: string;
  className?: string;
}

/**
 * Skip Navigation component for keyboard users to bypass navigation
 * and jump directly to main content.
 */
const SkipNavigation = ({ 
  mainContentId = "main-content",
  className 
}: SkipNavigationProps) => {
  return (
    <a
      href={`#${mainContentId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[100]",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "font-medium text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      Skip to main content
    </a>
  );
};

export default SkipNavigation;
