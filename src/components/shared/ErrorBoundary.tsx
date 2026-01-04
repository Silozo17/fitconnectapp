import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Check if this is an auth-related error (JWT/token corruption)
    const errorMessage = error.message?.toLowerCase() || '';
    const isAuthError = 
      errorMessage.includes('jwt') ||
      errorMessage.includes('token') ||
      errorMessage.includes('claim') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('403');
    
    if (isAuthError) {
      console.warn('[ErrorBoundary] Auth error detected, clearing potentially corrupted tokens');
      try {
        localStorage.removeItem('sb-ntgfihgneyoxxbwmtceq-auth-token');
        localStorage.removeItem('fitconnect_cached_tier');
        localStorage.removeItem('fitconnect_tier_timestamp');
      } catch {}
    }
  }

  private handleReset = () => {
    // Clear any potentially corrupted auth state before reload
    try {
      localStorage.removeItem('sb-ntgfihgneyoxxbwmtceq-auth-token');
      localStorage.removeItem('fitconnect_cached_tier');
      localStorage.removeItem('fitconnect_tier_timestamp');
    } catch {}
    
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    // FIX: Navigate to /dashboard instead of / to ensure proper state restoration
    // RouteRestorer will handle redirecting to the correct dashboard based on role
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
