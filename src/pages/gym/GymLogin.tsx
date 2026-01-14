import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Loader2, LogIn, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { useTranslation } from "react-i18next";

interface GymResult {
  id: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  country: string;
  role?: string;
}

export default function GymLogin() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userGyms, setUserGyms] = useState<GymResult[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);
  
  // OTP state for mandatory 2FA
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  // Check if user has already verified OTP this session
  useEffect(() => {
    if (user) {
      const otpVerified = sessionStorage.getItem(`gym_otp_verified_${user.id}`);
      if (otpVerified) {
        setIsOTPVerified(true);
        loadUserGyms();
      } else {
        // User is logged in but hasn't verified OTP - trigger OTP
        triggerOTPForUser(user.email || "");
      }
    }
  }, [user]);

  const triggerOTPForUser = async (userEmail: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email: userEmail, purpose: "2fa" },
      });
      
      if (error) throw error;
      
      setPendingEmail(userEmail);
      setShowOTP(true);
      toast.info(t("gymLogin.otpSent", "A verification code has been sent to your email"));
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(t("gymLogin.otpFailed", "Failed to send verification code"));
    }
  };

  const handleOTPVerified = () => {
    if (user) {
      sessionStorage.setItem(`gym_otp_verified_${user.id}`, "true");
    }
    setIsOTPVerified(true);
    setShowOTP(false);
    setPendingEmail(null);
    toast.success(t("gymLogin.verified", "Identity verified successfully"));
    loadUserGyms();
  };

  const handleOTPBack = async () => {
    // Sign out and go back to login
    await supabase.auth.signOut();
    setShowOTP(false);
    setPendingEmail(null);
  };

  const loadUserGyms = async () => {
    if (!user) return;
    
    setIsLoadingGyms(true);
    try {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await signIn(email, password);
      // After successful login, triggerOTPForUser will be called via useEffect
      toast.success(t("gymLogin.loggedIn", "Logged in successfully"));
    } catch (error: any) {
      toast.error(error.message || t("gymLogin.loginFailed", "Failed to login"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const selectGym = (gymId: string) => {
    localStorage.setItem("selectedGymId", gymId);
    navigate(`/gym-admin/${gymId}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-primary text-primary-foreground";
      case "manager":
        return "bg-blue-500 text-white";
      case "coach":
        return "bg-green-500 text-white";
      case "marketing":
        return "bg-purple-500 text-white";
      case "staff":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  // Show OTP verification screen
  if (showOTP && pendingEmail) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{t("gymLogin.verifyIdentity", "Verify Your Identity")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("gymLogin.securityCheck", "For security, please verify your identity to access gym management.")}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <OTPVerification
                email={pendingEmail}
                purpose="2fa"
                onVerified={handleOTPVerified}
                onBack={handleOTPBack}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{t("gymLogin.title", "Gym Staff Login")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("gymLogin.subtitle", "Access your gym's management dashboard")}
          </p>
        </div>

        {!user || !isOTPVerified ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("gymLogin.staffLogin", "Staff Login")}</CardTitle>
              <CardDescription>
                {t("gymLogin.signInPrompt", "Sign in with your credentials to access your gym")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("gymLogin.email", "Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("gymLogin.password", "Password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("gymLogin.signingIn", "Signing in...")}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("gymLogin.signIn", "Sign In")}
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>{t("gymLogin.needHelp", "Need help accessing your account?")}</p>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  {t("gymLogin.resetPassword", "Reset your password")}
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : isLoadingGyms ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading your gyms...</p>
              </div>
            </CardContent>
          </Card>
        ) : userGyms.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Gym Access</h3>
                  <p className="text-muted-foreground mt-1">
                    You don't have access to any gym. Please contact your gym administrator to get invited as staff.
                  </p>
                </div>
                <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("gymLogin.selectGym", "Select Your Gym")}</CardTitle>
              <CardDescription>
                {t("gymLogin.multipleGyms", "You have access to multiple gyms. Select one to continue.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {userGyms.map((gym) => (
                <button
                  key={gym.id}
                  onClick={() => selectGym(gym.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {gym.logo_url ? (
                      <img
                        src={gym.logo_url}
                        alt={gym.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-primary" />
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
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
