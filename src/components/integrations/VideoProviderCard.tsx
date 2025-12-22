import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Video, Unlink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoProviderCardProps {
  provider: string;
  providerName: string;
  providerIcon: React.ReactNode;
  providerColor: string;
  isConnected: boolean;
  autoCreateMeetings?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleAutoCreate?: (enabled: boolean) => void;
  isConnecting?: boolean;
  /** If another provider is already connected, this will be true */
  isBlocked?: boolean;
  /** Name of the provider that is blocking this one */
  blockedByProvider?: string | null;
}

const VideoProviderCard = ({
  provider,
  providerName,
  providerIcon,
  providerColor,
  isConnected,
  autoCreateMeetings = false,
  onConnect,
  onDisconnect,
  onToggleAutoCreate,
  isConnecting,
  isBlocked = false,
  blockedByProvider = null,
}: VideoProviderCardProps) => {
  const { t } = useTranslation('common');

  return (
    <Card className={cn(
      "bg-card/50 border-border/50 transition-all",
      isBlocked && !isConnected ? "opacity-60" : "hover:border-primary/30"
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
              {isConnected && (
                <Badge variant="outline" className="mt-1 text-xs text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  {t('integrations.connected')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            {onToggleAutoCreate && (
              <div className="flex items-center justify-between">
                <Label htmlFor={`auto-create-${provider}`} className="text-sm">
                  {t('integrations.video.autoCreateMeetings')}
                </Label>
                <Switch
                  id={`auto-create-${provider}`}
                  checked={autoCreateMeetings}
                  onCheckedChange={onToggleAutoCreate}
                />
              </div>
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
        ) : isBlocked ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {blockedByProvider 
                  ? t('integrations.video.blockedByOther', { provider: blockedByProvider })
                  : t('integrations.video.onlyOneProvider')}
              </p>
            </div>
            <Button
              disabled
              className="w-full"
              variant="outline"
            >
              <Video className="w-4 h-4 mr-2" />
              {t('integrations.connect')} {providerName}
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
              <Video className="w-4 h-4 mr-2" />
            )}
            {t('integrations.connect')} {providerName}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoProviderCard;
