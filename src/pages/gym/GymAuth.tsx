import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { validatePassword } from "@/utils/passwordValidation";
import { usePasswordBreachCheck } from "@/hooks/usePasswordBreachCheck";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/error-utils";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft, Shield, ArrowRight, AlertCircle } from "lucide-react";

// Schema for login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for registration
// Simplified registration - only user info, gym details collected in onboarding
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().max(50, "Last name is too long").optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface GymResult {
  id: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  country: string;
  role?: string;
}

// Generate a URL-safe slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Generate a unique slug by appending random chars if needed
const generateUniqueSlug = async (baseName: string): Promise<string> => {
  let slug = generateSlug(baseName);
  
  const { data: existing } = await supabase
    .from("gym_profiles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${suffix}`;
  }

  return slug;
};

type AuthState = "login" | "register" | "otp-login" | "otp-register" | "gym-select";

export default function GymAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user, signIn, signUp } = useAuth();

  // State management
  const modeParam = searchParams.get("mode");
  const [authState, setAuthState] = useState<AuthState>(modeParam === "register" ? "register" : "login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterFormData | null>(null);
  const [userGyms, setUserGyms] = useState<GymResult[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const { checkPassword, isChecking: isCheckingBreach, isBreached, reset: resetBreachCheck } = usePasswordBreachCheck();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Register form - simplified to user info only
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  // Debounced breach check for register
  const debouncedBreachCheck = useDebouncedCallback((password: string) => {
    if (password.length >= 8 && authState === "register") {
      checkPassword(password);
    }
  }, 800);

  // Watch password for strength indicator
  const watchedRegisterPassword = registerForm.watch("password");
  useEffect(() => {
    if (watchedRegisterPassword !== undefined && authState === "register") {
      setPasswordValue(watchedRegisterPassword);
      debouncedBreachCheck(watchedRegisterPassword);
    }
  }, [watchedRegisterPassword, authState, debouncedBreachCheck]);

  // Reset when switching modes
  useEffect(() => {
    resetBreachCheck();
    setPasswordValue("");
    setShowForgotPassword(false);
    setResetLinkSent(false);
    setForgotPasswordEmail("");
  }, [authState, resetBreachCheck]);

  // Handle already authenticated users visiting /gym-login
  // This ensures staff invitations are accepted and user is redirected properly
  useEffect(() => {
    if (user && (authState === "login" || authState === "register")) {
      // User is already authenticated - skip to gym selection
      // This will trigger invitation acceptance via loadUserGyms
      setAuthState("gym-select");
    }
  }, [user, authState]);

  // Check if user is logged in and OTP verified (for gym selection)
  useEffect(() => {
    if (user && authState === "gym-select") {
      loadUserGyms();
    }
  }, [user, authState]);

  const loadUserGyms = async () => {
    if (!user) return;
    
    setIsLoadingGyms(true);
    try {
      // FIRST: Call backend function to accept any pending invitations
      // This uses server-side privileges to bypass RLS restrictions
      const { data: acceptResult, error: acceptError } = await supabase.functions.invoke(
        "gym-accept-staff-invites"
      );
      
      if (acceptError) {
        console.error("Error accepting invitations:", acceptError);
      } else if (acceptResult?.accepted > 0) {
        // Show welcome messages for accepted invitations
        for (const gym of acceptResult.gyms || []) {
          toast.success(`Welcome to ${gym.gymName}!`);
        }
      }

      // Get gyms where user is owner
      const { data: ownedGyms, error: ownedError } = await supabase
        .from("gym_profiles")
        .select("id, name, logo_url, city, country")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (ownedError) throw ownedError;

      // Get gyms where user is staff
      const { data: staffGyms, error: staffError } = await supabase
        .from("gym_staff")
        .select(`
          gym_id,
          role,
          gym_profiles!inner(id, name, logo_url, city, country)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (staffError) throw staffError;

      // Combine and deduplicate
      const gymsMap = new Map<string, GymResult>();
      
      ownedGyms?.forEach(gym => {
        gymsMap.set(gym.id, { ...gym, role: "owner" } as GymResult);
      });
      
      staffGyms?.forEach((record: any) => {
        const gym = record.gym_profiles;
        if (gym && !gymsMap.has(gym.id)) {
          gymsMap.set(gym.id, { ...gym, role: record.role } as GymResult);
        }
      });

      const gyms = Array.from(gymsMap.values());
      setUserGyms(gyms);
      
      // Auto-navigate if user has exactly one gym
      if (gyms.length === 1) {
        localStorage.setItem("selectedGymId", gyms[0].id);
        navigate(`/gym-admin/${gyms[0].id}`);
      }
    } catch (error: any) {
      console.error("Error loading user gyms:", error);
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const selectGym = (gymId: string) => {
    localStorage.setItem("selectedGymId", gymId);
    navigate(`/gym-admin/${gymId}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-primary text-primary-foreground";
      case "manager": return "bg-blue-500 text-white";
      case "coach": return "bg-green-500 text-white";
      case "marketing": return "bg-purple-500 text-white";
      case "staff": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
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
        setResetLinkSent(true);
        toast.success(t("auth.resetLinkSent"));
      }
    } catch (error) {
      toast.error(t("auth.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle login submit
  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes("Invalid email or password")) {
          toast.error(t("auth.invalidCredentials", "Invalid email or password"));
        } else {
          toast.error(t("auth.unexpectedError", "An unexpected error occurred"));
        }
        return;
      }

      // Send OTP for mandatory 2FA
      const { error: otpError } = await supabase.functions.invoke("send-otp-email", {
        body: { email: data.email, purpose: "2fa" },
      });

      if (otpError) {
        console.error("Failed to send OTP:", otpError);
        toast.error(t("otp.failedSendCode", "Failed to send verification code"));
        return;
      }

      setPendingEmail(data.email);
      setAuthState("otp-login");
      toast.success(t("otp.verificationSent", "Verification code sent to your email"));
    } catch (error) {
      logError("GymAuth.login", error);
      toast.error(t("auth.unexpectedError", "An unexpected error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle register submit - first send OTP
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    // Validate password strength
    const validation = validatePassword(data.password);
    if (!validation.isValid) {
      toast.error(t("auth.chooseStrongerPassword", "Please choose a stronger password"));
      return;
    }
    if (isBreached) {
      toast.error(t("auth.passwordBreached", "This password has been found in data breaches"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Send OTP email first
      const response = await supabase.functions.invoke("send-otp-email", {
        body: { email: data.email },
      });

      if (response.data?.error === "email_already_registered") {
        toast.error(t("auth.emailAlreadyRegistered", "This email is already registered"));
        setAuthState("login");
        setIsSubmitting(false);
        return;
      }

      if (response.error) throw response.error;

      setPendingRegisterData(data);
      setPendingEmail(data.email);
      setAuthState("otp-register");
      toast.success(t("otp.verificationSent", "Verification code sent to your email"));
    } catch (error) {
      logError("GymAuth.register", error);
      toast.error(t("otp.failedSendCode", "Failed to send verification code"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verified for login
  const handleLoginOTPVerified = async () => {
    if (user) {
      sessionStorage.setItem(`gym_otp_verified_${user.id}`, "true");
    }
    toast.success(t("gymLogin.verified", "Identity verified successfully"));
    setAuthState("gym-select");
  };

  // Handle OTP verified for registration - now redirects to onboarding
  const handleRegisterOTPVerified = async () => {
    if (!pendingRegisterData) return;

    setIsSubmitting(true);
    try {
      // Create user account only - gym details collected in onboarding
      const { error: signUpError } = await signUp(
        pendingRegisterData.email,
        pendingRegisterData.password,
        "client", // Default role
        pendingRegisterData.firstName,
        pendingRegisterData.lastName || ""
      );

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error(t("auth.emailAlreadyRegistered", "This email is already registered"));
          setAuthState("login");
        } else {
          toast.error(t("auth.unexpectedError", "An unexpected error occurred"));
        }
        return;
      }

      // Wait for auth to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get current user
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (!newUser) {
        toast.error("Failed to get user after signup");
        return;
      }

      // Store phone if provided for later use in onboarding
      if (pendingRegisterData.phone) {
        sessionStorage.setItem('gym_onboarding_phone', pendingRegisterData.phone);
      }

      toast.success(t("gymRegister.accountCreated", "Account created! Let's set up your gym."));
      
      // Mark as verified and redirect to gym onboarding
      sessionStorage.setItem(`gym_otp_verified_${newUser.id}`, "true");
      navigate('/onboarding/gym');
    } catch (error: any) {
      logError("GymAuth.register", error);
      toast.error(error.message || t("gymRegister.failed", "Failed to create account"));
    } finally {
      setIsSubmitting(false);
      setPendingRegisterData(null);
    }
  };

  // Handle OTP back
  const handleOTPBack = async () => {
    if (authState === "otp-login") {
      await supabase.auth.signOut();
    }
    setPendingEmail(null);
    setPendingRegisterData(null);
    setAuthState(authState === "otp-login" ? "login" : "register");
  };

  // Handle sign out from gym select
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthState("login");
    setUserGyms([]);
  };

  // Render visual panel content based on state
  const renderVisualContent = () => {
    let icon = <Building2 className="w-12 h-12 text-white" />;
    let title = "";
    let subtitle = "";

    switch (authState) {
      case "login":
        title = t("gymAuth.manageYourGym", "Manage Your Gym");
        subtitle = t("gymAuth.streamlinedTools", "Streamlined tools to run your fitness business");
        break;
      case "register":
        title = t("gymAuth.joinFitConnect", "Join FitConnect Pro");
        subtitle = t("gymAuth.everythingYouNeed", "Everything you need to manage members, classes, and payments");
        break;
      case "otp-login":
      case "otp-register":
        icon = <Shield className="w-12 h-12 text-white" />;
        title = t("gymAuth.securityFirst", "Security First");
        subtitle = t("gymAuth.additionalProtection", "An additional layer of protection for your gym data");
        break;
      case "gym-select":
        title = t("gymAuth.yourGyms", "Your Gyms");
        subtitle = t("gymAuth.selectLocation", "Select a location to manage");
        break;
    }

    return (
      <div className="text-center max-w-lg relative z-10">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
          {icon}
        </div>
        <h2 className="font-display text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/80 text-lg">{subtitle}</p>
      </div>
    );
  };

  // Render OTP screen
  if (authState === "otp-login" || authState === "otp-register") {
    return (
      <>
        <Helmet>
          <title>{t("gymAuth.verifyIdentity", "Verify Your Identity")} | FitConnect</title>
        </Helmet>

        <div className="h-dvh bg-background flex overflow-hidden">
          {/* Left side - OTP Form */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-safe-status overflow-y-auto">
            <div className="w-full max-w-md">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg sm:text-xl text-foreground">
                  FitConnect Pro
                </span>
              </Link>

              <OTPVerification
                email={pendingEmail || ""}
                purpose={authState === "otp-login" ? "2fa" : undefined}
                onVerified={authState === "otp-login" ? handleLoginOTPVerified : handleRegisterOTPVerified}
                onBack={handleOTPBack}
              />
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            {renderVisualContent()}
          </div>
        </div>
      </>
    );
  }

  // Render gym selection screen
  if (authState === "gym-select") {
    return (
      <>
        <Helmet>
          <title>{t("gymAuth.selectGym", "Select Your Gym")} | FitConnect</title>
        </Helmet>

        <div className="h-dvh bg-background flex overflow-hidden">
          {/* Left side - Gym Selection */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-safe-status overflow-y-auto">
            <div className="w-full max-w-md">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg sm:text-xl text-foreground">
                  FitConnect Pro
                </span>
              </Link>

              <div className="mb-4 sm:mb-8">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {t("gymAuth.selectGym", "Select Your Gym")}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {t("gymAuth.multipleGyms", "You have access to multiple gyms. Select one to continue.")}
                </p>
              </div>

              {isLoadingGyms ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">{t("gymAuth.loadingGyms", "Loading your gyms...")}</p>
                </div>
              ) : userGyms.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("gymAuth.noAccess", "No Gym Access")}</h3>
                    <p className="text-muted-foreground mt-1">
                      {t("gymAuth.noAccessDesc", "You don't have access to any gym. Please contact your gym administrator.")}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    {t("actions.signOut", "Sign Out")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userGyms.map((gym) => (
                    <button
                      key={gym.id}
                      onClick={() => selectGym(gym.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {gym.logo_url ? (
                          <img
                            src={gym.logo_url}
                            alt={gym.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{gym.name}</p>
                          {gym.role && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(gym.role)}`}>
                              {gym.role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {gym.city ? `${gym.city}, ` : ""}{gym.country}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {userGyms.length > 0 && (
                <p className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {t("gymAuth.notYou", "Not you? Sign out")}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            {renderVisualContent()}
          </div>
        </div>
      </>
    );
  }

  // Main login/register form
  return (
    <>
      <Helmet>
        <title>{authState === "login" ? t("gymAuth.staffLogin", "Staff Login") : t("gymAuth.registerGym", "Register Your Gym")} | FitConnect</title>
        <meta name="description" content="Access your gym's management dashboard or register your gym on FitConnect." />
      </Helmet>

      <div className="h-dvh bg-background flex overflow-hidden">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-safe-status overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-foreground">
                FitConnect Pro
              </span>
            </Link>

            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                {showForgotPassword
                  ? (resetLinkSent ? t("auth.checkYourEmail", "Check Your Email") : t("auth.forgotPasswordTitle", "Forgot Password"))
                  : (authState === "login" ? t("gymAuth.welcomeBack", "Welcome Back") : t("gymAuth.registerYourGym", "Register Your Gym"))}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {showForgotPassword
                  ? (resetLinkSent ? t("auth.resetLinkSentTo", "We've sent a reset link to your email") : t("auth.forgotPasswordSubtitle", "Enter your email to reset your password"))
                  : (authState === "login" ? t("gymAuth.accessDashboard", "Access your gym's management dashboard") : t("gymAuth.startManaging", "Set up your gym on FitConnect and start managing"))}
              </p>
            </div>

            {/* Forgot Password Form */}
            {showForgotPassword ? (
              resetLinkSent ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-foreground font-medium mb-2">{forgotPasswordEmail}</p>
                  <p className="text-muted-foreground text-sm mb-6">
                    {t("auth.checkSpamFolder", "Check your spam folder if you don't see it")}
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
                    {t("auth.backToLogin", "Back to Login")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email" className="text-foreground text-sm sm:text-base">
                      {t("auth.email", "Email")}
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
                      t("auth.sendResetLink", "Send Reset Link")
                    )}
                  </GradientButton>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("auth.backToLogin", "Back to Login")}
                  </Button>
                </form>
              )
            ) : authState === "login" ? (
              // Login Form
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground text-sm sm:text-base">
                    {t("auth.email", "Email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground text-sm sm:text-base">
                      {t("auth.password", "Password")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      {t("auth.forgotPassword", "Forgot password?")}
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <GradientButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    t("actions.logIn", "Log In")
                  )}
                </GradientButton>

                <p className="mt-4 sm:mt-6 text-center text-muted-foreground text-sm sm:text-base">
                  {t("gymAuth.noGymYet", "Don't have a gym yet?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthState("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t("gymAuth.registerNow", "Register now")}
                  </button>
                </p>
              </form>
            ) : (
              // Register Form
              <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-3 sm:space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground text-sm sm:text-base">
                      {t("form.firstName", "First Name")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t("placeholder.enterName", "John")}
                      className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                      {...registerForm.register("firstName")}
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground text-sm sm:text-base">
                      {t("form.lastName", "Last Name")}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t("form.lastName", "Doe")}
                      className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                      {...registerForm.register("lastName")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-email" className="text-foreground text-sm sm:text-base">
                    {t("auth.email", "Email")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-password" className="text-foreground text-sm sm:text-base">
                    {t("auth.password", "Password")} <span className="text-destructive">*</span>
                  </Label>
                  <PasswordInput
                    id="reg-password"
                    placeholder="••••••••"
                    className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                  {passwordValue && (
                    <div className="mt-2">
                      <PasswordStrengthIndicator
                        password={passwordValue}
                        isBreached={isBreached}
                        isCheckingBreach={isCheckingBreach}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground text-sm sm:text-base">
                    {t("form.phone", "Phone Number")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 123 456 7890"
                    className="mt-1 sm:mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10 sm:h-12"
                    {...registerForm.register("phone")}
                  />
                </div>

                {/* Info about onboarding */}
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">
                    💡 After creating your account, you'll set up your gym details, location, services, and payment processing.
                  </p>
                </div>

                <GradientButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    t("gymAuth.registerGym", "Register Gym")
                  )}
                </GradientButton>

                <p className="mt-4 sm:mt-6 text-center text-muted-foreground text-sm sm:text-base">
                  {t("gymAuth.alreadyHaveGym", "Already have a gym?")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthState("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t("actions.logIn", "Log In")}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:flex flex-1 gradient-bg-primary items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          {renderVisualContent()}
        </div>
      </div>
    </>
  );
}