import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Eye, EyeOff, Info, Shield } from 'lucide-react';
import { LocationAutocomplete } from '@/components/shared/LocationAutocomplete';

interface LocationData {
  place_id: string;
  formatted_address: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
}

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
  // Build display value from existing location parts
  const locationDisplayValue = city 
    ? `${city}${country ? `, ${country}` : ''}`
    : '';

  const handleLocationChange = (location: string, data: LocationData | null) => {
    if (data) {
      // Auto-populate all location fields from structured data
      onUpdate('city', data.city || null);
      onUpdate('county', data.region || null);
      onUpdate('country', data.country || null);
    } else if (!location) {
      // Clear all location fields if input is cleared
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
          Leaderboard Settings
        </CardTitle>
        <CardDescription>
          Control how you appear on public leaderboards. Your privacy is important to us.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>GDPR Compliant:</strong> Leaderboards are opt-in only. When visible, only your first name (or alias) and location are shown. No photos, last names, or profile links are ever displayed.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="leaderboard-visible" className="text-base font-medium flex items-center gap-2">
              {leaderboardVisible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
              Show me on leaderboards
            </Label>
            <p className="text-sm text-muted-foreground">
              {leaderboardVisible 
                ? "You're visible on leaderboards. Others can see your rank and XP."
                : "You're hidden from all leaderboards. Toggle on to compete publicly."}
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
              <span>What others will see on the leaderboard:</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name (Optional)</Label>
                <Input
                  id="display-name"
                  placeholder="Leave empty to use your first name"
                  value={displayName || ''}
                  onChange={(e) => onUpdate('leaderboard_display_name', e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Use an alias for extra privacy. If empty, your first name will be shown.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <LocationAutocomplete
                  value={locationDisplayValue}
                  onLocationChange={handleLocationChange}
                  placeholder="Search for your city..."
                />
                <p className="text-xs text-muted-foreground">
                  Your location determines which regional leaderboards you appear on.
                </p>
              </div>

              {/* Show location breakdown if set */}
              {(city || county || country) && (
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">City:</span>{' '}
                    <span className="font-medium">{city || '—'}</span>
                  </div>
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">County:</span>{' '}
                    <span className="font-medium">{county || '—'}</span>
                  </div>
                  <div className="p-2 bg-card rounded border">
                    <span className="text-muted-foreground">Country:</span>{' '}
                    <span className="font-medium">{country || '—'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-card rounded-lg border">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">#5</span>
                <span className="font-medium">{displayName || 'Your First Name'}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{city || 'City'}</span>
                <span className="ml-auto text-primary font-bold">1,234 XP</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
