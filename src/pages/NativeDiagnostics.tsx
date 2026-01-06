import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthSafe } from "@/contexts/AuthContext";
import { getEnvironment } from "@/hooks/useEnvironment";
import { clearAllNativeCache } from "@/lib/native-cache";
import { clearViewState } from "@/lib/view-restoration";
import { RefreshCw, Trash2, Home, Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface BootStage {
  stage: string;
  timestamp: number;
}

/**
 * Native Diagnostics Page
 * 
 * Accessible without auth at /debug/native
 * Shows critical app state for debugging Android black screen issues
 */
const NativeDiagnostics = () => {
  const navigate = useNavigate();
  const auth = useAuthSafe();
  const [serviceWorkers, setServiceWorkers] = useState<string[]>([]);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [bootStages, setBootStages] = useState<BootStage[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  const env = getEnvironment();

  useEffect(() => {
    // Load boot stages from sessionStorage
    try {
      const stages = sessionStorage.getItem("fc_boot_stages");
      if (stages) {
        setBootStages(JSON.parse(stages));
      }
    } catch {}

    // Load last error
    try {
      const error = sessionStorage.getItem("fc_last_global_error");
      if (error) {
        setLastError(JSON.parse(error));
      }
    } catch {}

    // Get service worker registrations
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        setServiceWorkers(registrations.map((r) => r.scope));
      });
    }

    // Get cache storage keys
    if ("caches" in window) {
      caches.keys().then((keys) => {
        setCacheKeys(keys);
      });
    }
  }, []);

  const handleOneTapRecovery = async () => {
    setIsRecovering(true);
    
    try {
      // Step 1: Clear localStorage (except diagnostics log)
      const diagLog = sessionStorage.getItem("fc_boot_stages");
      localStorage.clear();
      
      // Step 2: Clear sessionStorage
      sessionStorage.clear();
      if (diagLog) {
        sessionStorage.setItem("fc_boot_stages_backup", diagLog);
      }
      
      // Step 3: Clear native cache
      clearAllNativeCache();
      
      // Step 4: Clear view state
      clearViewState();
      
      // Step 5: Unregister all service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      
      // Step 6: Clear all caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      
      // Step 7: Hard reload to auth page
      window.location.href = `/auth?reset=${Date.now()}`;
    } catch (error) {
      console.error("[NativeDiagnostics] Recovery failed:", error);
      setIsRecovering(false);
      // Even on error, try to redirect
      window.location.href = `/auth?reset=${Date.now()}`;
    }
  };

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );

  return (
    <div className="min-h-screen bg-background p-4 safe-area-inset">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Native Diagnostics</h1>
          </div>
          <Badge variant={env.isDespia ? "default" : "secondary"}>
            {env.isDespia ? "Despia" : env.isPWA ? "PWA" : "Browser"}
          </Badge>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span>{env.isIOS ? "iOS" : env.isAndroid ? "Android" : "Web"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">isDespia</span>
              <StatusIcon ok={env.isDespia} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">isPWA</span>
              <span>{env.isPWA ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User Agent</span>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
              {navigator.userAgent}
            </pre>
          </CardContent>
        </Card>

        {/* Auth State */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auth State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Loading</span>
              {auth?.loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
              ) : (
                <StatusIcon ok={!auth?.loading} />
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">User Present</span>
              <StatusIcon ok={!!auth?.user} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Session Present</span>
              <StatusIcon ok={!!auth?.session} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Role</span>
              <span>{auth?.role || "none"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">All Roles</span>
              <span>{auth?.allRoles?.join(", ") || "none"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Boot Stages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Boot Stages</CardTitle>
          </CardHeader>
          <CardContent>
            {bootStages.length > 0 ? (
              <div className="space-y-1 text-xs">
                {bootStages.map((stage, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <span>{new Date(stage.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No boot stages recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Service Workers & Caches */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Service Workers & Caches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Service Workers</span>
              <Badge variant={serviceWorkers.length > 0 ? "destructive" : "secondary"}>
                {serviceWorkers.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cache Storage Keys</span>
              <Badge variant={cacheKeys.length > 0 ? "outline" : "secondary"}>
                {cacheKeys.length}
              </Badge>
            </div>
            {serviceWorkers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                <span>SW active in Despia can cause issues</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Error */}
        {lastError && (
          <Card className="border-red-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-500">Last Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-red-500/10 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(lastError, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleOneTapRecovery}
            disabled={isRecovering}
          >
            {isRecovering ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            One-Tap Recovery (Clear All & Reload)
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Current path: {window.location.pathname}
          <br />
          Time since mount: {Math.round((Date.now() - performance.timing.navigationStart) / 1000)}s
          <br />
          App version: {import.meta.env.VITE_APP_VERSION || "dev"}
        </p>
      </div>
    </div>
  );
};

export default NativeDiagnostics;
