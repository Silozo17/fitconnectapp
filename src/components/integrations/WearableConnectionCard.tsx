import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, RefreshCw, Unlink, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WearableConnectionCardProps {
  provider: string;
  providerName: string;
  providerIcon: React.ReactNode;
  providerColor: string;
  isConnected: boolean;
  lastSynced?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isConnecting?: boolean;
  isSyncing?: boolean;
  comingSoon?: boolean;
  comingSoonDescription?: string;
}

const WearableConnectionCard = ({
  provider,
  providerName,
  providerIcon,
  providerColor,
  isConnected,
  lastSynced,
  onConnect,
  onDisconnect,
  onSync,
  isConnecting,
  isSyncing,
  comingSoon,
  comingSoonDescription,
}: WearableConnectionCardProps) => {
  return (
    <Card className={cn(
      "bg-card/50 border-border/50 hover:border-primary/30 transition-all",
      comingSoon && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                providerColor
              )}
            >
              {providerIcon}
            </div>
            <div>
              <CardTitle className="text-lg">{providerName}</CardTitle>
              {comingSoon ? (
                <Badge variant="secondary" className="mt-1 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
              ) : isConnected ? (
                <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {comingSoon ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {comingSoonDescription || "This integration is coming soon."}
            </p>
            <Button disabled className="w-full" variant="secondary">
              Coming Soon
            </Button>
          </div>
        ) : isConnected ? (
          <div className="space-y-3">
            {lastSynced && (
              <p className="text-sm text-muted-foreground">
                Last synced: {format(new Date(lastSynced), "MMM d, yyyy h:mm a")}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onSync}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDisconnect}
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Connect {providerName}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WearableConnectionCard;
