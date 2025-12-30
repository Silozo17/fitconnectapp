import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerification } from "./OTPVerification";
import { Loader2, Shield, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface TwoFactorGateProps {
  children: React.ReactNode;
}

const SESSION_STORAGE_KEY = "fitconnect_2fa_verified";
const VERIFICATION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const TwoFactorGate = ({ children }: TwoFactorGateProps) => {
  const { user, role, allRoles } = useAuth();
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Check if user is coach/admin/manager/staff
  const isPrivilegedUser = allRoles.some(r => 
    ['admin', 'manager', 'staff', 'coach'].includes(r)
  );

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user || !isPrivilegedUser) {
        setIsChecking(false);
        return;
      }

      // Check session storage for recent verification
      const storedVerification = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedVerification) {
        try {
          const { timestamp, userId } = JSON.parse(storedVerification);
          const now = Date.now();
          if (userId === user.id && now - timestamp < VERIFICATION_DURATION_MS) {
            setIsVerified(true);
            setIsChecking(false);
            return;
          }
        } catch {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      // Check if user just signed up (created within last 5 minutes)
      // If so, auto-verify 2FA since they just completed email OTP during signup
      const userCreatedAt = new Date(user.created_at).getTime();
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const isRecentSignup = userCreatedAt > fiveMinutesAgo;

      // Check database for 2FA settings
      const { data: settings } = await supabase
        .from("user_security_settings")
        .select("two_factor_enabled, two_factor_verified_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!settings) {
        // No settings exist - create default (2FA enabled for privileged users)
        // If recent signup, also mark as verified to skip duplicate OTP
        await supabase
          .from("user_security_settings")
          .insert({
            user_id: user.id,
            two_factor_enabled: true,
            two_factor_method: "email",
            two_factor_verified_at: isRecentSignup ? new Date().toISOString() : null,
          });
        
        if (isRecentSignup) {
          // Auto-verify for fresh signups
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            userId: user.id,
          }));
          setIsVerified(true);
        } else {
          setRequires2FA(true);
        }
      } else if (settings.two_factor_enabled) {
        // Check if recently verified in database
        if (settings.two_factor_verified_at) {
          const verifiedAt = new Date(settings.two_factor_verified_at).getTime();
          const now = Date.now();
          if (now - verifiedAt < VERIFICATION_DURATION_MS) {
            setIsVerified(true);
            // Store in session for faster checks
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
              timestamp: verifiedAt,
              userId: user.id,
            }));
          } else if (isRecentSignup) {
            // User just signed up but somehow settings already exist without verification
            // Auto-verify to prevent duplicate OTP
            await supabase
              .from("user_security_settings")
              .update({ two_factor_verified_at: new Date().toISOString() })
              .eq("user_id", user.id);
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
              timestamp: Date.now(),
              userId: user.id,
            }));
            setIsVerified(true);
          } else {
            setRequires2FA(true);
          }
        } else if (isRecentSignup) {
          // Fresh signup with 2FA enabled but not yet verified - auto-verify
          await supabase
            .from("user_security_settings")
            .update({ two_factor_verified_at: new Date().toISOString() })
            .eq("user_id", user.id);
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            userId: user.id,
          }));
          setIsVerified(true);
        } else {
          setRequires2FA(true);
        }
      }
      // If two_factor_enabled is false, no 2FA required

      setIsChecking(false);
    };

    check2FAStatus();
  }, [user, isPrivilegedUser]);

  const sendOTP = async () => {
    if (!user?.email) return;
    
    setIsSendingOTP(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email: user.email, purpose: "2fa" },
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success(t("otp.verificationSent", "Verification code sent to your email"));
    } catch (error) {
      toast.error(t("otp.failedSendCode", "Failed to send verification code"));
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerified = async () => {
    if (!user) return;

    // Update database
    await supabase
      .from("user_security_settings")
      .update({ two_factor_verified_at: new Date().toISOString() })
      .eq("user_id", user.id);

    // Store in session
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      userId: user.id,
    }));

    setIsVerified(true);
    setRequires2FA(false);
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Non-privileged users or verified users - show children
  if (!isPrivilegedUser || isVerified || !requires2FA) {
    return <>{children}</>;
  }

  // Show 2FA verification screen
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - 2FA Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              FitConnect
            </span>
          </Link>

          {!otpSent ? (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t("twoFactor.verificationRequired", "Verification Required")}
                </h1>
                <p className="text-muted-foreground">
                  {t("twoFactor.protectAccount", "To protect your account, please verify your identity with a one-time code sent to your email.")}
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {t("twoFactor.sendingTo", "Sending code to")}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={sendOTP}
                disabled={isSendingOTP}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSendingOTP ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("twoFactor.sendCode", "Send Verification Code")
                )}
              </button>
            </div>
          ) : (
            <OTPVerification
              email={user?.email || ""}
              purpose="2fa"
              onVerified={handleVerified}
              onBack={() => setOtpSent(false)}
            />
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="text-center max-w-lg relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            {t("twoFactor.securityFirst", "Security First")}
          </h2>
          <p className="text-white/80 text-lg">
            {t("twoFactor.additionalLayer", "Two-factor authentication adds an additional layer of security to your account.")}
          </p>
        </div>
      </div>
    </div>
  );
};
