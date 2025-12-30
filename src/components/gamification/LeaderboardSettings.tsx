import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Eye, EyeOff, Info, Shield } from 'lucide-react';
import { LocationAutocomplete } from '@/components/shared/LocationAutocomplete';
import type { PlaceLocationData } from '@/types/location';

// Use canonical type
type LocationData = PlaceLocationData;

interface LeaderboardSettingsProps {
  leaderboardVisible: boolean;
  displayName: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  onUpdate: (field: string, value: any) => void;
}

export function LeaderboardSettings({
  leaderboardVisible,
  displayName,
  city,
  county,
  country,
  onUpdate,
}: LeaderboardSettingsProps) {
  const { t } = useTranslation('gamification');
  
  const locationDisplayValue = city 
    ? `${city}${country ? `, ${country}` : ''}`
    : '';

  const handleLocationChange = (location: string, data: LocationData | null) => {
    console.log('[LeaderboardSettings] handleLocationChange called:', { location, data });
    if (data) {
      console.log('[LeaderboardSettings] Updating fields - city:', data.city, 'county:', data.region, 'country:', data.country);
      onUpdate('city', data.city || null);
      onUpdate('county', data.region || null);
      onUpdate('country', data.country || null);
    } else if (!location) {
      console.log('[LeaderboardSettings] Clearing all location fields');
      onUpdate('city', null);
      onUpdate('county', null);
      onUpdate('country', null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t('leaderboard.settings.title')}
        </CardTitle>
        <CardDescription>
          {t('leaderboard.settings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('leaderboard.settings.gdprNotice')}</strong> {t('leaderboard.settings.gdprDescription')}
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="leaderboard-visible" className="text-base font-medium flex items-center gap-2">
              {leaderboardVisible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
              {t('leaderboard.settings.showOnLeaderboards')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {leaderboardVisible 
                ? t('leaderboard.settings.visibleDescription')
                : t('leaderboard.settings.hiddenDescription')}
            </p>
          </div>
          <Switch
            id="leaderboard-visible"
            checked={leaderboardVisible}
            onCheckedChange={(checked) => onUpdate('leaderboard_visible', checked)}
          />
        </div>

        {leaderboardVisible && (
          <div className="space-y-4 p-4 border rounded-lg border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Info className="h-4 w-4" />
              <span>{t('leaderboard.settings.whatOthersSee')}</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">{t('leaderboard.settings.displayName')}</Label>
                <Input
                  id="display-name"
                  placeholder={t('leaderboard.settings.displayNamePlaceholder')}
                  value={displayName || ''}
                  onChange={(e) => onUpdate('leaderboard_display_name', e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('leaderboard.settings.displayNameHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('leaderboard.settings.location')}</Label>
                <LocationAutocomplete
                  value={locationDisplayValue}
                  onLocationChange={handleLocationChange}
                  placeholder={t('leaderboard.settings.locationPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('leaderboard.settings.locationHint')}
                </p>
              </div>

              {(city || county || country) && (
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">{t('leaderboard.settings.city')}:</span>{' '}
                    <span className="font-medium">{city || '—'}</span>
                  </div>
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">{t('leaderboard.settings.county')}:</span>{' '}
                    <span className="font-medium">{county || '—'}</span>
                  </div>
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">{t('leaderboard.settings.country')}:</span>{' '}
                    <span className="font-medium">{country || '—'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-card rounded-lg border">
              <p className="text-sm font-medium mb-2">{t('leaderboard.settings.preview')}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">#5</span>
                <span className="font-medium">{displayName || t('leaderboard.settings.yourFirstName')}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{city || t('leaderboard.settings.city')}</span>
                <span className="ml-auto text-primary font-bold">1,234 XP</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
