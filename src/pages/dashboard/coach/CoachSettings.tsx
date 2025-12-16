import { useState, useEffect } from "react";
import {
  User,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  Save,
  Plus,
  Trash2,
  Loader2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import StripeConnectButton from "@/components/payments/StripeConnectButton";
import PlatformSubscription from "@/components/payments/PlatformSubscription";
import { useQuery } from "@tanstack/react-query";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { useLocale } from "@/contexts/LocaleContext";
import { getCurrencySymbol } from "@/lib/currency";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";

const coachTypes = ["Personal Trainer", "Nutritionist", "Boxing Coach", "MMA Coach", "Yoga Instructor", "CrossFit Coach"];

interface CoachProfile {
  display_name: string | null;
  bio: string | null;
  location: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  coach_types: string[] | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  profile_image_url: string | null;
  subscription_tier: string | null;
}

const CoachSettings = () => {
  const { user, signOut } = useAuth();
  const { currency } = useLocale();
  const [selectedTab, setSelectedTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<CoachProfile>({
    display_name: "",
    bio: "",
    location: "",
    experience_years: null,
    hourly_rate: null,
    coach_types: [],
    online_available: true,
    in_person_available: false,
    profile_image_url: null,
    subscription_tier: "free",
  });

  // Fetch coach profile with React Query
  const { data: coachData, isLoading: loading, refetch } = useQuery({
    queryKey: ["coach-profile-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, bio, location, experience_years, hourly_rate, coach_types, online_available, in_person_available, profile_image_url, subscription_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (coachData) {
      setProfile({
        display_name: coachData.display_name || "",
        bio: coachData.bio || "",
        location: coachData.location || "",
        experience_years: coachData.experience_years,
        hourly_rate: coachData.hourly_rate,
        coach_types: coachData.coach_types || [],
        online_available: coachData.online_available ?? true,
        in_person_available: coachData.in_person_available ?? false,
        profile_image_url: coachData.profile_image_url,
        subscription_tier: coachData.subscription_tier || "free",
      });
    }
  }, [coachData]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("coach_profiles")
      .update({
        display_name: profile.display_name || null,
        bio: profile.bio || null,
        location: profile.location || null,
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        coach_types: profile.coach_types,
        online_available: profile.online_available,
        in_person_available: profile.in_person_available,
        profile_image_url: profile.profile_image_url,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Profile updated successfully");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" description="Manage your account settings and preferences.">
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {[
                { id: "profile", icon: User, label: "Profile" },
                { id: "services", icon: CreditCard, label: "Services & Pricing" },
                { id: "preferences", icon: Globe, label: "Preferences" },
                { id: "notifications", icon: Bell, label: "Notifications" },
                { id: "subscription", icon: Shield, label: "Subscription" },
                { id: "account", icon: Shield, label: "Account & Security" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Tab */}
            {selectedTab === "profile" && (
              <>
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="mb-6">
                    <ProfileImageUpload
                      currentImageUrl={profile.profile_image_url}
                      userId={user?.id || ""}
                      displayName={profile.display_name || ""}
                      onImageChange={(url) => setProfile({ ...profile, profile_image_url: url })}
                      size="lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={profile.display_name || ""}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={user?.email || ""}
                        className="mt-1"
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={profile.location || ""}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="mt-1"
                        placeholder="London, UK"
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={profile.experience_years || ""}
                        onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || null })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="mt-1"
                        rows={4}
                        placeholder="Tell clients about your background and coaching philosophy..."
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="mb-2 block">Coach Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {coachTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={(profile.coach_types || []).includes(type) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            (profile.coach_types || []).includes(type)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary"
                          }`}
                          onClick={() => {
                            const current = profile.coach_types || [];
                            setProfile({
                              ...profile,
                              coach_types: current.includes(type)
                                ? current.filter((t) => t !== type)
                                : [...current, type],
                            });
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile.online_available ?? true}
                        onCheckedChange={(checked) => setProfile({ ...profile, online_available: checked })}
                      />
                      <Label>Available for Online Sessions</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile.in_person_available ?? false}
                        onCheckedChange={(checked) => setProfile({ ...profile, in_person_available: checked })}
                      />
                      <Label>Available for In-Person Sessions</Label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-primary-foreground">
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Services & Pricing Tab */}
            {selectedTab === "services" && (
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-foreground">Services & Pricing</h2>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Hourly Rate</p>
                      <p className="text-sm text-muted-foreground">Your base session rate</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{getCurrencySymbol(currency)}</span>
                      <Input
                        type="number"
                        value={profile.hourly_rate || ""}
                        onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) || null })}
                        className="w-24"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prices will be displayed in your selected currency ({currency}).
                  </p>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {selectedTab === "preferences" && (
              <div className="card-elevated p-6">
                <h2 className="font-display font-bold text-foreground mb-6">Display Preferences</h2>
                <div className="space-y-6">
                  <div className="max-w-xs">
                    <CurrencySelector />
                    <p className="text-sm text-muted-foreground mt-2">
                      This affects how prices are displayed for you and your clients throughout the platform.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {selectedTab === "notifications" && (
              <NotificationPreferences />
            )}

            {/* Subscription & Payments Tab */}
            {selectedTab === "subscription" && coachData && (
              <div className="space-y-6">
                {/* Stripe Connect for receiving payments */}
                <StripeConnectButton coachId={coachData.id} onSuccess={() => refetch()} />

                {/* Platform Subscription */}
                <PlatformSubscription 
                  coachId={coachData.id} 
                  currentTier={profile.subscription_tier || "free"} 
                />
              </div>
            )}

            {/* Account & Security Tab */}
            {selectedTab === "account" && (
              <div className="space-y-6">
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">Account Security</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground text-destructive mb-4">Danger Zone</h2>
                  <p className="text-muted-foreground mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="destructive">Delete Account</Button>
                    <Button variant="outline" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachSettings;
