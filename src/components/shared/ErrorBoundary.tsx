import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Trash2, Copy, ChevronDown, ChevronUp, Bug } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  showDetails: boolean;
  copied: boolean;
}

// Check if debug mode is enabled via URL param or localStorage
function isDebugMode(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("debug") === "1") return true;
    if (localStorage.getItem("fc_debug_errors") === "true") return true;
  } catch { /* ignore */ }
  return false;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    componentStack: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    const errorMessage = error.message?.toLowerCase() || '';
    
    // Check if this is a chunk load error (fast page switching issue)
    const isChunkError = 
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('chunkloaderror') ||
      errorMessage.includes('failed to fetch dynamically imported module') ||
      errorMessage.includes('loading css chunk');
    
    if (isChunkError) {
      console.warn('[ErrorBoundary] Chunk load error detected, auto-recovering...');
      // Auto-recover by reloading the current route
      window.location.reload();
      return;
    }
    
    // Store component stack
    this.setState({ componentStack: errorInfo.componentStack || null });
    
    // Persist error details to sessionStorage for debugging
    try {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        route: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      sessionStorage.setItem("fc_last_error", JSON.stringify(errorDetails));
    } catch { /* ignore storage errors */ }
    
    // Check if this is an auth-related error (JWT/token corruption)
    const isAuthError = 
      errorMessage.includes('jwt') ||
      errorMessage.includes('token') ||
      errorMessage.includes('claim') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('403');
    
    if (isAuthError) {
      console.warn('[ErrorBoundary] Auth error detected, clearing potentially corrupted tokens');
      try {
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_AUTH);
        localStorage.removeItem(STORAGE_KEYS.CACHED_TIER);
        localStorage.removeItem(STORAGE_KEYS.TIER_TIMESTAMP);
      } catch {}
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
    window.location.reload();
  };

  private handleClearCacheAndRetry = async () => {
    // Hard reset for PWA/native users:
    // - clears local/session storage
    // - deletes Service Worker caches
    // - unregisters Service Workers
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    try {
      // Clear Cache Storage (PWA asset cache)
      if (typeof window !== "undefined" && "caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {}

    try {
      // Unregister service workers so the next load is guaranteed fresh
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {}

    this.setState({ hasError: false, error: null, componentStack: null });

    // Force a fresh navigation (cache-bust query param)
    window.location.replace(`/auth?reset=${Date.now()}`);
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
    // Navigate to /dashboard - RouteRestorer will handle redirecting
    window.location.href = "/dashboard";
  };

  private getErrorDetails = () => {
    const { error, componentStack } = this.state;
    return {
      message: error?.message || "Unknown error",
      stack: error?.stack || "No stack trace",
      componentStack: componentStack || "No component stack",
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  };

  private handleCopyError = async () => {
    try {
      const details = this.getErrorDetails();
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch { /* ignore */ }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const showDebugUI = isDebugMode() || import.meta.env.DEV;
      const { showDetails, copied } = this.state;
      const errorDetails = this.getErrorDetails();

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

            {/* Debug Details Section */}
            {showDebugUI && (
              <div className="text-left space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="w-full justify-between gap-2"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Bug className="w-4 h-4" />
                    Error Details
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {showDetails && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                      <p className="text-sm font-mono text-destructive break-all">
                        {errorDetails.message}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Route</p>
                      <p className="text-sm font-mono text-foreground">
                        {errorDetails.route}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Stack Trace</p>
                      <pre className="text-xs font-mono text-muted-foreground bg-background/50 rounded p-2 overflow-x-auto max-h-32 overflow-y-auto">
                        {errorDetails.stack}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="w-full gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy Error Details"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleClearCacheAndRetry} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear Cache & Retry
              </Button>
              <Button variant="ghost" onClick={this.handleGoHome}>
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
