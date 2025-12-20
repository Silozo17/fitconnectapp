import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  usePlatformSettings, 
  useUpdatePlatformSetting, 
  useTierFeatures, 
  usePlatformFeatures, 
  useUpdateTierFeature,
  useCoachFeatureOverrides,
  useSetFeatureOverride,
  useRemoveFeatureOverride 
} from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Bell, Shield, Globe, Loader2, Plug, User, LogOut, CreditCard, Sliders, Plus, Edit, Trash2, Crown, Zap, Rocket, Star, Share2, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";

// Threads icon - custom since lucide doesn't have it
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.733 2.072-1.166 3.547-1.29.878-.073 1.77-.06 2.663.043-.078-.733-.318-1.307-.722-1.715-.494-.5-1.258-.76-2.265-.773l-.037-.001c-.775.007-1.775.218-2.39.87l-1.478-1.405c.975-1.027 2.389-1.547 3.86-1.582h.055c1.54.021 2.783.477 3.695 1.357.866.834 1.378 1.99 1.527 3.437.387.107.752.238 1.092.396 1.27.592 2.246 1.49 2.82 2.6.825 1.598.9 4.357-1.258 6.468-1.852 1.814-4.133 2.607-7.394 2.632z"/>
  </svg>
);

import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Separator } from "@/components/ui/separator";
import { AccountSecuritySection } from "@/components/shared/AccountSecuritySection";
import { useAuth } from "@/contexts/AuthContext";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

interface PlanTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  isActive: boolean;
  icon: string;
}

const defaultTiers: PlanTier[] = [
  { id: "free", name: "Free", price: 0, billingPeriod: "monthly", description: "Basic features for getting started", isActive: true, icon: "star" },
  { id: "starter", name: "Starter", price: 19, billingPeriod: "monthly", description: "For coaches just starting out", isActive: true, icon: "zap" },
  { id: "pro", name: "Pro", price: 49, billingPeriod: "monthly", description: "For growing coaching businesses", isActive: true, icon: "rocket" },
  { id: "enterprise", name: "Enterprise", price: 99, billingPeriod: "monthly", description: "For established coaching practices", isActive: true, icon: "crown" },
];

const tierIcons: Record<string, any> = {
  star: Star,
  zap: Zap,
  rocket: Rocket,
  crown: Crown,
};

const AdminSettings = () => {
  const { t } = useTranslation('settings');
  const { data: settings, isLoading } = usePlatformSettings();
  const { signOut } = useAuth();
  const updateSetting = useUpdatePlatformSetting();
  const { data: tierFeatures } = useTierFeatures();
  const { data: platformFeatures } = usePlatformFeatures();
  const updateTierFeature = useUpdateTierFeature();
  const { data: allOverrides } = useCoachFeatureOverrides("");
  const setOverride = useSetFeatureOverride();
  const removeOverride = useRemoveFeatureOverride();

  const initialSettingsRef = useRef<typeof localSettings | null>(null);

  const [localSettings, setLocalSettings] = useState({
    email_notifications: true,
    auto_approve_coaches: false,
    maintenance_mode: false,
    commission_rate: 15,
    currency: "GBP",
    min_session_price: 10,
    max_session_price: 500,
    require_coach_verification: true,
    allow_anonymous_reviews: false,
    social_facebook: "",
    social_instagram: "",
    social_tiktok: "",
    social_x: "",
    social_youtube: "",
    social_linkedin: "",
    social_threads: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    legal_email: "",
    privacy_email: "",
    stat_total_users: "0",
    stat_total_coaches: "0",
    stat_avg_rating: "4.9",
  });
  
  // Note: useUnsavedChanges provides beforeunload warning for browser close/refresh
  // Router blocking requires data router which isn't used in this app
  useUnsavedChanges(localSettings, { enabled: true });
  
  const checkIsDirty = (): boolean => {
    if (!initialSettingsRef.current) return false;
    return JSON.stringify(localSettings) !== JSON.stringify(initialSettingsRef.current);
  };

  const [editingTier, setEditingTier] = useState<PlanTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    coachId: "",
    featureId: "",
    value: "",
    reason: "",
  });

  // Fetch coaches for override selection
  const { data: coaches } = useQuery({
    queryKey: ["coaches-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, subscription_tier")
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });

  // Ensure tiers is always a valid array
  const rawTiers = settings?.subscription_tiers;
  const tiers: PlanTier[] = Array.isArray(rawTiers) 
    ? rawTiers 
    : (typeof rawTiers === 'string' ? JSON.parse(rawTiers) : defaultTiers);

  // Helper to parse boolean settings stored as strings
  const parseBoolean = (value: any, defaultValue: boolean): boolean => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return defaultValue;
  };

  useEffect(() => {
    if (settings) {
      const newSettings = {
        email_notifications: parseBoolean(settings.email_notifications, true),
        auto_approve_coaches: parseBoolean(settings.auto_approve_coaches, false),
        maintenance_mode: parseBoolean(settings.maintenance_mode, false),
        commission_rate: settings.commission_rate ?? 15,
        currency: settings.currency ?? "GBP",
        min_session_price: settings.min_session_price ?? 10,
        max_session_price: settings.max_session_price ?? 500,
        require_coach_verification: parseBoolean(settings.require_coach_verification, true),
        allow_anonymous_reviews: parseBoolean(settings.allow_anonymous_reviews, false),
        social_facebook: settings.social_facebook ?? "",
        social_instagram: settings.social_instagram ?? "",
        social_tiktok: settings.social_tiktok ?? "",
        social_x: settings.social_x ?? "",
        social_youtube: settings.social_youtube ?? "",
        social_linkedin: settings.social_linkedin ?? "",
        social_threads: settings.social_threads ?? "",
        contact_email: settings.contact_email ?? "",
        contact_phone: settings.contact_phone ?? "",
        contact_address: settings.contact_address ?? "",
        legal_email: settings.legal_email ?? "",
        privacy_email: settings.privacy_email ?? "",
        stat_total_users: settings.stat_total_users ?? "0",
        stat_total_coaches: settings.stat_total_coaches ?? "0",
        stat_avg_rating: settings.stat_avg_rating ?? "4.9",
      };
      setLocalSettings(newSettings);
      initialSettingsRef.current = JSON.parse(JSON.stringify(newSettings));
    }
  }, [settings]);

  const handleSave = async () => {
    const updates = Object.entries(localSettings).map(([key, value]) =>
      updateSetting.mutateAsync({ key, value: String(value) })
    );
    
    await Promise.all(updates);
    initialSettingsRef.current = JSON.parse(JSON.stringify(localSettings));
    toast.success(t('settingsSaved'));
  };

  const handleToggle = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveTier = async () => {
    if (!editingTier) return;
    
    const updatedTiers = tiers.map((t: PlanTier) => 
      t.id === editingTier.id ? editingTier : t
    );
    
    await updateSetting.mutateAsync({
      key: "subscription_tiers",
      value: updatedTiers,
      description: "Platform subscription tier configuration",
    });
    
    setIsDialogOpen(false);
    setEditingTier(null);
    toast.success("Plan updated successfully");
  };

  const handleToggleTier = async (tierId: string, isActive: boolean) => {
    const updatedTiers = tiers.map((t: PlanTier) => 
      t.id === tierId ? { ...t, isActive } : t
    );
    
    await updateSetting.mutateAsync({
      key: "subscription_tiers",
      value: updatedTiers,
      description: "Platform subscription tier configuration",
    });
  };

  const getFeatureValue = (tier: string, featureId: string) => {
    const tf = tierFeatures?.find(
      (tf: any) => tf.tier === tier && tf.feature_id === featureId
    );
    return tf?.value;
  };

  const handleFeatureChange = async (tier: string, featureId: string, value: any) => {
    await updateTierFeature.mutateAsync({ tier, featureId, value });
  };

  const getFeatureValueDisplay = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="default" className="bg-green-500/10 text-green-500">Enabled</Badge>
      ) : (
        <Badge variant="secondary">Disabled</Badge>
      );
    }
    if (typeof value === "number") {
      return <Badge variant="outline">{value}</Badge>;
    }
    return <Badge variant="outline">{String(value)}</Badge>;
  };

  const handleAddOverride = async () => {
    if (!overrideForm.coachId || !overrideForm.featureId) {
      toast.error("Please select a coach and feature");
      return;
    }

    let parsedValue: any = overrideForm.value;
    const feature = platformFeatures?.find((f: any) => f.id === overrideForm.featureId);
    
    if (feature?.feature_type === "boolean") {
      parsedValue = overrideForm.value === "true";
    } else if (feature?.feature_type === "number") {
      parsedValue = Number(overrideForm.value);
    }

    await setOverride.mutateAsync({
      coachId: overrideForm.coachId,
      featureId: overrideForm.featureId,
      value: parsedValue,
      reason: overrideForm.reason,
    });

    setIsOverrideDialogOpen(false);
    setOverrideForm({ coachId: "", featureId: "", value: "", reason: "" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const featureTiers = ["free", "starter", "pro", "enterprise"];

  return (
    <>
      <Helmet>
        <title>{t('title')} | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6 max-w-5xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.platformSettings')}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t('admin.platformDescription')}</p>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            {/* Scrollable TabsList for mobile with fade indicators */}
            <div className="relative">
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]">
                <TabsList className="inline-flex w-max sm:w-auto h-auto flex-nowrap">
                  <TabsTrigger value="general" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">General</span>
                    <span className="sm:hidden">Gen</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Preferences</span>
                    <span className="sm:hidden">Pref</span>
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Branding</span>
                    <span className="sm:hidden">Brand</span>
                  </TabsTrigger>
                  <TabsTrigger value="plans" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Plans</span>
                    <span className="sm:hidden">Plans</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Features</span>
                    <span className="sm:hidden">Feat</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                    <span className="sm:hidden">Notif</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Plug className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Integrations</span>
                    <span className="sm:hidden">Integ</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Security</span>
                    <span className="sm:hidden">Sec</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Account</span>
                    <span className="sm:hidden">Acct</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.general.title')}</CardTitle>
                  <CardDescription>{t('admin.general.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Responsive toggle row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label>{t('admin.general.maintenanceMode')}</Label>
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        {t('admin.general.maintenanceModeDesc')}
                      </p>
                    </div>
                    <Switch
                      className="shrink-0"
                      checked={localSettings.maintenance_mode}
                      onCheckedChange={(checked) => handleToggle("maintenance_mode", checked)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label>{t('admin.general.autoApproveCoaches')}</Label>
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        {t('admin.general.autoApproveCoachesDesc')}
                      </p>
                    </div>
                    <Switch
                      className="shrink-0"
                      checked={localSettings.auto_approve_coaches}
                      onCheckedChange={(checked) => handleToggle("auto_approve_coaches", checked)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label>{t('admin.general.requireVerification')}</Label>
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        {t('admin.general.requireVerificationDesc')}
                      </p>
                    </div>
                    <Switch
                      className="shrink-0"
                      checked={localSettings.require_coach_verification}
                      onCheckedChange={(checked) => handleToggle("require_coach_verification", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LanguageSelector />
                  <Separator />
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={localSettings.currency}
                      onValueChange={(value) => handleChange("currency", value)}
                    >
                      <SelectTrigger className="w-full sm:max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Default currency for new users</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab - Social Media & Contact Settings */}
            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>Configure social media links displayed across the website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Label>
                      <Input
                        placeholder="https://facebook.com/yourpage"
                        value={localSettings.social_facebook || ""}
                        onChange={(e) => handleChange("social_facebook", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Label>
                      <Input
                        placeholder="https://instagram.com/yourprofile"
                        value={localSettings.social_instagram || ""}
                        onChange={(e) => handleChange("social_instagram", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <TikTokIcon className="h-4 w-4" />
                        TikTok
                      </Label>
                      <Input
                        placeholder="https://tiktok.com/@yourprofile"
                        value={localSettings.social_tiktok || ""}
                        onChange={(e) => handleChange("social_tiktok", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X (Twitter)
                      </Label>
                      <Input
                        placeholder="https://x.com/yourprofile"
                        value={localSettings.social_x || ""}
                        onChange={(e) => handleChange("social_x", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        YouTube
                      </Label>
                      <Input
                        placeholder="https://youtube.com/@yourchannel"
                        value={localSettings.social_youtube || ""}
                        onChange={(e) => handleChange("social_youtube", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Label>
                      <Input
                        placeholder="https://linkedin.com/company/yourcompany"
                        value={localSettings.social_linkedin || ""}
                        onChange={(e) => handleChange("social_linkedin", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ThreadsIcon className="h-4 w-4" />
                        Threads
                      </Label>
                      <Input
                        placeholder="https://threads.net/@yourprofile"
                        value={localSettings.social_threads || ""}
                        onChange={(e) => handleChange("social_threads", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Business contact details displayed on the website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input
                        type="email"
                        placeholder="support@example.com"
                        value={localSettings.contact_email || ""}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Primary contact email shown on website</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Business Phone</Label>
                      <Input
                        type="tel"
                        placeholder="+44 800 123 4567"
                        value={localSettings.contact_phone || ""}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Business phone number</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Legal Email</Label>
                      <Input
                        type="email"
                        placeholder="legal@example.com"
                        value={localSettings.legal_email || ""}
                        onChange={(e) => handleChange("legal_email", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Shown on Terms of Service page</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Privacy Email</Label>
                      <Input
                        type="email"
                        placeholder="privacy@example.com"
                        value={localSettings.privacy_email || ""}
                        onChange={(e) => handleChange("privacy_email", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Shown on Privacy Policy page</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Input
                      placeholder="Company Name, City, Country"
                      value={localSettings.contact_address || ""}
                      onChange={(e) => handleChange("contact_address", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Shown in footer and legal pages</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Configure the stats displayed on the homepage. Set to 0 to show live counts from the database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Total Users</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={localSettings.stat_total_users || "0"}
                        onChange={(e) => handleChange("stat_total_users", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Set to 0 for live count</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Coaches</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={localSettings.stat_total_coaches || "0"}
                        onChange={(e) => handleChange("stat_total_coaches", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Set to 0 for live count</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Average Rating</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.9"
                        value={localSettings.stat_avg_rating || "4.9"}
                        onChange={(e) => handleChange("stat_avg_rating", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Rating shown on homepage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab - Consolidated from AdminPlatformPlans */}
            <TabsContent value="plans" className="space-y-6">
              {/* Pricing Tiers - Single column on mobile */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {tiers.map((tier: PlanTier) => {
                  const IconComponent = tierIcons[tier.icon] || Star;
                  return (
                    <Card key={tier.id} className={!tier.isActive ? "opacity-60" : ""}>
                      <CardHeader className="pb-2 sm:pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <CardTitle className="text-base sm:text-lg">{tier.name}</CardTitle>
                          </div>
                          <Switch 
                            checked={tier.isActive} 
                            onCheckedChange={(checked) => handleToggleTier(tier.id, checked)}
                          />
                        </div>
                        <CardDescription className="text-xs sm:text-sm">{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold">£{tier.price}</span>
                          <span className="text-muted-foreground text-sm">/{tier.billingPeriod}</span>
                        </div>
                        
                        <Dialog open={isDialogOpen && editingTier?.id === tier.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setEditingTier(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setEditingTier(tier)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Plan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit {tier.name} Plan</DialogTitle>
                              <DialogDescription>
                                Update the pricing and details for this tier
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Plan Name</Label>
                                <Input 
                                  value={editingTier?.name || ""} 
                                  onChange={(e) => setEditingTier(prev => prev ? {...prev, name: e.target.value} : null)}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Price (£)</Label>
                                  <Input 
                                    type="number"
                                    value={editingTier?.price || 0} 
                                    onChange={(e) => setEditingTier(prev => prev ? {...prev, price: Number(e.target.value)} : null)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Billing Period</Label>
                                  <Select 
                                    value={editingTier?.billingPeriod}
                                    onValueChange={(value) => setEditingTier(prev => prev ? {...prev, billingPeriod: value} : null)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                  value={editingTier?.description || ""} 
                                  onChange={(e) => setEditingTier(prev => prev ? {...prev, description: e.target.value} : null)}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                              <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                                setIsDialogOpen(false);
                                setEditingTier(null);
                              }}>
                                Cancel
                              </Button>
                              <Button className="w-full sm:w-auto" onClick={handleSaveTier}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Feature Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Feature Access by Tier</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure which features are available for each subscription tier</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm min-w-[180px]">Feature</th>
                          {tiers.filter((t: PlanTier) => t.isActive).map((tier: PlanTier) => (
                            <th key={tier.id} className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-sm">{tier.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {platformFeatures?.map((feature: any) => (
                          <tr key={feature.id} className="border-b last:border-0">
                            <td className="py-2 sm:py-3 px-3 sm:px-4">
                              <div>
                                <p className="font-medium text-sm">{feature.name}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                              </div>
                            </td>
                            {tiers.filter((t: PlanTier) => t.isActive).map((tier: PlanTier) => {
                              const value = getFeatureValue(tier.id, feature.id);
                              return (
                                <td key={tier.id} className="text-center py-2 sm:py-3 px-2 sm:px-4">
                                  {feature.feature_type === "boolean" ? (
                                    <Switch 
                                      checked={value === true}
                                      onCheckedChange={(checked) => handleFeatureChange(tier.id, feature.id, checked)}
                                    />
                                  ) : feature.feature_type === "number" ? (
                                    <Input 
                                      type="number"
                                      className="w-16 sm:w-20 mx-auto text-center text-sm"
                                      value={typeof value === "number" ? value : 0}
                                      onChange={(e) => handleFeatureChange(tier.id, feature.id, Number(e.target.value))}
                                    />
                                  ) : (
                                    <Select 
                                      value={typeof value === "string" ? value : "none"}
                                      onValueChange={(newValue) => handleFeatureChange(tier.id, feature.id, newValue)}
                                    >
                                      <SelectTrigger className="w-20 sm:w-28 mx-auto text-xs sm:text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="full">Full</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="limited">Limited</SelectItem>
                                        <SelectItem value="unlimited">Unlimited</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {platformFeatures?.map((feature: any) => (
                      <Card key={feature.id} className="p-3 bg-muted/30">
                        <div className="mb-3">
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {tiers.filter((t: PlanTier) => t.isActive).map((tier: PlanTier) => {
                            const value = getFeatureValue(tier.id, feature.id);
                            return (
                              <div key={tier.id} className="flex flex-col items-center gap-1 p-2 rounded-md bg-background">
                                <span className="text-xs font-medium text-muted-foreground">{tier.name}</span>
                                {feature.feature_type === "boolean" ? (
                                  <Switch 
                                    checked={value === true}
                                    onCheckedChange={(checked) => handleFeatureChange(tier.id, feature.id, checked)}
                                  />
                                ) : feature.feature_type === "number" ? (
                                  <Input 
                                    type="number"
                                    className="w-16 text-center text-sm h-8"
                                    value={typeof value === "number" ? value : 0}
                                    onChange={(e) => handleFeatureChange(tier.id, feature.id, Number(e.target.value))}
                                  />
                                ) : (
                                  <Select 
                                    value={typeof value === "string" ? value : "none"}
                                    onValueChange={(newValue) => handleFeatureChange(tier.id, feature.id, newValue)}
                                  >
                                    <SelectTrigger className="w-full text-xs h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      <SelectItem value="basic">Basic</SelectItem>
                                      <SelectItem value="standard">Standard</SelectItem>
                                      <SelectItem value="full">Full</SelectItem>
                                      <SelectItem value="advanced">Advanced</SelectItem>
                                      <SelectItem value="limited">Limited</SelectItem>
                                      <SelectItem value="unlimited">Unlimited</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Commission Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Commission Settings</CardTitle>
                  <CardDescription>Platform fees for coach transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Platform Commission Rate (%)</Label>
                      <Input 
                        type="number"
                        value={localSettings.commission_rate}
                        onChange={(e) => handleChange("commission_rate", Number(e.target.value))}
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Percentage taken from each client payment to coaches
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={localSettings.currency}
                        onValueChange={(value) => handleChange("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab - Consolidated from AdminFeatures */}
            <TabsContent value="features" className="space-y-4">
              <Tabs defaultValue="matrix" className="space-y-4">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <TabsList className="w-max sm:w-auto">
                    <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
                    <TabsTrigger value="overrides">Coach Overrides</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="matrix" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
                        Feature Access by Tier
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        View which features are available for each subscription tier
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[200px]">Feature</TableHead>
                              {featureTiers.map((tier) => (
                                <TableHead key={tier} className="text-center capitalize text-xs sm:text-sm">{tier}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {platformFeatures?.map((feature: any) => (
                              <TableRow key={feature.id}>
                                <TableCell className="py-2 sm:py-4">
                                  <div>
                                    <p className="font-medium text-sm">{feature.name}</p>
                                    <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
                                  </div>
                                </TableCell>
                                {featureTiers.map((tier) => {
                                  const tf = tierFeatures?.find(
                                    (tf: any) => tf.tier === tier && tf.feature_id === feature.id
                                  );
                                  return (
                                    <TableCell key={tier} className="text-center py-2 sm:py-4">
                                      {getFeatureValueDisplay(tf?.value)}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-4 px-3 sm:px-0">
                        To edit feature values, go to the Plans tab.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="overrides" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                            Coach Feature Overrides
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Grant or restrict specific features for individual coaches
                          </CardDescription>
                        </div>
                        <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="w-full sm:w-auto">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Override
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Add Feature Override</DialogTitle>
                              <DialogDescription>
                                Grant or restrict a specific feature for a coach
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Coach</Label>
                                <Select 
                                  value={overrideForm.coachId}
                                  onValueChange={(value) => setOverrideForm(prev => ({ ...prev, coachId: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a coach" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {coaches?.map((coach: any) => (
                                      <SelectItem key={coach.id} value={coach.id}>
                                        {coach.display_name || "Unknown"} ({coach.subscription_tier})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Feature</Label>
                                <Select 
                                  value={overrideForm.featureId}
                                  onValueChange={(value) => setOverrideForm(prev => ({ ...prev, featureId: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a feature" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {platformFeatures?.map((feature: any) => (
                                      <SelectItem key={feature.id} value={feature.id}>
                                        {feature.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Value</Label>
                                {platformFeatures?.find((f: any) => f.id === overrideForm.featureId)?.feature_type === "boolean" ? (
                                  <Select 
                                    value={overrideForm.value}
                                    onValueChange={(value) => setOverrideForm(prev => ({ ...prev, value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select value" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Enabled</SelectItem>
                                      <SelectItem value="false">Disabled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input 
                                    value={overrideForm.value}
                                    onChange={(e) => setOverrideForm(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter value"
                                  />
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Reason (optional)</Label>
                                <Input 
                                  value={overrideForm.reason}
                                  onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                                  placeholder="Why is this override being applied?"
                                />
                              </div>
                            </div>
                            
                            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsOverrideDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button className="w-full sm:w-auto" onClick={handleAddOverride}>Add Override</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {allOverrides && allOverrides.length > 0 ? (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden sm:block overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Coach</TableHead>
                                  <TableHead>Feature</TableHead>
                                  <TableHead>Value</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Expires</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allOverrides.map((override: any) => (
                                  <TableRow key={override.id}>
                                    <TableCell>
                                      {coaches?.find((c: any) => c.id === override.coach_id)?.display_name || "Unknown"}
                                    </TableCell>
                                    <TableCell>{override.platform_features?.name}</TableCell>
                                    <TableCell>{getFeatureValueDisplay(override.value)}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {override.reason || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {override.expires_at 
                                        ? new Date(override.expires_at).toLocaleDateString() 
                                        : "Never"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeOverride.mutate(override.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="sm:hidden space-y-3">
                            {allOverrides.map((override: any) => (
                              <Card key={override.id} className="p-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">
                                      {coaches?.find((c: any) => c.id === override.coach_id)?.display_name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {override.platform_features?.name}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="shrink-0 h-8 w-8"
                                    onClick={() => removeOverride.mutate(override.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {getFeatureValueDisplay(override.value)}
                                  <span className="text-xs text-muted-foreground">
                                    {override.expires_at 
                                      ? `Expires ${new Date(override.expires_at).toLocaleDateString()}` 
                                      : "No expiry"}
                                  </span>
                                </div>
                                {override.reason && (
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {override.reason}
                                  </p>
                                )}
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No feature overrides configured</p>
                          <p className="text-xs">Add overrides to grant or restrict features for specific coaches</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Notification Settings</CardTitle>
                  <CardDescription>Configure platform-wide email and notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        Send email notifications for important events
                      </p>
                    </div>
                    <Switch
                      className="shrink-0"
                      checked={localSettings.email_notifications}
                      onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Your Personal Preferences</h3>
                <NotificationPreferences />
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Integrations</CardTitle>
                  <CardDescription>Monitor and manage third-party service connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="p-3 sm:p-4">
                      <p className="font-medium text-sm sm:text-base">Stripe</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Payment processing - Connected</p>
                    </Card>
                    <Card className="p-3 sm:p-4">
                      <p className="font-medium text-sm sm:text-base">Wearables</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Fitness device sync - 3 providers</p>
                    </Card>
                    <Card className="p-3 sm:p-4">
                      <p className="font-medium text-sm sm:text-base">Calendar</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Session scheduling - Google Calendar</p>
                    </Card>
                    <Card className="p-3 sm:p-4">
                      <p className="font-medium text-sm sm:text-base">Video</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Video conferencing - Zoom, Google Meet</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and privacy options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <Label>Allow Anonymous Reviews</Label>
                      <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                        Allow clients to post reviews without showing their name
                      </p>
                    </div>
                    <Switch
                      className="shrink-0"
                      checked={localSettings.allow_anonymous_reviews}
                      onCheckedChange={(checked) => handleToggle("allow_anonymous_reviews", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <AccountSecuritySection />
              
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle>Session</CardTitle>
                  <CardDescription>Sign out of your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full sm:w-auto" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button 
              className="w-full sm:w-auto" 
              onClick={handleSave} 
              disabled={updateSetting.isPending || !checkIsDirty()}
              variant={checkIsDirty() ? "default" : "outline"}
            >
              {updateSetting.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettings;
