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
import { PasswordInput } from "@/components/ui/password-input";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { Dumbbell, Loader2, User, Briefcase, ArrowLeft, Mail } from "lucide-react";
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
import { getEnvironment } from "@/hooks/useEnvironment";
import { STORAGE_KEYS } from "@/lib/storage-keys";

// Base schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Extended schema for signup with required first name
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().max(50, "Last name is too long").optional(),
});

type AuthFormData = z.infer<typeof signupSchema>;

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
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string; firstName: string; lastName: string } | null>(null);
  const [pendingLogin2FA, setPendingLogin2FA] = useState<{ email: string } | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { signIn, signUp, user, role, allRoles, pending2FA, setPending2FA } = useAuth();
  
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
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
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
      // Don't redirect if 2FA is pending
      if (pending2FA || pendingLogin2FA) return;
      
      // If there's a return URL, redirect there instead of default dashboard
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
        return;
      }
      
      // Default role-based redirects
      if (role === "admin" || role === "manager" || role === "staff") {
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
  }, [user, role, navigate, returnUrl, hasNavigated, pending2FA, pendingLogin2FA]);

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
    // For signup, validate terms acceptance and password
    if (!isLogin) {
      if (!agreedToTerms) {
        setTermsError(t("auth.termsRequired", "You must agree to the Terms & Conditions"));
        return;
      }
      setTermsError("");
      
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
        const response = await supabase.functions.invoke("send-otp-email", {
          body: { email: data.email },
        });
        
        // Check if email already exists
        if (response.data?.error === "email_already_registered") {
          toast.error(t("auth.emailAlreadyRegistered"));
          setIsLogin(true);
          setIsSubmitting(false);
          return;
        }
        
        if (response.error) throw response.error;
        
        setPendingSignupData({ 
          email: data.email, 
          password: data.password,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
        });
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
        if (error.message.includes("Invalid email or password")) {
          toast.error(t("auth.invalidCredentials"));
        } else {
          toast.error(t("auth.unexpectedError"));
        }
      } else {
        // Login successful - check if user needs 2FA
        // Get user's 2FA settings from database
        const { data: settings } = await supabase
          .from("user_security_settings")
          .select("two_factor_enabled, two_factor_verified_at")
          .maybeSingle();
        
        // Also check if user is privileged (coaches, admins require 2FA by default)
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role");
        
        const userRoles = rolesData?.map(r => r.role) || [];
        const isPrivileged = userRoles.some(r => ['admin', 'manager', 'staff', 'coach'].includes(r));
        
        // Determine if 2FA is required
        const needs2FA = settings?.two_factor_enabled || (isPrivileged && settings?.two_factor_enabled !== false);
        
        if (needs2FA) {
          // Check if already verified in this session window (24 hours)
          const verificationDuration = 24 * 60 * 60 * 1000;
          const recentlyVerified = settings?.two_factor_verified_at && 
            (Date.now() - new Date(settings.two_factor_verified_at).getTime() < verificationDuration);
          
          if (!recentlyVerified) {
            // Mark as pending 2FA and show OTP screen
            setPending2FA(true);
            setPendingLogin2FA({ email: data.email });
            
            // Send OTP email
            const { error: otpError } = await supabase.functions.invoke("send-otp-email", {
              body: { email: data.email, purpose: "2fa" },
            });
            
            if (otpError) {
              console.error("Failed to send 2FA OTP:", otpError);
              toast.error(t("otp.failedSendCode"));
            } else {
              toast.success(t("otp.verificationSent"));
            }
            return; // Don't show welcome message yet
          }
        }
        
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

    // Set flag BEFORE signup to prevent GuestOnlyRoute flash
    sessionStorage.setItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS, 'true');
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(
        pendingSignupData.email, 
        pendingSignupData.password, 
        selectedRole,
        pendingSignupData.firstName,
        pendingSignupData.lastName
      );
      if (error) {
        // Clear flag on error
        sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS);
        
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
            firstName: pendingSignupData.firstName,
            role: selectedRole,
          },
        }).catch((err) => console.error("Failed to send welcome email:", err));

        // Mark that we've already navigated to prevent useEffect from triggering duplicate navigation
        setHasNavigated(true);
        
        // Explicit navigation based on selected role - BEFORE auth state change can trigger GuestOnlyRoute
        const targetRoute = selectedRole === "coach" 
          ? "/onboarding/coach" 
          : "/onboarding/client";
        navigate(targetRoute, { replace: true });
        
        // Clear flag after navigation (slight delay to ensure navigation starts)
        setTimeout(() => {
          sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS);
        }, 500);
      }
    } catch (error) {
      sessionStorage.removeItem(STORAGE_KEYS.SIGNUP_IN_PROGRESS);
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
      setPendingSignupData(null);
    }
  };

  // Handle going back from OTP screen (signup)
  const handleOTPBack = () => {
    setShowOTPVerification(false);
    setPendingSignupData(null);
  };

  // Handle login 2FA OTP verification success
  const handleLogin2FAVerified = async () => {
    if (!user) return;
    
    // Update database with verification timestamp
    await supabase
      .from("user_security_settings")
      .update({ two_factor_verified_at: new Date().toISOString() })
      .eq("user_id", user.id);
    
    // Store in session for faster checks
    sessionStorage.setItem(STORAGE_KEYS.TWO_FACTOR_VERIFIED, JSON.stringify({
      timestamp: Date.now(),
      userId: user.id,
    }));
    
    // Clear pending states
    setPending2FA(false);
    setPendingLogin2FA(null);
    
    toast.success(t("auth.welcomeBack") + "!");
  };

  // Handle going back from login 2FA screen (sign out and return to login)
  const handleLogin2FABack = async () => {
    // User wants to cancel - sign them out
    const { signOut } = await import("@/contexts/AuthContext").then(() => ({ signOut: async () => {
      await supabase.auth.signOut();
    }}));
    await supabase.auth.signOut();
    setPending2FA(false);
    setPendingLogin2FA(null);
  };

  // Show login 2FA OTP verification screen
  if (pendingLogin2FA && pending2FA) {
    return (
      <>
        <Helmet>
          <title>{t("twoFactor.verificationRequired")} | FitConnect</title>
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
                email={pendingLogin2FA.email}
                purpose="2fa"
                onVerified={handleLogin2FAVerified}
                onBack={handleLogin2FABack}
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
                {t("twoFactor.securityFirst")}
              </h2>
              <p className="text-white/80 text-lg">
                {t("twoFactor.additionalLayer")}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show signup OTP verification screen
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
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-safe-status overflow-y-auto">
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
                  {/* Name fields (Sign Up only) */}
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <Label htmlFor="firstName" className="text-foreground text-sm sm:text-base">
                          {t("form.firstName")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t("placeholder.enterName")}
                          className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                          {...register("firstName")}
                        />
                        {errors.firstName && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-foreground text-sm sm:text-base">
                          {t("form.lastName")}
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t("form.lastName")}
                          className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                          {...register("lastName")}
                        />
                      </div>
                    </div>
                  )}

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
                    <PasswordInput
                      id="password"
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

                  {/* Terms Checkbox (Sign Up only) */}
                  {!isLogin && (
                    <TermsCheckbox
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      error={termsError}
                    />
                  )}

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
