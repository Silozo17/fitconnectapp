import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Step title displayed in header */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Main content - scrollable area */
  children: React.ReactNode;
  /** Footer content - typically CTA buttons. If not provided, use footerActions */
  footer?: React.ReactNode;
  /** Simple footer with primary/secondary actions */
  footerActions?: {
    primary?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
  };
  /** Show back button in header */
  showBackButton?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Additional header content (e.g., skip button) */
  headerRight?: React.ReactNode;
  /** Additional class for content area */
  contentClassName?: string;
  /** Hide progress bar */
  hideProgress?: boolean;
  /** Show FitConnect logo in header */
  headerLogo?: boolean;
  /** Hide footer completely (for steps that don't need footer) */
  hideFooter?: boolean;
  /** Max width for content area */
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  /** Skip button handler - shows "Skip" in header right */
  onSkip?: () => void;
  /** Custom skip label */
  skipLabel?: string;
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-full',
};

export function OnboardingLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  footer,
  footerActions,
  showBackButton = false,
  onBack,
  headerRight,
  contentClassName,
  hideProgress = false,
  headerLogo = false,
  hideFooter = false,
  maxWidth = 'lg',
  onSkip,
  skipLabel = 'Skip',
}: OnboardingLayoutProps) {
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Handle keyboard appearance using visualViewport API
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Keyboard is likely visible if viewport height is significantly less than window height
      const heightDiff = window.innerHeight - viewport.height;
      const isKeyboardVisible = heightDiff > 150; // Threshold for keyboard detection
      setKeyboardVisible(isKeyboardVisible);
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth];

  // Determine header right content
  const resolvedHeaderRight = headerRight ?? (onSkip ? (
    <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground text-sm">
      {skipLabel}
    </Button>
  ) : null);

  return (
    <div 
      className="fixed inset-0 bg-background flex flex-col"
      style={{
        // iOS safe area padding on sides
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Fixed Header */}
      <header 
        ref={headerRef}
        className="flex-shrink-0 border-b border-border bg-background z-10"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Logo Row (optional) */}
        {headerLogo && (
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-foreground">FitConnect</span>
            </div>
            {resolvedHeaderRight}
          </div>
        )}

        {/* Progress Bar */}
        {!hideProgress && (
          <div className={cn("px-4 pt-3 mx-auto w-full", maxWidthClass)}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Title Row (only show if not using headerLogo OR if there's a title) */}
        {(title || (!headerLogo && resolvedHeaderRight) || showBackButton) && (
          <div className={cn("flex items-center justify-between px-4 py-3 mx-auto w-full", maxWidthClass)}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {showBackButton && onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="flex-shrink-0 -ml-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {!headerLogo && resolvedHeaderRight && (
              <div className="flex-shrink-0 ml-2">
                {resolvedHeaderRight}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Scrollable Content Area - takes remaining space */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain",
          "px-4 py-6",
          contentClassName
        )}
      >
        <div className={cn("mx-auto w-full", maxWidthClass)}>
          {children}
        </div>
      </main>

      {/* Fixed Footer - adjusts for keyboard */}
      {!hideFooter && (footer || footerActions) && (
        <footer 
          ref={footerRef}
          className={cn(
            "flex-shrink-0 border-t border-border bg-background z-10",
            "transition-transform duration-200 ease-out"
          )}
          style={{
            paddingBottom: keyboardVisible ? '0.5rem' : 'max(env(safe-area-inset-bottom), 1rem)',
            // When keyboard is visible, footer stays at visual viewport bottom
            transform: keyboardVisible ? `translateY(0)` : undefined,
          }}
        >
          <div className={cn("px-4 pt-4 mx-auto w-full", maxWidthClass)}>
            {footer ? (
              footer
            ) : footerActions ? (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {footerActions.secondary && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={footerActions.secondary.onClick}
                    disabled={footerActions.secondary.disabled}
                    className="w-full sm:w-auto"
                  >
                    {footerActions.secondary.label}
                  </Button>
                )}
                {footerActions.primary && (
                  <Button
                    type="button"
                    onClick={footerActions.primary.onClick}
                    disabled={footerActions.primary.disabled || footerActions.primary.loading}
                    className="w-full sm:w-auto"
                  >
                    {footerActions.primary.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      footerActions.primary.label
                    )}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </footer>
      )}
    </div>
  );
}
