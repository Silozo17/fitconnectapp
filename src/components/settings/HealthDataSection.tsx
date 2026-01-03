import { useTranslation } from "react-i18next";
import { Heart, Activity, Lock, ExternalLink, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEnvironment } from "@/hooks/useEnvironment";

/**
 * Health & Data section for Settings
 * Required for iOS App Store compliance (Guideline 2.5.1)
 * Explains Apple Health integration and provides links to revoke access
 */
export const HealthDataSection = () => {
  const { t } = useTranslation('settings');
  const { isDespia, isIOS } = useEnvironment();
  const isIOSNative = isDespia && isIOS;

  return (
    <div className="space-y-4">
      {/* Apple Health Explanation (iOS only) */}
      {isIOSNative && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              {t('healthData.appleHealth.title', 'Apple Health')}
            </CardTitle>
            <CardDescription>
              {t('healthData.appleHealth.description', 'How we use your Apple Health data')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Types */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                {t('healthData.dataAccessed', 'Data We Access')}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('healthData.types.activity', 'Activity (steps, calories burned, distance)')}</li>
                <li>{t('healthData.types.workouts', 'Workouts (exercise sessions, duration)')}</li>
                <li>{t('healthData.types.body', 'Body measurements (weight, if available)')}</li>
              </ul>
            </div>

            {/* How We Use */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                {t('healthData.howWeUse', 'How We Use This Data')}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('healthData.use.dashboard', 'Display your health metrics on your dashboard')}</li>
                <li>{t('healthData.use.progress', 'Track your fitness progress over time')}</li>
                <li>{t('healthData.use.coach', 'Share insights with your coach (only with your permission)')}</li>
              </ul>
            </div>

            {/* Privacy Assurance */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('healthData.privacy.title', 'Your Privacy')}</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <li>• {t('healthData.privacy.notSold', 'Your HealthKit data is never sold to third parties')}</li>
                    <li>• {t('healthData.privacy.noAds', 'Your HealthKit data is never used for advertising')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Revoke Access Instructions */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-start gap-3">
                <Settings className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('healthData.revoke.title', 'Revoke Access')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('healthData.revoke.instructions', 'To revoke access, go to iOS Settings → Privacy & Security → Health → FitConnect and disable permissions.')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Data Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('healthData.general.title', 'Health Data Privacy')}
          </CardTitle>
          <CardDescription>
            {t('healthData.general.description', 'Your health data is protected and you control who can see it')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('healthData.general.explanation', 'Health data from wearables and manual entries is stored securely. You can manage sharing settings in the Privacy tab.')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/privacy#health-data" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1">
                {t('healthData.viewPrivacyPolicy', 'Privacy Policy')}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDataSection;
