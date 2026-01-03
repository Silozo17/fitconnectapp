import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useWearables } from "@/hooks/useWearables";

/**
 * Apple Health status widget for iOS devices
 * Shows Apple Health connection status prominently on the client dashboard
 * Required for iOS App Store compliance - HealthKit must be clearly identified in UI (Guideline 2.5.1)
 */
export const HealthKitStatusWidget = () => {
  const { t } = useTranslation('common');
  const { isIOS, isDespia } = useEnvironment();
  const { connections, isLoading, getConnection } = useWearables();
  
  // Only show on iOS native apps
  if (!isDespia || !isIOS) {
    return null;
  }
  
  const appleHealthConnection = getConnection('apple_health');
  const isConnected = !!appleHealthConnection;
  
  if (isLoading) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-2 border-red-500/20 bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20 rounded-3xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Apple Health icon - using Heart with Apple-like red gradient */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {t('integrations.appleHealth.title', 'Apple Health')}
                </h3>
                {isConnected ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {t('integrations.connected', 'Connected')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    {t('integrations.notConnected', 'Not Connected')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isConnected 
                  ? t('integrations.appleHealth.syncingData', 'Syncing your health & fitness data')
                  : t('integrations.appleHealth.connectPrompt', 'Connect to sync steps, heart rate & more')
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-xl">
            <Link to="/dashboard/client/integrations">
              {isConnected 
                ? t('common.manage', 'Manage')
                : t('common.connect', 'Connect')
              }
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthKitStatusWidget;
