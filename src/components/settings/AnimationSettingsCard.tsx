import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, Sparkles, PartyPopper } from "lucide-react";
import { useAnimationSettings } from "@/contexts/AnimationSettingsContext";
import { useTranslation } from "react-i18next";

export function AnimationSettingsCard() {
  const { t } = useTranslation('settings');
  const {
    celebrationsEnabled,
    confettiEnabled,
    prefersReducedMotion,
    setCelebrationsEnabled,
    setConfettiEnabled,
  } = useAnimationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PartyPopper className="h-5 w-5" />
          {t('preferences.animations.title', 'Celebration Animations')}
        </CardTitle>
        <CardDescription>
          {t('preferences.animations.description', 'Configure celebration effects for achievements and milestones')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System reduced motion notice */}
        {prefersReducedMotion && (
          <div className="flex items-start gap-3 rounded-lg bg-muted p-4 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                {t('preferences.animations.reducedMotionTitle', 'Reduced Motion Enabled')}
              </p>
              <p className="text-muted-foreground mt-1">
                {t('preferences.animations.reducedMotionNotice', 'Your system prefers reduced motion. Animations are automatically disabled for accessibility.')}
              </p>
            </div>
          </div>
        )}

        {/* Main celebrations toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="celebrations-enabled" className="text-base font-medium">
              {t('preferences.animations.enableCelebrations', 'Enable Celebrations')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('preferences.animations.enableCelebrationsDesc', 'Show visual celebrations when you achieve milestones')}
            </p>
          </div>
          <Switch
            id="celebrations-enabled"
            checked={celebrationsEnabled && !prefersReducedMotion}
            onCheckedChange={setCelebrationsEnabled}
            disabled={prefersReducedMotion}
            aria-describedby="celebrations-description"
          />
        </div>

        {/* Confetti sub-toggle (only shown when celebrations enabled) */}
        {celebrationsEnabled && !prefersReducedMotion && (
          <div className="flex items-center justify-between gap-4 pl-4 border-l-2 border-muted">
            <div className="space-y-1">
              <Label htmlFor="confetti-enabled" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('preferences.animations.enableConfetti', 'Confetti Effects')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.animations.enableConfettiDesc', 'Show confetti burst animations for achievements')}
              </p>
            </div>
            <Switch
              id="confetti-enabled"
              checked={confettiEnabled}
              onCheckedChange={setConfettiEnabled}
            />
          </div>
        )}

        {/* Accessibility note */}
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {t('preferences.animations.accessibilityNote', 'Animations respect your system accessibility settings automatically.')}
        </p>
      </CardContent>
    </Card>
  );
}
