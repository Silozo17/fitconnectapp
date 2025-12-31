import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Database, HardDrive, Shield, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface DiagnosticsData {
  dbTier: string | null;
  localStorageTier: string | null;
  effectiveTier: string;
  isFounder: boolean;
  profileLoading: boolean;
  hasFreshData: boolean;
  platformSubscription: {
    tier: string | null;
    status: string | null;
    expiresAt: string | null;
  } | null;
  adminGrant: {
    tier: string | null;
    isActive: boolean;
    expiresAt: string | null;
    reason: string | null;
  } | null;
  tierChanges: Array<{
    id: string;
    old_tier: string | null;
    new_tier: string | null;
    created_at: string;
    change_source: string | null;
  }>;
}

/**
 * Admin-only component for debugging subscription state
 * Shows tier from all sources to diagnose inconsistencies
 */
export const SubscriptionDiagnostics = () => {
  const { currentTier, isFounder, isLoading, hasFreshData } = useFeatureAccess();
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      // Get localStorage tier
      let localStorageTier: string | null = null;
      try {
        localStorageTier = localStorage.getItem('fitconnect_cached_tier');
      } catch {}

      // Get platform subscription
      let platformSubscription = null;
      if (coachProfile?.id) {
        const { data: subData } = await supabase
          .from('platform_subscriptions')
          .select('tier, status, current_period_end')
          .eq('coach_id', coachProfile.id)
          .maybeSingle();
        
        if (subData) {
          platformSubscription = {
            tier: subData.tier,
            status: subData.status,
            expiresAt: subData.current_period_end,
          };
        }
      }

      // Get admin grant
      let adminGrant = null;
      if (coachProfile?.id) {
        const { data: grantData } = await supabase
          .from('admin_granted_subscriptions')
          .select('tier, is_active, expires_at, reason')
          .eq('coach_id', coachProfile.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (grantData) {
          adminGrant = {
            tier: grantData.tier,
            isActive: grantData.is_active || false,
            expiresAt: grantData.expires_at,
            reason: grantData.reason,
          };
        }
      }

      // Get recent tier changes
      let tierChanges: DiagnosticsData['tierChanges'] = [];
      if (coachProfile?.id) {
        const { data: changesData } = await supabase
          .from('subscription_tier_changes')
          .select('id, old_tier, new_tier, created_at, change_source')
          .eq('coach_id', coachProfile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (changesData) {
          tierChanges = changesData;
        }
      }

      setDiagnostics({
        dbTier: coachProfile?.subscription_tier || null,
        localStorageTier,
        effectiveTier: currentTier,
        isFounder,
        profileLoading,
        hasFreshData,
        platformSubscription,
        adminGrant,
        tierChanges,
      });
    } catch (e) {
      console.error('Failed to load diagnostics:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (coachProfile?.id && !profileLoading) {
      loadDiagnostics();
    }
  }, [coachProfile?.id, profileLoading]);

  const getTierBadgeColor = (tier: string | null) => {
    switch (tier) {
      case 'founder': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'enterprise': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'starter': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'free': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-destructive/20 text-destructive border-destructive/30';
    }
  };

  if (!diagnostics) {
    return (
      <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            Subscription Diagnostics (Loading...)
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const hasInconsistency = diagnostics.dbTier !== diagnostics.localStorageTier || 
                          diagnostics.dbTier !== diagnostics.effectiveTier;

  return (
    <Card className={`border-dashed ${hasInconsistency ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {hasInconsistency ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Shield className="h-4 w-4 text-amber-500" />
            )}
            Subscription Diagnostics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDiagnostics}
            disabled={isRefreshing}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Tier Sources */}
        <div className="space-y-2">
          <p className="text-muted-foreground font-medium">Tier Sources:</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Database className="h-3 w-3" />
                Database
              </div>
              <Badge variant="outline" className={getTierBadgeColor(diagnostics.dbTier)}>
                {diagnostics.dbTier || 'null'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                LocalStorage
              </div>
              <Badge variant="outline" className={getTierBadgeColor(diagnostics.localStorageTier)}>
                {diagnostics.localStorageTier || 'null'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="h-3 w-3" />
                Effective
              </div>
              <Badge variant="outline" className={getTierBadgeColor(diagnostics.effectiveTier)}>
                {diagnostics.effectiveTier}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Flags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={diagnostics.isFounder ? "default" : "outline"} className="text-xs">
            Founder: {diagnostics.isFounder ? 'Yes' : 'No'}
          </Badge>
          <Badge variant={diagnostics.hasFreshData ? "default" : "outline"} className="text-xs">
            Fresh Data: {diagnostics.hasFreshData ? 'Yes' : 'No'}
          </Badge>
          <Badge variant={diagnostics.profileLoading ? "outline" : "default"} className="text-xs">
            Loading: {diagnostics.profileLoading ? 'Yes' : 'No'}
          </Badge>
        </div>

        {/* Platform Subscription */}
        {diagnostics.platformSubscription && (
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Platform Subscription:</p>
            <div className="text-xs space-y-1 pl-2 border-l-2 border-border">
              <p>Tier: <span className="font-mono">{diagnostics.platformSubscription.tier}</span></p>
              <p>Status: <span className="font-mono">{diagnostics.platformSubscription.status}</span></p>
              {diagnostics.platformSubscription.expiresAt && (
                <p>Expires: <span className="font-mono">{format(new Date(diagnostics.platformSubscription.expiresAt), 'PPp')}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Admin Grant */}
        {diagnostics.adminGrant && (
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Admin Grant:</p>
            <div className="text-xs space-y-1 pl-2 border-l-2 border-amber-500">
              <p>Tier: <span className="font-mono">{diagnostics.adminGrant.tier}</span></p>
              <p>Active: <span className="font-mono">{diagnostics.adminGrant.isActive ? 'Yes' : 'No'}</span></p>
              {diagnostics.adminGrant.expiresAt && (
                <p>Expires: <span className="font-mono">{format(new Date(diagnostics.adminGrant.expiresAt), 'PPp')}</span></p>
              )}
              {diagnostics.adminGrant.reason && (
                <p>Reason: <span className="font-mono">{diagnostics.adminGrant.reason}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Recent Tier Changes */}
        {diagnostics.tierChanges.length > 0 && (
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recent Tier Changes:
            </p>
            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
              {diagnostics.tierChanges.map((change) => (
                <div key={change.id} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                  <Badge variant="outline" className={getTierBadgeColor(change.old_tier)}>
                    {change.old_tier || 'null'}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className={getTierBadgeColor(change.new_tier)}>
                    {change.new_tier || 'null'}
                  </Badge>
                  <span className="text-muted-foreground ml-auto">
                    {format(new Date(change.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasInconsistency && (
          <div className="p-2 bg-destructive/10 rounded border border-destructive/30 text-destructive">
            <p className="font-medium">⚠️ Tier Inconsistency Detected</p>
            <p className="text-xs mt-1">
              DB, localStorage, and effective tier don't match. This may indicate a sync issue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
