import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, RefreshCw, Unlink } from "lucide-react";
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
  disabled?: boolean;
  disabledMessage?: string;
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
  disabled,
  disabledMessage,
}: WearableConnectionCardProps) => {
  const { t } = useTranslation('common');

  return (
    <Card variant="glass" className={cn(
      "hover:border-primary/30 transition-all min-h-[160px]",
      disabled && "opacity-75"
    )}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              providerColor
            )}
          >
            {providerIcon}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{providerName}</CardTitle>
            {isConnected && (
              <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 text-primary border-primary/30">
                <Check className="w-2.5 h-2.5 mr-0.5" />
                {t('integrations.connected')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {disabled ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {disabledMessage}
            </p>
            <Button disabled className="w-full" variant="secondary" size="sm">
              {t('integrations.installApp', 'Install App')}
            </Button>
          </div>
        ) : isConnected ? (
          <div className="space-y-2">
            {lastSynced && (
              <p className="text-xs text-muted-foreground truncate">
                {t('integrations.lastSync', { time: format(new Date(lastSynced), "MMM d, h:mm a") })}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onSync}
                disabled={isSyncing}
                className="flex-1 text-xs"
              >
                {isSyncing ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                {t('integrations.syncNow')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDisconnect}
                className="text-destructive hover:text-destructive px-2"
              >
                <Unlink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
            size="sm"
          >
            {isConnecting ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : null}
            {t('integrations.connect')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WearableConnectionCard;
