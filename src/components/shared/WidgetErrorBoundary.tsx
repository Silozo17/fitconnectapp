import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallbackClassName?: string;
  /** Hide the error UI completely if true */
  silent?: boolean;
  /** Name of the widget for error logging */
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Local error boundary for dashboard widgets/sections.
 * Prevents a single widget crash from taking down the entire app.
 * Shows a minimal retry UI instead of the global error page.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const widgetName = this.props.widgetName || "Unknown Widget";
    
    // Log to console in dev
    if (import.meta.env.DEV) {
      console.error(`[WidgetErrorBoundary:${widgetName}]`, error, errorInfo);
    }
    
    // Store error details for debugging
    try {
      const errorDetails = {
        widget: widgetName,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        route: window.location.pathname,
      };
      
      // Keep last 10 widget errors
      const existing = JSON.parse(sessionStorage.getItem("fc_widget_errors") || "[]");
      existing.push(errorDetails);
      if (existing.length > 10) existing.shift();
      sessionStorage.setItem("fc_widget_errors", JSON.stringify(existing));
    } catch { /* ignore storage errors */ }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Silent mode - render nothing
      if (this.props.silent) {
        return null;
      }
      
      return (
        <div className={cn(
          "flex flex-col items-center justify-center py-8 px-4 rounded-2xl bg-muted/30 border border-border/50",
          this.props.fallbackClassName
        )}>
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground text-center mb-3">
            This section failed to load
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
          
          {/* Show error details in dev mode */}
          {import.meta.env.DEV && this.state.error && (
            <p className="text-xs text-destructive/70 mt-2 max-w-xs truncate">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
