import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validatePassword } from "@/utils/passwordValidation";
import { usePasswordBreachCheck } from "@/hooks/usePasswordBreachCheck";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  const { checkPassword, isChecking: isCheckingBreach, isBreached, reset: resetBreachCheck } = usePasswordBreachCheck();

  // Debounced breach check
  const debouncedBreachCheck = useDebouncedCallback((pwd: string) => {
    if (pwd.length >= 8) {
      checkPassword(pwd);
    }
  }, 800);

  useEffect(() => {
    if (password) {
      debouncedBreachCheck(password);
    } else {
      resetBreachCheck();
    }
  }, [password, debouncedBreachCheck, resetBreachCheck]);

  // Check if user has a valid session (came from reset link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error(t("auth.passwordsMatch"));
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error(t("auth.chooseStrongerPassword"));
      return;
    }

    // Check breach status
    if (isBreached) {
      toast.error(t("auth.passwordBreached"));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success(t("auth.passwordResetSuccess"));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth?mode=login", { replace: true });
        }, 3000);
      }
    } catch (error) {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error if no valid session
  if (!isValidSession) {
    return (
      <>
        <Helmet>
          <title>{t("auth.resetPassword")} | FitConnect</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                FitConnect
              </span>
            </Link>

            <div className="glass-card rounded-2xl p-8">
              <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                {t("auth.invalidResetLink")}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t("auth.resetLinkExpired")}
              </p>
              <Button
                onClick={() => navigate("/auth?mode=login")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("auth.backToLogin")}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <>
        <Helmet>
          <title>{t("auth.passwordResetSuccess")} | FitConnect</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                FitConnect
              </span>
            </Link>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {t("auth.passwordResetSuccess")}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t("auth.redirectingToLogin")}
              </p>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("auth.resetPassword")} | FitConnect</title>
        <meta
          name="description"
          content="Reset your FitConnect account password."
        />
      </Helmet>

      <div className="h-dvh bg-background flex overflow-hidden">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-foreground">
                FitConnect
              </span>
            </Link>

            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                {t("auth.createNewPassword")}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("auth.resetPasswordSubtitle")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="password" className="text-foreground text-sm sm:text-base">
                  {t("form.newPassword")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                />
                <PasswordStrengthIndicator 
                  password={password}
                  isBreached={isBreached ?? false}
                  isCheckingBreach={isCheckingBreach}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground text-sm sm:text-base">
                  {t("form.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {t("auth.passwordsMatch")}
                  </p>
                )}
              </div>

              <GradientButton
                type="submit"
                disabled={isSubmitting || !password || !confirmPassword}
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  t("auth.resetPassword")
                )}
              </GradientButton>
            </form>

            {/* Back to login */}
            <p className="mt-4 sm:mt-6 text-center text-muted-foreground text-sm sm:text-base">
              <button
                type="button"
                onClick={() => navigate("/auth?mode=login")}
                className="text-primary hover:underline font-medium"
              >
                {t("auth.backToLogin")}
              </button>
            </p>
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="text-center max-w-lg relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              {t("auth.secureYourAccount")}
            </h2>
            <p className="text-white/80 text-lg">
              {t("auth.chooseStrongPassword")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
