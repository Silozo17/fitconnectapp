import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Calendar, Unlink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarConnectionCardProps {
  provider: string;
  providerName: string;
  providerIcon: React.ReactNode;
  providerColor: string;
  isConnected: boolean;
  syncEnabled?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleSync?: (enabled: boolean) => void;
  onSyncAll?: () => void;
  isConnecting?: boolean;
  isSyncing?: boolean;
  supportsTwoWaySync?: boolean;
}

const CalendarConnectionCard = ({
  provider,
  providerName,
  providerIcon,
  providerColor,
  isConnected,
  syncEnabled = false,
  onConnect,
  onDisconnect,
  onToggleSync,
  onSyncAll,
  isConnecting,
  isSyncing,
  supportsTwoWaySync = false,
}: CalendarConnectionCardProps) => {
  const { t } = useTranslation('common');

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
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
              <div className="flex items-center gap-2 mt-1">
                {isConnected && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    <Check className="w-3 h-3 mr-1" />
                    {t('integrations.connected')}
                  </Badge>
                )}
                {supportsTwoWaySync && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {t('integrations.calendar.twoWaySync')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            {onToggleSync && (
              <div className="flex items-center justify-between">
                <Label htmlFor={`sync-${provider}`} className="text-sm">
                  {t('integrations.calendar.syncToCalendar')}
                </Label>
                <Switch
                  id={`sync-${provider}`}
                  checked={syncEnabled}
                  onCheckedChange={onToggleSync}
                />
              </div>
            )}
            {supportsTwoWaySync && (
              <p className="text-xs text-muted-foreground">
                {t('integrations.calendar.twoWaySyncDescription')}
              </p>
            )}
            {onSyncAll && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSyncAll}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? t('integrations.calendar.syncing') : t('integrations.calendar.syncAllSessions')}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisconnect}
              className="w-full text-destructive hover:text-destructive"
            >
              <Unlink className="w-4 h-4 mr-2" />
              {t('integrations.disconnect')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            {t('integrations.connect')} {providerName}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarConnectionCard;
