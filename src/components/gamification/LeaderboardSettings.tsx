import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Trophy, Eye, EyeOff, MapPin, Info, Shield } from 'lucide-react';

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

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., London"
                    value={city || ''}
                    onChange={(e) => onUpdate('city', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County/Region</Label>
                  <Input
                    id="county"
                    placeholder="e.g., Greater London"
                    value={county || ''}
                    onChange={(e) => onUpdate('county', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United Kingdom"
                    value={country || ''}
                    onChange={(e) => onUpdate('country', e.target.value || null)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your location determines which regional leaderboards you appear on.
              </p>
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
