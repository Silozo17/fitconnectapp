import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { validatePassword } from "@/utils/passwordValidation";
import { usePasswordBreachCheck } from "@/hooks/usePasswordBreachCheck";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"client" | "coach">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alsoFindCoach, setAlsoFindCoach] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkPassword, isChecking: isCheckingBreach, isBreached, reset: resetBreachCheck } = usePasswordBreachCheck();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
  }, [isLogin, resetBreachCheck]);

  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/dashboard/admin");
      } else if (role === "client") {
        navigate("/onboarding/client");
      } else if (role === "coach") {
        navigate("/onboarding/coach");
      }
    }
  }, [user, role, navigate]);

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
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
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
      } else {
        const { error } = await signUp(data.email, data.password, selectedRole);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please log in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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
