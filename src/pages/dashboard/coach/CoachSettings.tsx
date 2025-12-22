import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  Save,
  Plus,
  Loader2,
  Globe,
  Plug,
  Video,
  Calendar,
  Receipt,
  Store,
  Image,
  UserCircle,
  MapPin,
  Users as UsersIcon,
  Link as LinkIcon,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { CardImageUpload } from "@/components/shared/CardImageUpload";
import { CoachCardPreview } from "@/components/coaches/CoachCardPreview";
import StripeConnectButton from "@/components/payments/StripeConnectButton";
import PlatformSubscription from "@/components/payments/PlatformSubscription";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { AnimationSettingsCard } from "@/components/settings/AnimationSettingsCard";
import { LocationAutocomplete } from "@/components/shared/LocationAutocomplete";
import { LocationSelector } from "@/components/shared/LocationSelector";
import { useLocale } from "@/contexts/LocaleContext";
import { getCurrencySymbol } from "@/lib/currency";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { AvatarPicker } from "@/components/avatars/AvatarPicker";
import { AvatarShowcase } from "@/components/avatars/AvatarShowcase";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import VideoProviderCard from "@/components/integrations/VideoProviderCard";
import CalendarConnectionCard from "@/components/integrations/CalendarConnectionCard";
import { useVideoConference, VideoProvider } from "@/hooks/useVideoConference";
import { useCalendarSync, CalendarProvider } from "@/hooks/useCalendarSync";

// Import verification components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useVerificationStatus,
  useVerificationDocuments,
  useUploadVerificationDocument,
  useDeleteVerificationDocument,
  useSubmitForVerification,
  useDocumentSignedUrl,
  DocumentType,
} from "@/hooks/useVerification";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { AccountSecuritySection } from "@/components/shared/AccountSecuritySection";
import { InvoiceSettingsSection } from "@/components/coach/InvoiceSettingsSection";
import { format } from "date-fns";
import { Upload, FileText, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Eye, Users } from "lucide-react";
import { CoachGalleryUpload } from "@/components/coach/CoachGalleryUpload";
import { CoachGroupClassesManager } from "@/components/coach/CoachGroupClassesManager";
import { CoachWhoIWorkWithSection } from "@/components/coach/CoachWhoIWorkWithSection";
import { CoachSocialLinksSection, type SocialLinks } from "@/components/coach/CoachSocialLinksSection";
import { CoachTypeSelector } from "@/components/coach/CoachTypeSelector";
import { MarketplaceSection } from "@/components/coach/MarketplaceSection";
import { ProfileCompletionProgress } from "@/components/coach/ProfileCompletionProgress";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import AppleCalendarConnectModal from "@/components/integrations/AppleCalendarConnectModal";

interface CoachProfile {
  display_name: string | null;
  username: string;
  bio: string | null;
  location: string | null;
  // Structured location fields (from Google Places)
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  location_country_code: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  gym_affiliation: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  coach_types: string[] | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  subscription_tier: string | null;
  is_verified: boolean | null;
  who_i_work_with: string | null;
  // Social media links
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  threads_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
}

const videoProviders: {
  id: VideoProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "zoom",
    name: "Zoom",
    icon: <Video className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "google_meet",
    name: "Google Meet",
    icon: <Video className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-green-500 to-teal-600",
  },
];

const calendarProviders: {
  id: CalendarProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
  isCalDAV?: boolean;
  supportsTwoWaySync?: boolean;
}[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: <Calendar className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "apple_calendar",
    name: "Apple Calendar",
    icon: <Apple className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-gray-700 to-gray-900",
    isCalDAV: true,
    supportsTwoWaySync: true,
  },
];

const getDocumentTypeConfig = (t: any) => [
  { type: "identity" as DocumentType, label: t('verification.documents.identity.label'), description: t('verification.documents.identity.description') },
  { type: "certification" as DocumentType, label: t('verification.documents.certification.label'), description: t('verification.documents.certification.description') },
  { type: "insurance" as DocumentType, label: t('verification.documents.insurance.label'), description: t('verification.documents.insurance.description') },
  { type: "qualification" as DocumentType, label: t('verification.documents.qualification.label'), description: t('verification.documents.qualification.description') },
];

const getStatusConfig = (t: any) => ({
  not_submitted: { label: t('verification.status.notSubmitted'), color: "bg-muted text-muted-foreground", icon: AlertCircle },
  pending: { label: t('verification.status.pending'), color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: t('verification.status.approved'), color: "bg-primary/10 text-primary", icon: CheckCircle },
  rejected: { label: t('verification.status.rejected'), color: "bg-destructive/10 text-destructive", icon: XCircle },
});

const CoachSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { currency } = useLocale();
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  
  const documentTypes = getDocumentTypeConfig(t);
  const statusConfig = getStatusConfig(t);
  
  // Read tab from URL params for deep linking (e.g., ?tab=verification)
  const urlTab = searchParams.get("tab");
  const validTabs = ["profile", "notifications", "preferences", "subscription", "invoice", "integrations", "verification", "security"];
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : "profile";
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [usernameCopied, setUsernameCopied] = useState(false);
  const { data: selectedAvatar } = useSelectedAvatar('coach');

  // Video and Calendar hooks
  const {
    connectVideoProvider,
    disconnectVideoProvider,
    updateSettings,
    getSettings,
    isLoading: videoLoading,
  } = useVideoConference();

  const {
    connectCalendar,
    disconnectCalendar,
    toggleSync,
    getConnection,
    isLoading: calendarLoading,
  } = useCalendarSync();

  // Verification hooks
  const { data: verificationStatus, isLoading: statusLoading } = useVerificationStatus();
  const { data: documents = [], isLoading: docsLoading } = useVerificationDocuments();
  const uploadMutation = useUploadVerificationDocument();
  const deleteMutation = useDeleteVerificationDocument();
  const submitMutation = useSubmitForVerification();
  const signedUrlMutation = useDocumentSignedUrl();
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [showAppleCalendarModal, setShowAppleCalendarModal] = useState(false);

  const handleCalendarConnect = (provider: typeof calendarProviders[0]) => {
    if (provider.isCalDAV) {
      setShowAppleCalendarModal(true);
    } else {
      connectCalendar.mutate(provider.id);
    }
  };

  // Track initial data for dirty state detection
  const initialProfileRef = useRef<CoachProfile | null>(null);

  const [profile, setProfile] = useState<CoachProfile>({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    location_city: null,
    location_region: null,
    location_country: null,
    location_country_code: null,
    location_lat: null,
    location_lng: null,
    location_place_id: null,
    gym_affiliation: "",
    experience_years: null,
    hourly_rate: null,
    currency: "GBP",
    coach_types: [],
    online_available: true,
    in_person_available: false,
    profile_image_url: null,
    card_image_url: null,
    subscription_tier: "free",
    is_verified: false,
    who_i_work_with: null,
    facebook_url: null,
    instagram_url: null,
    tiktok_url: null,
    x_url: null,
    threads_url: null,
    linkedin_url: null,
    youtube_url: null,
  });
  
  // Note: useUnsavedChanges provides beforeunload warning for browser close/refresh
  // Router blocking requires data router which isn't used in this app
  useUnsavedChanges(profile, { enabled: true });
  
  // Track dirty state by comparing with initial values
  const checkIsDirty = (): boolean => {
    if (!initialProfileRef.current) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current);
  };

  // Fetch coach profile with React Query
  const { data: coachData, isLoading: loading, refetch } = useQuery({
    queryKey: ["coach-profile-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, username, bio, location, location_city, location_region, location_country, location_country_code, location_lat, location_lng, location_place_id, gym_affiliation, experience_years, hourly_rate, currency, coach_types, online_available, in_person_available, profile_image_url, card_image_url, subscription_tier, is_verified, who_i_work_with, facebook_url, instagram_url, tiktok_url, x_url, threads_url, linkedin_url, youtube_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (coachData) {
      const profileData: CoachProfile = {
        display_name: coachData.display_name || "",
        username: coachData.username || "",
        bio: coachData.bio || "",
        location: coachData.location || "",
        location_city: coachData.location_city || null,
        location_region: coachData.location_region || null,
        location_country: coachData.location_country || null,
        location_country_code: coachData.location_country_code || null,
        location_lat: coachData.location_lat || null,
        location_lng: coachData.location_lng || null,
        location_place_id: coachData.location_place_id || null,
        gym_affiliation: coachData.gym_affiliation || "",
        experience_years: coachData.experience_years,
        hourly_rate: coachData.hourly_rate,
        currency: coachData.currency || "GBP",
        coach_types: coachData.coach_types || [],
        online_available: coachData.online_available ?? true,
        in_person_available: coachData.in_person_available ?? false,
        profile_image_url: coachData.profile_image_url,
        card_image_url: coachData.card_image_url,
        subscription_tier: coachData.subscription_tier || "free",
        is_verified: coachData.is_verified ?? false,
        who_i_work_with: coachData.who_i_work_with || null,
        facebook_url: coachData.facebook_url || null,
        instagram_url: coachData.instagram_url || null,
        tiktok_url: coachData.tiktok_url || null,
        x_url: coachData.x_url || null,
        threads_url: coachData.threads_url || null,
        linkedin_url: coachData.linkedin_url || null,
        youtube_url: coachData.youtube_url || null,
      };
      setProfile(profileData);
      initialProfileRef.current = JSON.parse(JSON.stringify(profileData));
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
        location_city: profile.location_city,
        location_region: profile.location_region,
        location_country: profile.location_country,
        location_country_code: profile.location_country_code,
        location_lat: profile.location_lat,
        location_lng: profile.location_lng,
        location_place_id: profile.location_place_id,
        gym_affiliation: profile.gym_affiliation || null,
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        currency: profile.currency || "GBP",
        coach_types: profile.coach_types,
        online_available: profile.online_available,
        in_person_available: profile.in_person_available,
        profile_image_url: profile.profile_image_url,
        card_image_url: profile.card_image_url,
        who_i_work_with: profile.who_i_work_with,
        facebook_url: profile.facebook_url,
        instagram_url: profile.instagram_url,
        tiktok_url: profile.tiktok_url,
        x_url: profile.x_url,
        threads_url: profile.threads_url,
        linkedin_url: profile.linkedin_url,
        youtube_url: profile.youtube_url,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      // Reset dirty state after successful save
      initialProfileRef.current = JSON.parse(JSON.stringify(profile));
      // Invalidate profile completion queries to update reactively
      queryClient.invalidateQueries({ queryKey: ["coach-profile-completion", user.id] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-profile-completion", user.id] });
      toast.success("Profile updated successfully");
    }
  };

  // Username helpers
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
      .from("coach_profiles")
      .update({ username: newUsername })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to update username");
    } else {
      setProfile({ ...profile, username: newUsername });
      setNewUsername("");
      setUsernameAvailable(null);
      toast.success("Username updated!");
    }
  };

  // Verification helpers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    try {
      await uploadMutation.mutateAsync({ file, documentType: type });
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  const handleViewDocument = async (doc: typeof documents[0]) => {
    setViewingDocId(doc.id);
    try {
      const signedUrl = await signedUrlMutation.mutateAsync(doc.file_url);
      window.open(signedUrl, '_blank');
    } finally {
      setViewingDocId(null);
    }
  };

  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.document_type === type);
  };

  const canSubmit = documents.length > 0 && verificationStatus?.verification_status === "not_submitted";
  const isVerified = verificationStatus?.is_verified;
  const currentStatus = verificationStatus?.verification_status || "not_submitted";
  const StatusIcon = statusConfig[currentStatus as keyof typeof statusConfig]?.icon || AlertCircle;

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
    <DashboardLayout title={t('title')} description={t('description')}>
      <div className="max-w-6xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">{t('title')}</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {[
                { id: "profile", icon: User, label: t('tabs.profile') },
                { id: "marketplace", icon: Store, label: t('tabs.marketplace') },
                { id: "services", icon: CreditCard, label: t('tabs.services') },
                { id: "invoice", icon: Receipt, label: t('tabs.invoice') },
                { id: "verification", icon: Shield, label: t('tabs.verification') },
                { id: "integrations", icon: Plug, label: t('tabs.integrations') },
                { id: "preferences", icon: Globe, label: t('tabs.preferences') },
                { id: "notifications", icon: Bell, label: t('tabs.notifications') },
                { id: "subscription", icon: CreditCard, label: t('tabs.subscription') },
                { id: "account", icon: Shield, label: t('tabs.account') },
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
          <div className="flex-1 min-w-0 overflow-hidden space-y-6">
            {/* Profile Tab - Personal Identity Only */}
            {selectedTab === "profile" && (
              <div className="space-y-6">
                {/* Link to My Profile */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t('profile.personalInfoDesc')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/profile")}>
                        <User className="w-4 h-4 mr-2" />
                        {t('profile.myProfile')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('avatar.title')}</CardTitle>
                    <CardDescription>{t('avatar.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <AvatarShowcase avatar={selectedAvatar} size="md" showStats={false} />
                      <AvatarPicker selectedAvatar={selectedAvatar} profileType="coach" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* My Marketplace Page Tab */}
            {selectedTab === "marketplace" && (
              <div className="space-y-6 pb-24">
                {/* Profile Completion Progress */}
                <ProfileCompletionProgress />

                {/* Section 1: Visual Identity */}
                <MarketplaceSection
                  icon={Image}
                  title={t('marketplace.visualIdentity')}
                  description={t('marketplace.visualIdentityDesc')}
                >
                  <div className="space-y-6">
                    {/* Marketplace Card Photo */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">{t('marketplace.cardPhoto')}</Label>
                      <p className="text-sm text-muted-foreground mb-4">{t('marketplace.cardPhotoDesc')}</p>
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <CardImageUpload
                            currentImageUrl={profile.card_image_url}
                            userId={user?.id || ""}
                            onImageChange={async (url) => {
                              // Update local state immediately for UI feedback
                              setProfile(prev => ({ ...prev, card_image_url: url }));
                              // Auto-save to DB so profile completion updates reactively
                              if (user) {
                                const { error } = await supabase
                                  .from("coach_profiles")
                                  .update({ card_image_url: url })
                                  .eq("user_id", user.id);
                                if (!error) {
                                  queryClient.invalidateQueries({ queryKey: ["coach-profile-completion", user.id] });
                                  queryClient.invalidateQueries({ queryKey: ["marketplace-profile-completion", user.id] });
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="lg:w-80">
                          <p className="text-sm font-medium mb-2 text-muted-foreground">{t('marketplace.cardPreview')}</p>
                          <CoachCardPreview
                            displayName={profile.display_name}
                            cardImageUrl={profile.card_image_url}
                            profileImageUrl={profile.profile_image_url}
                            location={profile.location}
                            bio={profile.bio}
                            coachTypes={profile.coach_types}
                            hourlyRate={profile.hourly_rate}
                            currency={profile.currency}
                            isVerified={profile.is_verified ?? false}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Gallery Images */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">{t('marketplace.galleryImages')}</Label>
                      <p className="text-sm text-muted-foreground mb-4">{t('marketplace.galleryImagesDesc')}</p>
                      <CoachGalleryUpload userId={user?.id || ''} />
                    </div>
                  </div>
                </MarketplaceSection>

                {/* Section 2: About You */}
                <MarketplaceSection
                  icon={UserCircle}
                  title={t('marketplace.aboutYou')}
                  description={t('marketplace.aboutYouDesc')}
                >
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <Label className="text-base font-medium">{t('marketplace.bioLabel')}</Label>
                      <p className="text-sm text-muted-foreground mb-2">{t('marketplace.bioDesc')}</p>
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        placeholder={t('marketplace.bioPlaceholder')}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {(profile.bio?.length || 0)} {t('marketplace.characters')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Years of Experience */}
                      <div>
                        <Label>{t('marketplace.yearsExperience')}</Label>
                        <Input
                          type="number"
                          value={profile.experience_years || ""}
                          onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || null })}
                          className="mt-1"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>

                    {/* Coach Types */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">{t('marketplace.specialisations')}</Label>
                      <CoachTypeSelector
                        selectedTypes={profile.coach_types || []}
                        onChange={(types) => setProfile({ ...profile, coach_types: types })}
                      />
                    </div>

                    <Separator />

                    {/* Who I Work With */}
                    <div>
                      <Label className="text-base font-medium">{t('marketplace.whoIWorkWith')}</Label>
                      <p className="text-sm text-muted-foreground mb-2">{t('marketplace.whoIWorkWithDesc')}</p>
                      <Textarea
                        value={profile.who_i_work_with || ""}
                        onChange={(e) => setProfile({ ...profile, who_i_work_with: e.target.value })}
                        rows={3}
                        placeholder={t('marketplace.whoIWorkWithPlaceholder')}
                      />
                    </div>
                  </div>
                </MarketplaceSection>

                {/* Section 3: Location & Availability */}
                <MarketplaceSection
                  icon={MapPin}
                  title={t('marketplace.locationAvailability')}
                  description={t('marketplace.locationAvailabilityDesc')}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>{t('marketplace.locationLabel')}</Label>
                        <LocationAutocomplete
                          value={profile.location || ""}
                          onLocationChange={(location, data) => {
                            setProfile(prev => ({
                              ...prev,
                              location,
                              location_city: data?.city || null,
                              location_region: data?.region || null,
                              location_country: data?.country || null,
                              location_country_code: data?.country_code || null,
                              location_lat: data?.lat || null,
                              location_lng: data?.lng || null,
                              location_place_id: data?.place_id || null,
                            }));
                          }}
                          placeholder={t('marketplace.locationPlaceholder')}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>{t('marketplace.gymAffiliation')}</Label>
                        <Input
                          value={profile.gym_affiliation || ""}
                          onChange={(e) => setProfile({ ...profile, gym_affiliation: e.target.value })}
                          className="mt-1"
                          placeholder={t('marketplace.gymPlaceholder')}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('marketplace.gymHint')}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium mb-3 block">{t('marketplace.sessionTypes')}</Label>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                          <Switch
                            checked={profile.online_available ?? true}
                            onCheckedChange={(checked) => setProfile({ ...profile, online_available: checked })}
                          />
                          <div>
                            <Label className="cursor-pointer">{t('marketplace.onlineSessions')}</Label>
                            <p className="text-xs text-muted-foreground">{t('marketplace.onlineDesc')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                          <Switch
                            checked={profile.in_person_available ?? false}
                            onCheckedChange={(checked) => setProfile({ ...profile, in_person_available: checked })}
                          />
                          <div>
                            <Label className="cursor-pointer">{t('marketplace.inPersonSessions')}</Label>
                            <p className="text-xs text-muted-foreground">{t('marketplace.inPersonDesc')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MarketplaceSection>

                {/* Section 4: Group Classes */}
                <MarketplaceSection
                  icon={UsersIcon}
                  title={t('marketplace.groupClasses')}
                  description={t('marketplace.groupClassesDesc')}
                  defaultOpen={false}
                >
                  <CoachGroupClassesManager />
                </MarketplaceSection>

                {/* Section 5: Social Media Links */}
                <MarketplaceSection
                  icon={LinkIcon}
                  title={t('marketplace.socialLinks')}
                  description={t('marketplace.socialLinksDesc')}
                  defaultOpen={false}
                >
                  <CoachSocialLinksSection
                    values={{
                      facebook_url: profile.facebook_url,
                      instagram_url: profile.instagram_url,
                      tiktok_url: profile.tiktok_url,
                      x_url: profile.x_url,
                      threads_url: profile.threads_url,
                      linkedin_url: profile.linkedin_url,
                      youtube_url: profile.youtube_url,
                    }}
                    onChange={(field, value) => setProfile({ ...profile, [field]: value || null })}
                    showCard={false}
                  />
                </MarketplaceSection>

                {/* Sticky Save Button */}
                <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-background/95 backdrop-blur border-t p-4 z-40">
                  <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {checkIsDirty() ? t('unsavedChanges') : t('allChangesSaved')}
                    </p>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving || !checkIsDirty()} 
                      size="lg"
                      variant={checkIsDirty() ? "default" : "outline"}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('saveChanges')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Services & Pricing Tab */}
            {selectedTab === "services" && (
              <div className="card-elevated p-6">
                <h2 className="font-display font-bold text-foreground mb-6">{t('services.title')}</h2>

                <div className="space-y-6">
                  {/* Currency Selection */}
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="mb-4">
                      <Label className="text-foreground font-medium">{t('services.pricingCurrency')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('services.pricingCurrencyDesc')}
                      </p>
                    </div>
                    <CurrencySelector 
                      value={profile.currency || "GBP"}
                      onChange={(value) => setProfile({ ...profile, currency: value })}
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{t('services.hourlyRate')}</p>
                      <p className="text-sm text-muted-foreground">{t('services.hourlyRateDesc')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{getCurrencySymbol((profile.currency || "GBP") as any)}</span>
                      <Input
                        type="number"
                        value={profile.hourly_rate || ""}
                        onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) || null })}
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-primary-foreground">
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('saveChanges')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Tab */}
            {selectedTab === "invoice" && coachData?.id && (
              <InvoiceSettingsSection coachId={coachData.id} />
            )}

            {/* Verification Tab */}
            {selectedTab === "verification" && (
              <div className="space-y-6 overflow-hidden">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {isVerified ? (
                            <VerifiedBadge size="lg" showTooltip={false} />
                          ) : (
                            <Shield className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle>{t('verification.verificationStatus')}</CardTitle>
                          <CardDescription>
                            {isVerified 
                              ? t('verification.profileVerified')
                              : t('verification.uploadToVerify')}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${statusConfig[currentStatus as keyof typeof statusConfig]?.color} shrink-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[currentStatus as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  {verificationStatus?.verification_notes && (
                    <CardContent>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm font-medium mb-1">{t('verification.adminNotes')}:</p>
                        <p className="text-sm text-muted-foreground">{verificationStatus.verification_notes}</p>
                      </div>
                    </CardContent>
                  )}
                  {isVerified && verificationStatus?.verified_at && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {t('verification.verifiedOn')} {format(new Date(verificationStatus.verified_at), "MMMM d, yyyy")}
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* Document Upload Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {documentTypes.map(({ type, label, description }) => {
                    const typeDocs = getDocumentsByType(type);
                    const isUploading = uploadingType === type;

                    return (
                      <Card key={type} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{label}</CardTitle>
                          <CardDescription className="text-xs">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-hidden">
                          {/* Uploaded documents */}
                          {typeDocs.map((doc) => (
                          <div
                              key={doc.id}
                              className="p-3 rounded-lg bg-muted/50 space-y-2 overflow-hidden"
                            >
                              <div className="flex items-center justify-between min-w-0 gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="text-sm truncate">{doc.file_name}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      doc.status === "approved" 
                                        ? "text-primary border-primary" 
                                        : doc.status === "rejected"
                                        ? "text-destructive border-destructive"
                                        : ""
                                    }`}
                                  >
                                    {statusConfig[doc.status as keyof typeof statusConfig]?.label || doc.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleViewDocument(doc)}
                                    disabled={viewingDocId === doc.id}
                                  >
                                    {viewingDocId === doc.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </Button>
                                  {doc.status === "pending" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => deleteMutation.mutate(doc.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Upload button */}
                          {currentStatus !== "approved" && (
                            <div>
                              <Label htmlFor={`upload-${type}`} className="cursor-pointer">
                            <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors">
                                  {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  <span className="text-sm">
                                    {isUploading ? t('verification.uploading') : t('verification.uploadDocument')}
                                  </span>
                                </div>
                              </Label>
                              <Input
                                id={`upload-${type}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, type)}
                                disabled={isUploading}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Submit for verification */}
                {canSubmit && (
                  <Card>
                    <CardContent className="pt-6">
                      <Button
                        className="w-full"
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4 mr-2" />
                        )}
                        {t('verification.submitForReview')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Integrations Tab */}
            {selectedTab === "integrations" && (
              <div className="space-y-6">
                {/* Video Conferencing */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{t('integrations.video.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('integrations.video.description')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoProviders.map((provider) => {
                      const settings = getSettings(provider.id);
                      return (
                        <VideoProviderCard
                          key={provider.id}
                          provider={provider.id}
                          providerName={provider.name}
                          providerIcon={provider.icon}
                          providerColor={provider.color}
                          isConnected={!!settings}
                          autoCreateMeetings={settings?.auto_create_meetings}
                          onConnect={() => connectVideoProvider.mutate(provider.id)}
                          onDisconnect={() => settings && disconnectVideoProvider.mutate(settings.id)}
                          onToggleAutoCreate={(enabled) =>
                            settings &&
                            updateSettings.mutate({
                              settingsId: settings.id,
                              autoCreateMeetings: enabled,
                            })
                          }
                          isConnecting={connectVideoProvider.isPending}
                        />
                      );
                    })}
                  </div>
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
                          supportsTwoWaySync={provider.supportsTwoWaySync}
                          onConnect={() => handleCalendarConnect(provider)}
                          onDisconnect={() => connection && disconnectCalendar.mutate(connection.id)}
                          onToggleSync={(enabled) =>
                            connection && toggleSync.mutate({ connectionId: connection.id, enabled })
                          }
                          isConnecting={connectCalendar.isPending}
                        />
                      );
                    })}
                  </div>
                  
                  <AppleCalendarConnectModal
                    open={showAppleCalendarModal}
                    onOpenChange={setShowAppleCalendarModal}
                  />
                </div>

                <Separator />

                {/* Data & Privacy */}
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <h3 className="font-medium">{t('integrations.dataPrivacy.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('integrations.dataPrivacy.description')}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <Link to="/privacy#integrations" className="text-primary hover:underline">
                            {t('integrations.dataPrivacy.privacyPolicy')}
                          </Link>
                          <span className="text-muted-foreground">•</span>
                          <Link to="/terms" className="text-primary hover:underline">
                            {t('integrations.dataPrivacy.termsOfService')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preferences Tab */}
            {selectedTab === "preferences" && (
              <div className="space-y-6">
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">{t('preferences.displayPreferences')}</h2>
                  <div className="space-y-6">
                    <LanguageSelector />
                    <Separator />
                    <LocationSelector />
                    <Separator />
                    <div className="max-w-xs">
                      <CurrencySelector />
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('preferences.currencyHint')}
                      </p>
                    </div>
                    <Separator />
                    <div className="max-w-xs">
                      <Label htmlFor="cancellation-hours" className="text-base font-medium">{t('preferences.cancellationPolicy')}</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('preferences.cancellationPolicyDesc')}
                      </p>
                      <Input
                        id="cancellation-hours"
                        type="number"
                        min="1"
                        max="168"
                        defaultValue="24"
                        placeholder="24"
                        className="w-24"
                        onChange={async (e) => {
                          const hours = parseInt(e.target.value) || 24;
                          if (user) {
                            await supabase
                              .from("coach_profiles")
                              .update({ min_cancellation_hours: hours })
                              .eq("user_id", user.id);
                            toast.success("Cancellation policy updated");
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{t('preferences.hours')}</p>
                    </div>
                  </div>
                </div>

                {/* Animation Settings */}
                <AnimationSettingsCard />
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
                <AccountSecuritySection role="coach" />

                <Card>
                  <CardHeader>
                    <CardTitle>{t('account.session')}</CardTitle>
                    <CardDescription>{t('account.sessionDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('account.signOut')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachSettings;
