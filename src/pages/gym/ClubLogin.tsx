import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Loader2, Search, LogIn, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GymResult {
  id: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  country: string;
}

export default function ClubLogin() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GymResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userGyms, setUserGyms] = useState<GymResult[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);

  // Load user's gyms when logged in
  useEffect(() => {
    if (user) {
      loadUserGyms();
    }
  }, [user]);

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
          gym_profiles!inner(id, name, logo_url, city, country)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (staffError) throw staffError;

      // Combine and deduplicate
      const gymsMap = new Map<string, GymResult>();
      
      ownedGyms?.forEach(gym => {
        gymsMap.set(gym.id, gym as GymResult);
      });
      
      staffGyms?.forEach((record: any) => {
        const gym = record.gym_profiles;
        if (gym && !gymsMap.has(gym.id)) {
          gymsMap.set(gym.id, gym as GymResult);
        }
      });

      setUserGyms(Array.from(gymsMap.values()));
    } catch (error: any) {
      console.error("Error loading user gyms:", error);
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("id, name, logo_url, city, country")
        .ilike("name", `%${searchQuery}%`)
        .eq("status", "active")
        .limit(10);

      if (error) throw error;
      setSearchResults(data as GymResult[]);
    } catch (error: any) {
      console.error("Error searching gyms:", error);
      toast.error("Failed to search gyms");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await signIn(email, password);
      toast.success("Logged in successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const selectGym = (gymId: string) => {
    // Store selected gym in localStorage for persistence
    localStorage.setItem("selectedGymId", gymId);
    navigate(`/gym-admin/${gymId}`);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Club Login</h1>
          <p className="text-muted-foreground mt-2">
            Access your gym's admin dashboard
          </p>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Staff Login</CardTitle>
              <CardDescription>
                Sign in with your FitConnect account to access your gym
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Password</Label>
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Don't have an account?</p>
                <Link to="/auth" className="text-primary hover:underline">
                  Create a FitConnect account
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* User's Gyms */}
            {userGyms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Gyms</CardTitle>
                  <CardDescription>
                    Select a gym to manage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoadingGyms ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    userGyms.map((gym) => (
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
                          <p className="font-medium truncate">{gym.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {gym.city ? `${gym.city}, ` : ""}{gym.country}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Search for other gyms */}
            <Card>
              <CardHeader>
                <CardTitle>Find a Gym</CardTitle>
                <CardDescription>
                  Search for a gym by name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search gym name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((gym) => (
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
                          <p className="font-medium truncate">{gym.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {gym.city ? `${gym.city}, ` : ""}{gym.country}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Register new gym */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want to register a new gym?
              </p>
              <Button variant="outline" asChild>
                <Link to="/club-register">Register Your Gym</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
