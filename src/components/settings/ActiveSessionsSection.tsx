import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  LogOut,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserSession {
  id: string;
  device_info: string | null;
  platform: string | null;
  ip_country: string | null;
  ip_region: string | null;
  created_at: string;
  last_seen_at: string;
  is_current: boolean;
  is_active: boolean;
}

export const ActiveSessionsSection = () => {
  const { user } = useAuth();
  const { t } = useTranslation('settings');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  const fetchSessions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("last_seen_at", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const getDeviceIcon = (deviceInfo: string | null, platform: string | null) => {
    const info = (deviceInfo || "").toLowerCase();
    const plat = (platform || "").toLowerCase();

    if (plat.includes("ios") || plat.includes("android") || info.includes("mobile")) {
      return <Smartphone className="w-4 h-4" />;
    }
    if (info.includes("tablet") || info.includes("ipad")) {
      return <Tablet className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getLocation = (session: UserSession) => {
    if (session.ip_country && session.ip_region) {
      return `${session.ip_region}, ${session.ip_country}`;
    }
    if (session.ip_country) {
      return session.ip_country;
    }
    return t("sessions.unknownLocation", "Unknown location");
  };

  const revokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId);
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("id", sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success(t("sessions.sessionRevoked", "Session revoked successfully"));
    } catch (error) {
      toast.error(t("sessions.revokeError", "Failed to revoke session"));
    } finally {
      setIsRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!user) return;

    setIsRevokingAll(true);
    try {
      // Revoke all sessions except current (or all if we want to sign out everywhere)
      const { error } = await supabase.functions.invoke("revoke-all-sessions", {
        body: { keepCurrent: false },
      });

      if (error) throw error;

      // Sign out current user as well
      await supabase.auth.signOut();
      toast.success(t("sessions.allSessionsRevoked", "All sessions have been revoked. Please sign in again."));
    } catch (error) {
      toast.error(t("sessions.revokeAllError", "Failed to revoke all sessions"));
      setIsRevokingAll(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("sessions.activeSessions", "Active Sessions")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t("sessions.description", "Manage your active sessions across devices")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("sessions.noActiveSessions", "No active sessions found")}
            </p>
          ) : (
            <>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      {getDeviceIcon(session.device_info, session.platform)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground text-sm truncate">
                          {session.device_info || t("sessions.unknownDevice", "Unknown device")}
                        </p>
                        {session.is_current && (
                          <Badge variant="secondary" className="text-xs">
                            {t("sessions.currentSession", "Current")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getLocation(session)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t("sessions.lastActive", "Active")}{" "}
                          {formatDistanceToNow(new Date(session.last_seen_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => revokeSession(session.id)}
                      disabled={isRevoking === session.id}
                    >
                      {isRevoking === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-1" />
                          {t("sessions.revoke", "Revoke")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}

              {sessions.length > 1 && (
                <div className="pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                    onClick={() => setShowRevokeAllDialog(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("sessions.logOutAllDevices", "Log out of all devices")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("sessions.confirmLogOutAll", "Log out of all devices?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("sessions.confirmLogOutAllDesc", "This will log you out of all devices including this one. You will need to sign in again.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingAll}>
              {t("forms.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={revokeAllSessions}
              disabled={isRevokingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevokingAll ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              {t("sessions.logOutAll", "Log out all")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
