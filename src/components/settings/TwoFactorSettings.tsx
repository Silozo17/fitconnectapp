import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Shield, 
  ShieldOff,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
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
import { OTPVerification } from "@/components/auth/OTPVerification";

export const TwoFactorSettings = () => {
  const { user, allRoles } = useAuth();
  const { t } = useTranslation('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableStep, setDisableStep] = useState<"confirm" | "verify">("confirm");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Check if user is coach/admin/manager/staff
  const isPrivilegedUser = allRoles.some(r => 
    ['admin', 'manager', 'staff', 'coach'].includes(r)
  );

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("user_security_settings")
        .select("two_factor_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTwoFactorEnabled(data.two_factor_enabled);
      } else {
        // Default to true for privileged users
        setTwoFactorEnabled(isPrivilegedUser);
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, [user, isPrivilegedUser]);

  const handleDisable2FA = async () => {
    if (!user) return;

    // Verify password first
    setIsDisabling(true);
    setPasswordError("");

    try {
      // Re-authenticate with password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });

      if (authError) {
        setPasswordError(t("security.incorrectPassword", "Incorrect password"));
        setIsDisabling(false);
        return;
      }

      // Password verified, update 2FA setting
      const { error } = await supabase
        .from("user_security_settings")
        .update({
          two_factor_enabled: false,
          two_factor_disabled_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear 2FA session verification
      sessionStorage.removeItem("fitconnect_2fa_verified");

      setTwoFactorEnabled(false);
      setShowDisableDialog(false);
      setPassword("");
      toast.success(t("twoFactor.disabled", "Two-factor authentication has been disabled"));
    } catch (error) {
      toast.error(t("twoFactor.disableError", "Failed to disable two-factor authentication"));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!user) return;

    try {
    const { error } = await supabase
      .from("user_security_settings")
      .update({
        two_factor_enabled: true,
        two_factor_method: "email",
        two_factor_verified_at: null,
      })
      .eq('user_id', user.id);

      if (error) throw error;

      // Clear session verification so they need to verify again
      sessionStorage.removeItem("fitconnect_2fa_verified");

      setTwoFactorEnabled(true);
      toast.success(t("twoFactor.enabled", "Two-factor authentication has been enabled"));
    } catch (error) {
      toast.error(t("twoFactor.enableError", "Failed to enable two-factor authentication"));
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

  // Only show for privileged users
  if (!isPrivilegedUser) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("twoFactor.title", "Two-Factor Authentication")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t("twoFactor.description", "Add an extra layer of security to your account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                {twoFactorEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <ShieldOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">
                    {t("twoFactor.emailVerification", "Email Verification")}
                  </p>
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? t("twoFactor.enabled", "Enabled") : t("twoFactor.disabled", "Disabled")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {twoFactorEnabled
                    ? t("twoFactor.enabledDesc", "You'll receive a verification code via email when signing in")
                    : t("twoFactor.disabledDesc", "Enable to receive a verification code when signing in")
                  }
                </p>
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? "outline" : "default"}
              size="sm"
              className="shrink-0"
              onClick={() => twoFactorEnabled ? setShowDisableDialog(true) : handleEnable2FA()}
            >
              {twoFactorEnabled ? t("twoFactor.disable", "Disable") : t("twoFactor.enable", "Enable")}
            </Button>
          </div>

          {!twoFactorEnabled && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("twoFactor.recommendation", "FitConnect recommends keeping two-factor authentication enabled for enhanced account security.")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDisableDialog(false);
          setPassword("");
          setPasswordError("");
          setDisableStep("confirm");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t("twoFactor.disableTitle", "Disable Two-Factor Authentication?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {t("twoFactor.disableWarning", "Disabling two-factor authentication will make your account less secure. We strongly recommend keeping it enabled.")}
              </p>
              <div className="pt-4">
                <Label htmlFor="confirm-password" className="text-foreground">
                  {t("twoFactor.confirmPassword", "Enter your password to confirm")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="••••••••"
                  className="mt-2"
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-1">{passwordError}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisabling}>
              {t("forms.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDisable2FA();
              }}
              disabled={isDisabling || !password}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisabling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ShieldOff className="w-4 h-4 mr-2" />
              )}
              {t("twoFactor.disableConfirm", "Disable 2FA")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
