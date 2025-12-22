import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
}

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
}: OnboardingLayoutProps) {
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div 
      className="flex flex-col min-h-[100dvh] bg-background"
      style={{
        // iOS safe area padding
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Fixed Header */}
      <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Progress Bar */}
        {!hideProgress && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Title Row */}
        <div className="flex items-center justify-between px-4 py-3">
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
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerRight && (
            <div className="flex-shrink-0 ml-2">
              {headerRight}
            </div>
          )}
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto",
          "px-4 py-6",
          contentClassName
        )}
      >
        {children}
      </main>

      {/* Sticky Footer */}
      <footer 
        className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        }}
      >
        <div className="px-4 pt-4">
          {footer ? (
            footer
          ) : footerActions ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              {footerActions.secondary ? (
                <Button
                  variant="outline"
                  onClick={footerActions.secondary.onClick}
                  disabled={footerActions.secondary.disabled}
                  className="sm:order-1"
                >
                  {footerActions.secondary.label}
                </Button>
              ) : (
                <div className="hidden sm:block" /> // Spacer for alignment
              )}
              {footerActions.primary && (
                <Button
                  onClick={footerActions.primary.onClick}
                  disabled={footerActions.primary.disabled || footerActions.primary.loading}
                  className="sm:order-2"
                >
                  {footerActions.primary.loading ? 'Loading...' : footerActions.primary.label}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
