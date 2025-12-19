import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, User, Briefcase } from "lucide-react";
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
  
  // Get mode from query params (login or signup)
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam !== "signup");
  const [selectedRole, setSelectedRole] = useState<"client" | "coach">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alsoFindCoach, setAlsoFindCoach] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string } | null>(null);
  const { signIn, signUp, user, role } = useAuth();
  
  // Get return URL from query params or location state
  const returnUrl = searchParams.get("returnUrl") || (location.state?.from?.pathname ? `${location.state.from.pathname}${location.state.from.search || ''}` : null);
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
  }, [isLogin, resetBreachCheck]);

  useEffect(() => {
    if (user && role) {
      // If there's a return URL, redirect there instead of default dashboard
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
        return;
      }
      
      // Default role-based redirects
      if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "client") {
        navigate("/onboarding/client", { replace: true });
      } else if (role === "coach") {
        navigate("/onboarding/coach", { replace: true });
      }
    }
  }, [user, role, navigate, returnUrl]);

  // Send OTP email
  const sendOTPEmail = async (email: string) => {
    const { error } = await supabase.functions.invoke("send-otp-email", {
      body: { email },
    });
    if (error) throw error;
  };

  const onSubmit = async (data: AuthFormData) => {
    // For signup, validate password strength and breach status
    if (!isLogin) {
      const validation = validatePassword(data.password);
      if (!validation.isValid) {
        toast.error("Please choose a stronger password");
        return;
      }
      if (isBreached) {
        toast.error("This password was found in a data breach. Please choose a different password.");
        return;
      }

      // Send OTP and show verification screen
      setIsSubmitting(true);
      try {
        await sendOTPEmail(data.email);
        setPendingSignupData({ email: data.email, password: data.password });
        setShowOTPVerification(true);
        toast.success("Verification code sent to your email");
      } catch (error: unknown) {
        logError("Auth.sendOTP", error);
        toast.error("Failed to send verification code. Please try again.");
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
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
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
          toast.error("This email is already registered. Please log in instead.");
          setShowOTPVerification(false);
          setIsLogin(true);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully!");
        
        // Send welcome email (fire and forget)
        supabase.functions.invoke("send-welcome-email", {
          body: {
            email: pendingSignupData.email,
            firstName: "",
            role: selectedRole,
          },
        }).catch((err) => console.error("Failed to send welcome email:", err));
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
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
          <title>Verify Your Email | FitConnect</title>
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
                One more step!
              </h2>
              <p className="text-white/80 text-lg">
                Verify your email to complete registration and start your fitness journey.
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
        <title>{isLogin ? "Log In" : "Sign Up"} | FitConnect</title>
        <meta
          name="description"
          content="Access your FitConnect account to connect with fitness coaches or manage your coaching business."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left side - Form */}
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

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Log in to access your dashboard"
                  : "Start your fitness journey today"}
              </p>
            </div>

            {/* Role Selection (Sign Up only) */}
            {!isLogin && (
              <div className="mb-6">
                <Label className="text-foreground mb-3 block">I want to:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("client")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      selectedRole === "client"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <User
                      className={`w-6 h-6 ${
                        selectedRole === "client"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        selectedRole === "client"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      Find a Coach
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("coach")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      selectedRole === "coach"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <Briefcase
                      className={`w-6 h-6 ${
                        selectedRole === "coach"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        selectedRole === "coach"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      Become a Coach
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12"
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
                className="w-full h-12 text-base"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </GradientButton>
            </form>

            {/* Toggle */}
            <p className="mt-6 text-center text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
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
                ? "Ready to crush your goals?"
                : selectedRole === "client"
                ? "Find your perfect coach"
                : "Grow your coaching business"}
            </h2>
            <p className="text-white/80 text-lg">
              {isLogin
                ? "Your personalized fitness journey awaits."
                : selectedRole === "client"
                ? "Connect with certified trainers, nutritionists, and martial arts instructors."
                : "Reach more clients, manage your schedule, and scale your impact."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
