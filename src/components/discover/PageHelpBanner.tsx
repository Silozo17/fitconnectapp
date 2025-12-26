import { useState, useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageHelp } from '@/hooks/usePageHelp';
import { cn } from '@/lib/utils';

interface PageHelpBannerProps {
  pageKey: string;
  title: string;
  description: string;
  className?: string;
}

export function PageHelpBanner({ 
  pageKey, 
  title, 
  description,
  className 
}: PageHelpBannerProps) {
  const { showHelp, dismissHelp } = usePageHelp(pageKey);
  const [isVisible, setIsVisible] = useState(false);

  // Delay appearance slightly for smoother page load
  useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [showHelp]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before marking as seen
    setTimeout(dismissHelp, 200);
  };

  if (!showHelp) return null;

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/10 p-4 mb-6 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground mb-0.5">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0 -mr-1 -mt-1"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}
