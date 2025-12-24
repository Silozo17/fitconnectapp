import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, User, Briefcase, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import BlobShape from "@/components/ui/blob-shape";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { validatePassword } from "@/utils/passwordValidation";
import { usePasswordBreachCheck } from "@/hooks/usePasswordBreachCheck";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/error-utils";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  
  // Get mode from query params (login or signup)
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam !== "signup");
  const [selectedRole, setSelectedRole] = useState<"client" | "coach">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alsoFindCoach, setAlsoFindCoach] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string } | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false); // Prevent duplicate navigation after signup
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const { signIn, signUp, user, role } = useAuth();
  
  // Get return URL from query params or location state
  const rawReturnUrl = searchParams.get("returnUrl") || (location.state?.from?.pathname ? `${location.state.from.pathname}${location.state.from.search || ''}` : null);
  
  // Validate returnUrl to prevent open redirect attacks
  const isValidReturnUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      const decoded = decodeURIComponent(url);
      // Must start with / and not contain protocol (prevents //evil.com)
      return decoded.startsWith('/') && !decoded.includes('://') && !decoded.startsWith('//');
    } catch {
      return false;
    }
  };
  const returnUrl = isValidReturnUrl(rawReturnUrl) ? rawReturnUrl : null;
  const { checkPassword, isChecking: isCheckingBreach, isBreached, reset: resetBreachCheck } = usePasswordBreachCheck();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Debounced breach check
  const debouncedBreachCheck = useDebouncedCallback((password: string) => {
    if (password.length >= 8 && !isLogin) {
      checkPassword(password);
    }
  }, 800);

  // Watch password changes
  const watchedPassword = watch("password");
  useEffect(() => {
    if (watchedPassword !== undefined) {
      setPasswordValue(watchedPassword);
      if (!isLogin) {
        debouncedBreachCheck(watchedPassword);
      }
    }
  }, [watchedPassword, isLogin, debouncedBreachCheck]);

  // Reset breach check when switching modes
  useEffect(() => {
    resetBreachCheck();
    setPasswordValue("");
    setShowOTPVerification(false);
    setPendingSignupData(null);
    setShowForgotPassword(false);
    setResetLinkSent(false);
    setForgotPasswordEmail("");
  }, [isLogin, resetBreachCheck]);

  useEffect(() => {
    const handleRedirect = async () => {
      // Skip if we already navigated directly after signup (prevents duplicate navigation)
      if (hasNavigated) return;
      if (!user || !role) return;
      
      // If there's a return URL, redirect there instead of default dashboard
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
        return;
      }
      
      // Default role-based redirects
      if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
        return;
      }
      
      // Check onboarding status for clients and coaches
      if (role === "client") {
        const { data } = await supabase
          .from("client_profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data?.onboarding_completed) {
          navigate("/dashboard/client", { replace: true });
        } else {
          navigate("/onboarding/client", { replace: true });
        }
      } else if (role === "coach") {
        const { data } = await supabase
          .from("coach_profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data?.onboarding_completed) {
          navigate("/dashboard/coach", { replace: true });
        } else {
          navigate("/onboarding/coach", { replace: true });
        }
      }
    };
    
    handleRedirect();
  }, [user, role, navigate, returnUrl, hasNavigated]);

  // Send OTP email
  const sendOTPEmail = async (email: string) => {
    const { error } = await supabase.functions.invoke("send-otp-email", {
      body: { email },
    });
    if (error) throw error;
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error(t("validation.required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const resetUrl = `${window.location.origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: resetUrl,
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Also send branded email via our edge function
        await supabase.functions.invoke("send-password-reset-email", {
          body: { 
            email: forgotPasswordEmail,
            resetLink: resetUrl 
          },
        }).catch(err => console.error("Failed to send branded email:", err));

        setResetLinkSent(true);
        toast.success(t("auth.resetLinkSent"));
      }
    } catch (error) {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    // For signup, validate password strength and breach status
    if (!isLogin) {
      const validation = validatePassword(data.password);
      if (!validation.isValid) {
        toast.error(t("auth.chooseStrongerPassword"));
        return;
      }
      if (isBreached) {
        toast.error(t("auth.passwordBreached"));
        return;
      }

      // Send OTP and show verification screen
      setIsSubmitting(true);
      try {
        await sendOTPEmail(data.email);
        setPendingSignupData({ email: data.email, password: data.password });
        setShowOTPVerification(true);
        toast.success(t("otp.verificationSent"));
      } catch (error: unknown) {
        logError("Auth.sendOTP", error);
        toast.error(t("otp.failedSendCode"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Login flow
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error(t("auth.invalidCredentials"));
        } else {
          toast.error(t("auth.unexpectedError"));
        }
      } else {
        toast.success(t("auth.welcomeBack") + "!");
      }
    } catch (error) {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = async () => {
    if (!pendingSignupData) return;

    setIsSubmitting(true);
    try {
      const { error } = await signUp(pendingSignupData.email, pendingSignupData.password, selectedRole);
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(t("auth.emailAlreadyRegistered"));
          setShowOTPVerification(false);
          setIsLogin(true);
        } else {
          toast.error(t("auth.unexpectedError"));
        }
      } else {
        toast.success(t("auth.accountCreated"));
        
        // Send welcome email (fire and forget)
        supabase.functions.invoke("send-welcome-email", {
          body: {
            email: pendingSignupData.email,
            firstName: "",
            role: selectedRole,
          },
        }).catch((err) => console.error("Failed to send welcome email:", err));

        // Mark that we've already navigated to prevent useEffect from triggering duplicate navigation
        setHasNavigated(true);
        
        // Explicit navigation based on selected role
        const targetRoute = selectedRole === "coach" 
          ? "/onboarding/coach" 
          : "/onboarding/client";
        navigate(targetRoute, { replace: true });
      }
    } catch (error) {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
      setPendingSignupData(null);
    }
  };

  // Handle going back from OTP screen
  const handleOTPBack = () => {
    setShowOTPVerification(false);
    setPendingSignupData(null);
  };

  // Show OTP verification screen
  if (showOTPVerification && pendingSignupData) {
    return (
      <>
        <Helmet>
          <title>{t("auth.verifyEmail")} | FitConnect</title>
        </Helmet>

        <div className="min-h-screen bg-background flex">
          {/* Left side - OTP Form */}
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

              <OTPVerification
                email={pendingSignupData.email}
                onVerified={handleOTPVerified}
                onBack={handleOTPBack}
              />
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
                {t("auth.oneMoreStep")}
              </h2>
              <p className="text-white/80 text-lg">
                {t("auth.verifyToComplete")}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isLogin ? t("actions.logIn") : t("actions.signUp")} | FitConnect</title>
        <meta
          name="description"
          content="Access your FitConnect account to connect with fitness coaches or manage your coaching business."
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
                {showForgotPassword 
                  ? (resetLinkSent ? t("auth.checkYourEmail") : t("auth.forgotPasswordTitle"))
                  : (isLogin ? t("auth.welcomeBack") : t("auth.createAccount"))}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {showForgotPassword
                  ? (resetLinkSent ? t("auth.resetLinkSentTo") : t("auth.forgotPasswordSubtitle"))
                  : (isLogin ? t("auth.logInAccess") : t("auth.startJourney"))}
              </p>
            </div>

            {/* Forgot Password Form */}
            {showForgotPassword ? (
              resetLinkSent ? (
                // Reset link sent success
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-foreground font-medium mb-2">{forgotPasswordEmail}</p>
                  <p className="text-muted-foreground text-sm mb-6">
                    {t("auth.checkSpamFolder")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetLinkSent(false);
                      setForgotPasswordEmail("");
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("auth.backToLogin")}
                  </Button>
                </div>
              ) : (
                // Forgot password form
                <form onSubmit={handleForgotPassword} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="forgot-email" className="text-foreground text-sm sm:text-base">
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    />
                  </div>

                  <GradientButton
                    type="submit"
                    disabled={isSubmitting || !forgotPasswordEmail}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      t("auth.sendResetLink")
                    )}
                  </GradientButton>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("auth.backToLogin")}
                  </Button>
                </form>
              )
            ) : (
              <>
                {/* Role Selection (Sign Up only) */}
                {!isLogin && (
                  <div className="mb-4 sm:mb-6">
                    <Label className="text-foreground mb-2 sm:mb-3 block text-sm sm:text-base">{t("auth.iWantTo")}</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("client")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                          selectedRole === "client"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <User
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            selectedRole === "client"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`font-medium text-sm sm:text-base ${
                            selectedRole === "client"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {t("auth.findCoach")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("coach")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                          selectedRole === "coach"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Briefcase
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            selectedRole === "coach"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`font-medium text-sm sm:text-base ${
                            selectedRole === "coach"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {t("auth.becomeCoach")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground text-sm sm:text-base">
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground text-sm sm:text-base">
                        {t("auth.password")}
                      </Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          {t("auth.forgotPassword")}
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                    {!isLogin && (
                      <PasswordStrengthIndicator 
                        password={passwordValue}
                        isBreached={isBreached ?? false}
                        isCheckingBreach={isCheckingBreach}
                      />
                    )}
                  </div>

                  <GradientButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : isLogin ? (
                      t("actions.logIn")
                    ) : (
                      t("auth.createAccount")
                    )}
                  </GradientButton>
                </form>

                {/* Toggle */}
                <p className="mt-4 sm:mt-6 text-center text-muted-foreground text-sm sm:text-base">
                  {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isLogin ? t("actions.signUp") : t("actions.logIn")}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="text-center max-w-lg relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              {isLogin
                ? t("auth.readyToGoals")
                : selectedRole === "client"
                ? t("auth.findPerfectCoach")
                : t("auth.growBusiness")}
            </h2>
            <p className="text-white/80 text-lg">
              {isLogin
                ? t("auth.journeyAwaits")
                : selectedRole === "client"
                ? t("auth.connectWithTrainers")
                : t("auth.reachMoreClients")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
