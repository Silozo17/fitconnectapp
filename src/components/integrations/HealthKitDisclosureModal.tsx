import { useTranslation } from "react-i18next";
import { Activity, Heart, Scale, Lock, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HealthKitDisclosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * HealthKit disclosure modal - required by Apple for iOS App Store compliance (Guideline 2.5.1)
 * Must be shown before requesting HealthKit permissions to explain:
 * - What data types are accessed
 * - Why the data is used
 * - Privacy assurances
 */
export const HealthKitDisclosureModal = ({
  open,
  onOpenChange,
  onContinue,
  isLoading = false,
}: HealthKitDisclosureModalProps) => {
  const { t } = useTranslation('settings');

  const dataTypes = [
    {
      icon: Activity,
      title: t('healthkit.dataTypes.activity', 'Activity'),
      description: t('healthkit.dataTypes.activityDesc', 'Steps, calories burned, distance walked'),
    },
    {
      icon: Heart,
      title: t('healthkit.dataTypes.workouts', 'Workouts'),
      description: t('healthkit.dataTypes.workoutsDesc', 'Exercise sessions and duration'),
    },
    {
      icon: Scale,
      title: t('healthkit.dataTypes.body', 'Body Measurements'),
      description: t('healthkit.dataTypes.bodyDesc', 'Weight data if available'),
    },
  ];

  const handleContinue = () => {
    onContinue();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            {t('healthkit.title', 'Apple Health Integration')}
          </DialogTitle>
          <DialogDescription>
            {t('healthkit.description', 'FitConnect requests access to your Apple Health data to provide personalized fitness insights.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data Types Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              {t('healthkit.dataWeAccess', 'Data We Access')}
            </h4>
            <div className="space-y-2">
              {dataTypes.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How We Use Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t('healthkit.howWeUse', 'How We Use This Data')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('healthkit.use1', 'Display your health metrics on your dashboard')}</li>
              <li>{t('healthkit.use2', 'Track your fitness progress over time')}</li>
              <li>{t('healthkit.use3', 'Share insights with your coach (only with your permission)')}</li>
            </ul>
          </div>

          {/* Privacy Section */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('healthkit.privacyTitle', 'Your Privacy')}</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>• {t('healthkit.privacy1', 'Your HealthKit data is never sold to third parties')}</li>
                  <li>• {t('healthkit.privacy2', 'Your HealthKit data is never used for advertising')}</li>
                  <li>• {t('healthkit.privacy3', 'You can revoke access anytime in iOS Settings')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t('healthkit.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? t('healthkit.connecting', 'Connecting...') : t('healthkit.continue', 'Continue to Connect')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HealthKitDisclosureModal;
