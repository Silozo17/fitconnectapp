import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, LogOut, AlertTriangle, Info, Bell, User, Heart, Globe, Plug, Shield, Briefcase, CreditCard, FileText } from "lucide-react";
import { HealthTagInput } from "@/components/dashboard/clients/HealthTagInput";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { AccountSecuritySection } from "@/components/shared/AccountSecuritySection";
import { LeaderboardSettings } from "@/components/gamification/LeaderboardSettings";
import { AnimationSettingsCard } from "@/components/settings/AnimationSettingsCard";
import { AvatarPicker } from "@/components/avatars/AvatarPicker";
import { AvatarShowcase } from "@/components/avatars/AvatarShowcase";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { useTranslation } from "react-i18next";
import BecomeCoachModal from "@/components/shared/BecomeCoachModal";

import WearableConnectionList from "@/components/integrations/WearableConnectionList";
import AllergenPreferencesCard from "@/components/settings/AllergenPreferencesCard";
import { UnifiedDataPrivacySettings } from "@/components/settings/UnifiedDataPrivacySettings";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import HealthDataWidget from "@/components/integrations/HealthDataWidget";
import AppleCalendarConnectModal from "@/components/integrations/AppleCalendarConnectModal";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";
import { Calendar, Apple } from "lucide-react";
import { ClientSubscriptionSection } from "@/components/settings/ClientSubscriptionSection";
import { LegalSection } from "@/components/settings/LegalSection";
import { HealthDataSection } from "@/components/settings/HealthDataSection";

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  username: string;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  activity_level: string | null;
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

const GENDER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", description: "Office job, no exercise" },
  { id: "light", label: "Light", description: "1-2 days/week" },
  { id: "moderate", label: "Moderate", description: "3-5 days/week" },
  { id: "active", label: "Active", description: "6-7 days/week" },
  { id: "very_active", label: "Very Active", description: "Athlete / physical job" },
];

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

const FITNESS_GOALS = [
  "Lose Weight", "Build Muscle", "Improve Endurance", "Increase Strength",
  "Get Toned", "Improve Flexibility", "Better Cardio Health", "Train for Event",
  "Reduce Stress", "Improve Posture", "Build Core Strength", "General Fitness"
];

const ClientSettings = () => {
  const { t } = useTranslation('settings');
  const { user, signOut } = useAuth();
  
  // FIX: Guard against race condition during native pull-to-refresh
  if (!user) {
    return (
      <ClientDashboardLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [saving, setSaving] = useState(false);
  
  const calendarProviders: {
    id: CalendarProvider;
    name: string;
    icon: React.ReactNode;
    color: string;
    isCalDav?: boolean;
  }[] = [
    {
      id: "google_calendar",
      name: "Google Calendar",
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      id: "apple_calendar",
      name: "Apple Calendar",
      icon: <Apple className="w-5 h-5 text-white" />,
      color: "bg-gradient-to-br from-gray-700 to-gray-900",
      isCalDav: true,
    },
  ];

  const settingsTabs = [
    { id: "profile", icon: User, label: t('tabs.profile') },
    { id: "health", icon: Heart, label: t('tabs.health') },
    { id: "privacy", icon: Shield, label: t('tabs.privacy', 'Privacy') },
    { id: "preferences", icon: Globe, label: t('tabs.preferences') },
    { id: "integrations", icon: Plug, label: t('tabs.integrations') },
    { id: "notifications", icon: Bell, label: t('tabs.notifications') },
    { id: "subscription", icon: CreditCard, label: t('tabs.subscription', 'Subscription') },
    { id: "legal", icon: FileText, label: t('tabs.legal', 'Legal') },
    { id: "account", icon: Shield, label: t('tabs.account') },
  ];

  const [selectedTab, setSelectedTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && settingsTabs.some(t => t.id === tabParam) ? tabParam : 'profile';
  });
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { connectCalendar, disconnectCalendar, toggleSync, getConnection, isLoading: calendarLoading } = useCalendarSync();
  const [showAppleCalendarModal, setShowAppleCalendarModal] = useState(false);
  const [showBecomeCoachModal, setShowBecomeCoachModal] = useState(false);
  
  // Check if user already has a coach profile
  const { data: hasCoachProfile } = useQuery({
    queryKey: ["has-coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });
  
  // Track initial data for dirty state detection
  const initialProfileRef = useRef<ClientProfile | null>(null);
  
  // Note: useUnsavedChanges provides beforeunload warning for browser close/refresh
  // Router blocking requires data router which isn't used in this app
  useUnsavedChanges(profile, { enabled: true });
  
  // Track dirty state by comparing with initial values
  const checkIsDirty = (): boolean => {
    if (!profile || !initialProfileRef.current) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current);
  };

  // Use React Query for cached data fetching
  const { data: fetchedProfile, isLoading: loading } = useQuery({
    queryKey: ["client-settings-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from("client_profiles")
        .select("first_name, last_name, username, age, date_of_birth, gender, activity_level, location, weight_kg, height_cm, fitness_goals, dietary_restrictions, allergies, medical_conditions, avatar_url, leaderboard_visible, leaderboard_display_name, city, county, country")
        .eq("user_id", user.id)
        .maybeSingle();

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync fetched profile to local state for editing
  useEffect(() => {
    if (fetchedProfile && !profile) {
      setProfile(fetchedProfile);
      initialProfileRef.current = fetchedProfile ? JSON.parse(JSON.stringify(fetchedProfile)) : null;
    }
  }, [fetchedProfile]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("client_profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        date_of_birth: profile.date_of_birth, // Age auto-calculated by trigger
        gender: profile.gender,
        activity_level: profile.activity_level,
        location: profile.location,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        fitness_goals: profile.fitness_goals,
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
      toast.error(t('failedToSave'));
    } else {
      // Reset dirty state after successful save
      initialProfileRef.current = profile ? JSON.parse(JSON.stringify(profile)) : null;
      
      // Invalidate the BMI widget's cache so it fetches fresh data
      queryClient.invalidateQueries({ queryKey: ['client-profile-data'] });
      queryClient.invalidateQueries({ queryKey: ['client-settings-profile'] });
      
      toast.success(t('settingsSaved'));
    }
  };

  const updateField = (field: keyof ClientProfile, value: string | number | string[] | null | boolean) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };


  if (loading) {
    return (
      <ClientDashboardLayout title={t('title')}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout
      title={t('title')}
      description={t('description')}
    >
      <div className="max-w-6xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">{t('title')}</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <Card variant="elevated" className="rounded-3xl p-2 space-y-1">
              {settingsTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    selectedTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden space-y-6">
            {/* Profile Tab */}
            {selectedTab === "profile" && (
              <>
                {/* Link to My Profile */}
                <Card className="rounded-3xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.personalInfo')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('profile.personalInfoDesc')}
                        </p>
                      </div>
                      <Button variant="outline" className="rounded-xl" onClick={() => navigate("/dashboard/my-profile")}>
                        <User className="w-4 h-4 mr-2" />
                        {t('profile.myProfile')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Selection */}
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('avatar.title')}</CardTitle>
                    <CardDescription>{t('avatar.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <AvatarShowcase avatar={selectedAvatar} size="lg" />
                    <AvatarPicker selectedAvatar={selectedAvatar} profileType="client" />
                  </CardContent>
                </Card>

                {/* Gender & Activity Level */}
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Your gender, age and activity level are used for accurate macro calculations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile?.date_of_birth || ""}
                          onChange={(e) => updateField("date_of_birth", e.target.value || null)}
                          className="w-44"
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {profile?.age != null && (
                          <span className="text-sm text-muted-foreground">Age: {profile.age} years</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex flex-wrap gap-2">
                        {GENDER_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => updateField("gender", option.id)}
                            className={`px-3 py-1.5 rounded-xl border-2 text-sm transition-colors ${
                              profile?.gender === option.id
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:border-muted-foreground text-muted-foreground"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                      <div className="flex flex-col gap-2">
                        {ACTIVITY_LEVELS.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => updateField("activity_level", level.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                              profile?.activity_level === level.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <span className={profile?.activity_level === level.id ? "text-foreground font-medium" : "text-muted-foreground"}>
                              {level.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Body Metrics */}
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('bodyMetrics.title')}</CardTitle>
                    <CardDescription>{t('bodyMetrics.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">{t('bodyMetrics.weight')}</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={profile?.weight_kg || ""}
                          onChange={(e) => updateField("weight_kg", parseFloat(e.target.value) || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">{t('bodyMetrics.height')}</Label>
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
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('fitnessGoals.title')}</CardTitle>
                    <CardDescription>{t('fitnessGoals.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {FITNESS_GOALS.map((goal) => {
                        const isSelected = profile?.fitness_goals?.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => {
                              const current = profile?.fitness_goals || [];
                              const updated = isSelected
                                ? current.filter((g) => g !== goal)
                                : [...current, goal];
                              updateField("fitness_goals", updated);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !checkIsDirty()} 
                    className={`rounded-xl ${checkIsDirty() ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('saveChanges')}
                  </Button>
                </div>
              </>
            )}

            {/* Health Info Tab */}
            {selectedTab === "health" && (
              <>
                {/* Dietary Restrictions */}
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('health.dietary.title')}</CardTitle>
                    <CardDescription>{t('health.dietary.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthTagInput
                      tags={profile?.dietary_restrictions || []}
                      onChange={(tags) => updateField("dietary_restrictions", tags)}
                      suggestions={DIETARY_SUGGESTIONS}
                      placeholder={t('health.dietary.placeholder')}
                      variant="default"
                    />
                  </CardContent>
                </Card>


                {/* Medical Conditions */}
                <Card className="rounded-3xl border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-destructive" />
                      {t('health.medical.title')}
                    </CardTitle>
                    <CardDescription>{t('health.medical.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HealthTagInput
                      tags={profile?.medical_conditions || []}
                      onChange={(tags) => updateField("medical_conditions", tags)}
                      suggestions={MEDICAL_SUGGESTIONS}
                      placeholder={t('health.medical.placeholder')}
                      variant="danger"
                    />
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {t('health.medical.notice')}
                    </p>
                  </CardContent>
                </Card>

                {/* Allergen Preferences */}
                <AllergenPreferencesCard />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !checkIsDirty()} 
                    className={`rounded-xl ${checkIsDirty() ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('saveChanges')}
                  </Button>
                </div>
              </>
            )}

            {/* Privacy Tab */}
            {selectedTab === "privacy" && (
              <UnifiedDataPrivacySettings />
            )}

            {/* Preferences Tab */}
            {selectedTab === "preferences" && (
              <>
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('preferences.title')}</CardTitle>
                    <CardDescription>{t('preferences.languageDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <LanguageSelector />
                    <Separator />
                    <LocationSelector />
                    <Separator />
                    <div>
                      <CurrencySelector />
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('preferences.currencyDescription')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Animation Settings */}
                <AnimationSettingsCard />

                {/* Leaderboard Settings */}
                <LeaderboardSettings
                  leaderboardVisible={profile?.leaderboard_visible || false}
                  displayName={profile?.leaderboard_display_name || null}
                  city={profile?.city || null}
                  county={profile?.county || null}
                  country={profile?.country || null}
                  onUpdate={(field, value) => updateField(field as keyof ClientProfile, value)}
                />

                {/* Reset Discovery */}
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('preferences.discovery.title')}</CardTitle>
                    <CardDescription>{t('preferences.discovery.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                          const { error } = await supabase
                            .from('client_profiles')
                            .update({ discovery_tour_seen: false })
                            .eq('user_id', user.id);
                          if (!error) {
                            toast.success(t('preferences.discovery.resetSuccess'));
                          }
                        }
                      }}
                    >
                      {t('preferences.discovery.reset')}
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !checkIsDirty()} 
                    className={`rounded-xl ${checkIsDirty() ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('saveChanges')}
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
                    <h2 className="text-xl font-semibold mb-1">{t('integrations.wearables.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('integrations.wearables.description')}
                    </p>
                  </div>
                  <WearableConnectionList />
                </div>

                <Separator />

                {/* Calendar Integration */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t('integrations.calendar.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('integrations.calendar.description')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {calendarProviders.map((provider) => {
                      const connection = getConnection(provider.id);
                      const handleConnect = provider.isCalDav 
                        ? () => setShowAppleCalendarModal(true)
                        : () => connectCalendar.mutate({ provider: provider.id });
                      return (
                        <CalendarConnectionCard
                          key={provider.id}
                          provider={provider.id}
                          providerName={provider.name}
                          providerIcon={provider.icon}
                          providerColor={provider.color}
                          isConnected={!!connection}
                          syncEnabled={connection?.sync_enabled}
                          onConnect={handleConnect}
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

                <Separator />

                {/* Data & Privacy */}
                <Card className="rounded-3xl bg-muted/50 border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <h3 className="font-medium">{t('security.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('security.description')}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <Link to="/privacy#integrations" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                          <span className="text-muted-foreground">•</span>
                          <Link to="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <AppleCalendarConnectModal 
                  open={showAppleCalendarModal} 
                  onOpenChange={setShowAppleCalendarModal} 
                />
              </div>
            )}

            {/* Notifications Tab */}
            {selectedTab === "notifications" && (
              <NotificationPreferences />
            )}

            {/* Subscription Tab */}
            {selectedTab === "subscription" && (
              <ClientSubscriptionSection />
            )}

            {/* Legal Tab */}
            {selectedTab === "legal" && (
              <LegalSection />
            )}

            {/* Account Tab */}
            {selectedTab === "account" && (
              <div className="space-y-6">
                <AccountSecuritySection role="client" />
                
                {/* Become a Coach Section */}
                {!hasCoachProfile && (
                  <Card className="rounded-3xl border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" />
                        Become a Coach
                      </CardTitle>
                      <CardDescription>
                        Want to offer your fitness services? Register as a coach to start training clients on the platform.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowBecomeCoachModal(true)}
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Register as Coach
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('account.title')}</CardTitle>
                    <CardDescription>{t('account.signOutDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="rounded-xl" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('account.signOut')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <BecomeCoachModal 
              open={showBecomeCoachModal} 
              onOpenChange={setShowBecomeCoachModal} 
            />
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientSettings;
