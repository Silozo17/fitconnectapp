import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  X, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  isConnected: boolean;
  isLoading?: boolean;
  lastSynced?: string | null;
  status?: "connected" | "disconnected" | "error" | "needs_setup";
  statusMessage?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
  onConfigure?: () => void;
  toggleEnabled?: boolean;
  toggleLabel?: string;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  helpUrl?: string;
}

const IntegrationCard = ({
  name,
  description,
  icon,
  iconBgColor,
  isConnected,
  isLoading,
  lastSynced,
  status = isConnected ? "connected" : "disconnected",
  statusMessage,
  onConnect,
  onDisconnect,
  onSync,
  onConfigure,
  toggleEnabled,
  toggleLabel,
  toggleValue,
  onToggle,
  helpUrl,
}: IntegrationCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "needs_setup":
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Settings className="w-3 h-3 mr-1" />
            Setup Required
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <X className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center shadow-lg`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusMessage && (
          <p className="text-sm text-muted-foreground">{statusMessage}</p>
        )}

        {lastSynced && isConnected && (
          <p className="text-xs text-muted-foreground">
            Last synced {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
          </p>
        )}

        {toggleEnabled && isConnected && onToggle && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor={`toggle-${name}`} className="text-sm font-medium cursor-pointer">
              {toggleLabel}
            </Label>
            <Switch
              id={`toggle-${name}`}
              checked={toggleValue}
              onCheckedChange={onToggle}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {isConnected ? (
            <>
              {onSync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              )}
              {onConfigure && (
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              )}
              {onDisconnect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDisconnect}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Disconnect
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={onConnect}
                disabled={isLoading || status === "needs_setup"}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Connect
              </Button>
              {helpUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={helpUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Setup Guide
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
