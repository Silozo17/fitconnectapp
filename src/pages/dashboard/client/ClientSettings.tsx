import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, LogOut, AlertTriangle, Info, Bell, MapPin, User, Heart, Globe, Plug, Shield, AtSign, Copy, Check } from "lucide-react";
import { HealthTagInput } from "@/components/dashboard/clients/HealthTagInput";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { AccountSecuritySection } from "@/components/shared/AccountSecuritySection";
import { LeaderboardSettings } from "@/components/gamification/LeaderboardSettings";
import { AvatarPicker } from "@/components/avatars/AvatarPicker";
import { AvatarShowcase } from "@/components/avatars/AvatarShowcase";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import WearableConnectionList from "@/components/integrations/WearableConnectionList";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import HealthDataWidget from "@/components/integrations/HealthDataWidget";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";
import { Calendar } from "lucide-react";

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  username: string;
  age: number | null;
  gender_pronouns: string | null;
  location: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_goals: string[] | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
  avatar_url: string | null;
  leaderboard_visible: boolean;
  leaderboard_display_name: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
}

const DIETARY_SUGGESTIONS = [
  "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", 
  "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Pescatarian"
];

const ALLERGY_SUGGESTIONS = [
  "Nuts", "Peanuts", "Shellfish", "Dairy", "Eggs", 
  "Soy", "Wheat", "Fish", "Sesame"
];

const MEDICAL_SUGGESTIONS = [
  "Asthma", "Diabetes", "Heart Condition", "High Blood Pressure",
  "Back Injury", "Knee Injury", "Shoulder Injury"
];

const calendarProviders: {
  id: CalendarProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: <Calendar className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
];

const settingsTabs = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "health", icon: Heart, label: "Health Info" },
  { id: "preferences", icon: Globe, label: "Preferences" },
  { id: "integrations", icon: Plug, label: "Integrations" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "account", icon: Shield, label: "Account" },
];

const ClientSettings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");
  const [newUsername, setNewUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [usernameCopied, setUsernameCopied] = useState(false);
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { connectCalendar, disconnectCalendar, toggleSync, getConnection, isLoading: calendarLoading } = useCalendarSync();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("first_name, last_name, username, age, gender_pronouns, location, weight_kg, height_cm, fitness_goals, dietary_restrictions, allergies, medical_conditions, avatar_url, leaderboard_visible, leaderboard_display_name, city, county, country")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("client_profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        gender_pronouns: profile.gender_pronouns,
        location: profile.location,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        dietary_restrictions: profile.dietary_restrictions,
        allergies: profile.allergies,
        medical_conditions: profile.medical_conditions,
        avatar_url: profile.avatar_url,
        leaderboard_visible: profile.leaderboard_visible,
        leaderboard_display_name: profile.leaderboard_display_name,
        city: profile.city,
        county: profile.county,
        country: profile.country,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const updateField = (field: keyof ClientProfile, value: string | number | string[] | null | boolean) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const copyUsername = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(`@${profile.username}`);
      setUsernameCopied(true);
      setTimeout(() => setUsernameCopied(false), 2000);
      toast.success("Username copied!");
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(username.length > 0 ? "Username must be at least 3 characters" : "");
      return;
    }
    if (username.length > 30) {
      setUsernameAvailable(null);
      setUsernameError("Username must be 30 characters or less");
      return;
    }
    if (username === profile?.username) {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    setCheckingUsername(true);
    setUsernameError("");

    const { data: available } = await supabase.rpc("is_username_available", {
      check_username: username,
    });

    setCheckingUsername(false);
    setUsernameAvailable(available === true);
    if (!available) {
      setUsernameError("This username is already taken");
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    setNewUsername(cleaned);
    checkUsernameAvailability(cleaned);
  };

  const saveUsername = async () => {
    if (!user || !newUsername || !usernameAvailable) return;

    setSaving(true);
    const { error } = await supabase
      .from("client_profiles")
      .update({ username: newUsername })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to update username");
    } else {
      setProfile({ ...profile!, username: newUsername });
      setNewUsername("");
      setUsernameAvailable(null);
      toast.success("Username updated!");
    }
  };

  if (loading) {
    return (
      <ClientDashboardLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout
      title="Settings"
      description="Manage your account settings"
    >
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {settingsTabs.map((item) => (
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
                {/* Avatar Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Avatar</CardTitle>
                    <CardDescription>Choose an avatar to represent you on leaderboards and throughout the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <AvatarShowcase avatar={selectedAvatar} size="lg" />
                    <AvatarPicker selectedAvatar={selectedAvatar} profileType="client" />
                  </CardContent>
                </Card>

                {/* Profile Photo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>Upload a photo so your coaches can recognize you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileImageUpload
                      currentImageUrl={profile?.avatar_url}
                      userId={user?.id || ""}
                      displayName={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()}
                      onImageChange={(url) => updateField("avatar_url", url)}
                      size="lg"
                    />
                  </CardContent>
                </Card>

                {/* Username */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AtSign className="w-5 h-5 text-primary" />
                      Username
                    </CardTitle>
                    <CardDescription>Your unique identifier for connections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                      <AtSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-medium">{profile?.username}</span>
                      <Button variant="ghost" size="sm" onClick={copyUsername} className="ml-auto">
                        {usernameCopied ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Change Username</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={newUsername}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="Enter new username"
                            className="pl-9"
                            maxLength={30}
                          />
                        </div>
                        <Button
                          onClick={saveUsername}
                          disabled={saving || !usernameAvailable || !newUsername}
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                      {checkingUsername && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Checking availability...
                        </p>
                      )}
                      {usernameError && (
                        <p className="text-sm text-destructive">{usernameError}</p>
                      )}
                      {usernameAvailable && newUsername && (
                        <p className="text-sm text-primary flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Username available!
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Lowercase letters and numbers only, 3-30 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your basic profile details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile?.first_name || ""}
                          onChange={(e) => updateField("first_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile?.last_name || ""}
                          onChange={(e) => updateField("last_name", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profile?.age || ""}
                          onChange={(e) => updateField("age", parseInt(e.target.value) || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input
                          id="pronouns"
                          value={profile?.gender_pronouns || ""}
                          onChange={(e) => updateField("gender_pronouns", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g., London, UK"
                        value={profile?.location || ""}
                        onChange={(e) => updateField("location", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your location helps coaches in your area find you
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Body Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Body Metrics</CardTitle>
                    <CardDescription>Your current measurements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={profile?.weight_kg || ""}
                          onChange={(e) => updateField("weight_kg", parseFloat(e.target.value) || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={profile?.height_cm || ""}
                          onChange={(e) => updateField("height_cm", parseFloat(e.target.value) || null)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fitness Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fitness Goals</CardTitle>
                    <CardDescription>Your current objectives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile?.fitness_goals && profile.fitness_goals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.fitness_goals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No fitness goals set</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {/* Health Info Tab */}
            {selectedTab === "health" && (
              <>
                {/* Dietary Restrictions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dietary Restrictions</CardTitle>
                    <CardDescription>Any dietary preferences or restrictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthTagInput
                      tags={profile?.dietary_restrictions || []}
                      onChange={(tags) => updateField("dietary_restrictions", tags)}
                      suggestions={DIETARY_SUGGESTIONS}
                      placeholder="Add dietary restriction..."
                      variant="default"
                    />
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card className="border-warning/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Allergies
                    </CardTitle>
                    <CardDescription>Food or environmental allergies your coach should know about</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthTagInput
                      tags={profile?.allergies || []}
                      onChange={(tags) => updateField("allergies", tags)}
                      suggestions={ALLERGY_SUGGESTIONS}
                      placeholder="Add allergy..."
                      variant="warning"
                    />
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Your coach will see this information
                    </p>
                  </CardContent>
                </Card>

                {/* Medical Conditions */}
                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-destructive" />
                      Medical Conditions
                    </CardTitle>
                    <CardDescription>Any medical conditions that may affect your training</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthTagInput
                      tags={profile?.medical_conditions || []}
                      onChange={(tags) => updateField("medical_conditions", tags)}
                      suggestions={MEDICAL_SUGGESTIONS}
                      placeholder="Add medical condition..."
                      variant="danger"
                    />
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Share any conditions that may affect your training
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {/* Preferences Tab */}
            {selectedTab === "preferences" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Language and regional settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <LanguageSelector />
                    <Separator />
                    <div>
                      <CurrencySelector />
                      <p className="text-xs text-muted-foreground mt-2">
                        This affects how prices are displayed throughout the platform
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Leaderboard Settings */}
                <LeaderboardSettings
                  leaderboardVisible={profile?.leaderboard_visible || false}
                  displayName={profile?.leaderboard_display_name || null}
                  city={profile?.city || null}
                  county={profile?.county || null}
                  country={profile?.country || null}
                  onUpdate={(field, value) => updateField(field as keyof ClientProfile, value)}
                />

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </>
            )}

            {/* Integrations Tab */}
            {selectedTab === "integrations" && (
              <div className="space-y-6">
                {/* Health Data Widget */}
                <HealthDataWidget />

                <Separator />

                {/* Wearable Devices */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Fitness Wearables</h2>
                    <p className="text-sm text-muted-foreground">
                      Connect your fitness tracker to automatically sync steps, heart rate, sleep, and more
                    </p>
                  </div>
                  <WearableConnectionList />
                </div>

                <Separator />

                {/* Calendar Integration */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Calendar Sync</h2>
                    <p className="text-sm text-muted-foreground">
                      Automatically add your coaching sessions to your calendar
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calendarProviders.map((provider) => {
                      const connection = getConnection(provider.id);
                      return (
                        <CalendarConnectionCard
                          key={provider.id}
                          provider={provider.id}
                          providerName={provider.name}
                          providerIcon={provider.icon}
                          providerColor={provider.color}
                          isConnected={!!connection}
                          syncEnabled={connection?.sync_enabled}
                          onConnect={() => connectCalendar.mutate(provider.id)}
                          onDisconnect={() => connection && disconnectCalendar.mutate(connection.id)}
                          onToggleSync={(enabled) =>
                            connection && toggleSync.mutate({ connectionId: connection.id, enabled })
                          }
                          isConnecting={connectCalendar.isPending}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {selectedTab === "notifications" && (
              <NotificationPreferences />
            )}

            {/* Account Tab */}
            {selectedTab === "account" && (
              <div className="space-y-6">
                <AccountSecuritySection role="client" />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Session</CardTitle>
                    <CardDescription>Manage your current session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientSettings;
