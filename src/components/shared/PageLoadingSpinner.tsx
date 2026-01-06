import { useTranslation } from "react-i18next";
import { Dumbbell } from "lucide-react";

export default function PageLoadingSpinner() {
  const { t, ready } = useTranslation();

  // Fallback text if i18n isn't ready yet (prevents empty/broken UI)
  const loadingText = ready ? t('loading.loadingPage') : 'Loading';

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background" 
      role="status" 
      aria-label={loadingText}
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Branded loader with dumbbell icon */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 animate-pulse" />
          
          {/* Spinning arc */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center animate-bounce-subtle">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Loading text with shimmer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {loadingText}
          </span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
