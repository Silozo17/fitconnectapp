import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
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

const coachTypes = ["Personal Trainer", "Nutritionist", "Boxing Coach", "MMA Coach", "Yoga Instructor", "CrossFit Coach"];

interface CoachProfile {
  display_name: string | null;
  username: string;
  bio: string | null;
  location: string | null;
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
}[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: <Calendar className="w-6 h-6 text-white" />,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
];

const documentTypes: { type: DocumentType; label: string; description: string }[] = [
  { type: "identity", label: "Government ID", description: "Passport, driver's license, or national ID" },
  { type: "certification", label: "Professional Certification", description: "Personal training, nutrition, or coaching certification" },
  { type: "insurance", label: "Liability Insurance", description: "Professional indemnity or liability insurance" },
  { type: "qualification", label: "Qualifications", description: "Relevant degrees, diplomas, or qualifications" },
];

const statusConfig = {
  not_submitted: { label: "Not Submitted", color: "bg-muted text-muted-foreground", icon: AlertCircle },
  pending: { label: "Under Review", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: "Verified", color: "bg-primary/10 text-primary", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const CoachSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { currency } = useLocale();
  
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

  const [profile, setProfile] = useState<CoachProfile>({
    display_name: "",
    username: "",
    bio: "",
    location: "",
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

  // Fetch coach profile with React Query
  const { data: coachData, isLoading: loading, refetch } = useQuery({
    queryKey: ["coach-profile-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, username, bio, location, gym_affiliation, experience_years, hourly_rate, currency, coach_types, online_available, in_person_available, profile_image_url, card_image_url, subscription_tier, is_verified, who_i_work_with, facebook_url, instagram_url, tiktok_url, x_url, threads_url, linkedin_url, youtube_url")
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
        username: coachData.username || "",
        bio: coachData.bio || "",
        location: coachData.location || "",
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
    <DashboardLayout title="Settings" description="Manage your account settings and preferences.">
      <div className="max-w-6xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {[
                { id: "profile", icon: User, label: "Profile" },
                { id: "marketplace", icon: Store, label: "My Marketplace Page" },
                { id: "services", icon: CreditCard, label: "Services & Pricing" },
                { id: "invoice", icon: Receipt, label: "Invoice Settings" },
                { id: "verification", icon: Shield, label: "Verification" },
                { id: "integrations", icon: Plug, label: "Integrations" },
                { id: "preferences", icon: Globe, label: "Preferences" },
                { id: "notifications", icon: Bell, label: "Notifications" },
                { id: "subscription", icon: CreditCard, label: "Subscription" },
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
                          Edit your name, username, and profile photo in <span className="font-medium text-foreground">My Profile</span>
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/profile")}>
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Avatar</CardTitle>
                    <CardDescription>Choose an avatar to represent you on the platform</CardDescription>
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
              <div className="space-y-6">
                {/* Marketplace Card Photo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Marketplace Card Photo</CardTitle>
                    <CardDescription>This landscape image appears on your card in search results and listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <CardImageUpload
                          currentImageUrl={profile.card_image_url}
                          userId={user?.id || ""}
                          onImageChange={(url) => setProfile({ ...profile, card_image_url: url })}
                        />
                      </div>
                      <div className="lg:w-80">
                        <p className="text-sm font-medium mb-2 text-muted-foreground">Card Preview</p>
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
                  </CardContent>
                </Card>

                {/* Professional Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Professional Details</CardTitle>
                    <CardDescription>Tell clients about your expertise and experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="mt-1"
                        rows={4}
                        placeholder="Tell clients about your background and coaching philosophy..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          value={profile.experience_years || ""}
                          onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || null })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
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
                  </CardContent>
                </Card>

                {/* Location & Workplace */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location & Workplace</CardTitle>
                    <CardDescription>Where do you train clients?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Label>Gym Affiliation</Label>
                        <Input
                          value={profile.gym_affiliation || ""}
                          onChange={(e) => setProfile({ ...profile, gym_affiliation: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., PureGym Manchester, Independent"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave blank if you're an online-only coach.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Availability</CardTitle>
                    <CardDescription>How can clients train with you?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6">
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
                  </CardContent>
                </Card>

                {/* Who I Work With */}
                <CoachWhoIWorkWithSection
                  value={profile.who_i_work_with || ""}
                  onChange={(value) => setProfile({ ...profile, who_i_work_with: value })}
                />

                {/* Gallery Images */}
                <CoachGalleryUpload />

                {/* Group Classes */}
                <CoachGroupClassesManager />

                {/* Social Media Links */}
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
                />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Services & Pricing Tab */}
            {selectedTab === "services" && (
              <div className="card-elevated p-6">
                <h2 className="font-display font-bold text-foreground mb-6">Services & Pricing</h2>

                <div className="space-y-6">
                  {/* Currency Selection */}
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="mb-4">
                      <Label className="text-foreground font-medium">Pricing Currency</Label>
                      <p className="text-sm text-muted-foreground">
                        Select the currency for your rates. This will be displayed to clients.
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
                      <p className="font-medium text-foreground">Hourly Rate</p>
                      <p className="text-sm text-muted-foreground">Your base session rate</p>
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
                      Save Changes
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
                          <CardTitle>Verification Status</CardTitle>
                          <CardDescription>
                            {isVerified 
                              ? "Your profile is verified" 
                              : "Upload documents to get verified"}
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
                        <p className="text-sm font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{verificationStatus.verification_notes}</p>
                      </div>
                    </CardContent>
                  )}
                  {isVerified && verificationStatus?.verified_at && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Verified on {format(new Date(verificationStatus.verified_at), "MMMM d, yyyy")}
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
                                    {doc.status}
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
                                    {isUploading ? "Uploading..." : "Upload document"}
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
                        Submit for Verification
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
                    <h2 className="text-xl font-semibold mb-1">Video Conferencing</h2>
                    <p className="text-sm text-muted-foreground">
                      Automatically create video meeting links for your online sessions
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
                    <h2 className="text-xl font-semibold mb-1">Calendar Sync</h2>
                    <p className="text-sm text-muted-foreground">
                      Automatically add coaching sessions to your calendar
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

                <Separator />

                {/* Data & Privacy */}
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <h3 className="font-medium">Data & Privacy</h3>
                        <p className="text-sm text-muted-foreground">
                          When you connect integrations, your data is handled according to our privacy practices. 
                          Learn more about how we protect your data.
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
              </div>
            )}

            {/* Preferences Tab */}
            {selectedTab === "preferences" && (
              <div className="card-elevated p-6">
                <h2 className="font-display font-bold text-foreground mb-6">Display Preferences</h2>
                <div className="space-y-6">
                  <LanguageSelector />
                  <Separator />
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
                <AccountSecuritySection role="coach" />

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
    </DashboardLayout>
  );
};

export default CoachSettings;
