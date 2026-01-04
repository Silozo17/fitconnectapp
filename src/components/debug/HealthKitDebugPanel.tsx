import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthData } from "@/hooks/useHealthData";
import { useWearables } from "@/hooks/useWearables";
import { useSyncAllWearables } from "@/hooks/useSyncAllWearables";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Bug, RefreshCw, Database, Smartphone, Clock } from "lucide-react";

/**
 * Developer-only debug panel for troubleshooting HealthKit sync issues.
 * Access by triple-tapping the Health Data Widget header (if enabled) or via dev settings.
 */
const HealthKitDebugPanel = () => {
  const { user } = useAuth();
  const { data, isLoading, refetch, todayData } = useHealthData();
  const { connections } = useWearables();
  const { syncAll, isSyncing, appleHealthStatus, lastSyncedAt } = useSyncAllWearables();
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [dbRecordCount, setDbRecordCount] = useState<number | null>(null);

  const fetchDebugInfo = async () => {
    if (!user) return;

    // Get client profile
    const { data: profile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      setClientProfileId(profile.id);

      // Get total record count from DB
      const { count } = await supabase
        .from("health_data_sync")
        .select("*", { count: "exact", head: true })
        .eq("client_id", profile.id);

      setDbRecordCount(count);
    }
  };

  const handleForceSync = async () => {
    await syncAll({ includeAppleHealth: true });
    await refetch();
    await fetchDebugInfo();
  };

  const appleHealthConnection = connections?.find((c) => c.provider === "apple_health");

  return (
    <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
          <Bug className="w-4 h-4" />
          HealthKit Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* User & Profile Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">User ID:</span>
            <code className="bg-muted px-1 rounded text-[10px]">{user?.id?.slice(0, 8)}...</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Client Profile:</span>
            <code className="bg-muted px-1 rounded text-[10px]">
              {clientProfileId ? `${clientProfileId.slice(0, 8)}...` : "Not loaded"}
            </code>
            <Button variant="ghost" size="sm" onClick={fetchDebugInfo} className="h-5 px-1">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Apple Health:</span>
            {appleHealthConnection ? (
              <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-600">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-4 bg-red-500/10 text-red-600">
                Not Connected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last Sync:</span>
            <span>{lastSyncedAt ? format(lastSyncedAt, "MMM d, HH:mm:ss") : "Never"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sync Status:</span>
            <Badge
              variant="outline"
              className={`text-[10px] h-4 ${
                appleHealthStatus === "success"
                  ? "bg-green-500/10 text-green-600"
                  : appleHealthStatus === "failed"
                    ? "bg-red-500/10 text-red-600"
                    : appleHealthStatus === "syncing"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-muted"
              }`}
            >
              {appleHealthStatus}
            </Badge>
          </div>
        </div>

        {/* Data Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">DB Records (total):</span>
            <span>{dbRecordCount ?? "?"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Query Results:</span>
            <span>{data?.length ?? 0} records</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Today's Data:</span>
            <span>{todayData?.length ?? 0} records</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Today's Date:</span>
            <code className="bg-muted px-1 rounded">{format(new Date(), "yyyy-MM-dd")}</code>
          </div>
        </div>

        {/* Today's Data Breakdown */}
        {todayData && todayData.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Today's values:</span>
            {todayData.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-[10px]">
                <Badge variant="secondary" className="h-4">
                  {d.data_type}
                </Badge>
                <span>{d.value}</span>
                <span className="text-muted-foreground">{d.unit}</span>
                <span className="text-muted-foreground">({d.source})</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="h-7 text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
            Force Sync
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDebugInfo} className="h-7 text-xs">
            <Database className="w-3 h-3 mr-1" />
            Refresh Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthKitDebugPanel;
