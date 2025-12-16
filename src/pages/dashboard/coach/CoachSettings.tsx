import { useState, useEffect } from "react";
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
  AtSign,
  Copy,
  Check,
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
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
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
import { format } from "date-fns";
import { Upload, FileText, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Eye } from "lucide-react";

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
  subscription_tier: string | null;
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
  const { user, signOut } = useAuth();
  const { currency } = useLocale();
  const [selectedTab, setSelectedTab] = useState("profile");
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
    subscription_tier: "free",
  });

  // Fetch coach profile with React Query
  const { data: coachData, isLoading: loading, refetch } = useQuery({
    queryKey: ["coach-profile-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, username, bio, location, gym_affiliation, experience_years, hourly_rate, currency, coach_types, online_available, in_person_available, profile_image_url, subscription_tier")
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
        gym_affiliation: profile.gym_affiliation || null,
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        currency: profile.currency || "GBP",
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
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {[
                { id: "profile", icon: User, label: "Profile" },
                { id: "services", icon: CreditCard, label: "Services & Pricing" },
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
          <div className="flex-1 space-y-6">
            {/* Profile Tab */}
            {selectedTab === "profile" && (
              <>
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">Profile Information</h2>
                  
                  {/* Avatar Selection */}
                  <div className="mb-6">
                    <Label className="mb-3 block">Your Avatar</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <AvatarShowcase avatar={selectedAvatar} size="md" showStats={false} />
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground mb-2">
                          Choose an avatar to represent you on the platform
                        </p>
                        <AvatarPicker selectedAvatar={selectedAvatar} profileType="coach" />
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo */}
                  <div className="mb-6">
                    <Label className="mb-3 block">Profile Photo</Label>
                    <ProfileImageUpload
                      currentImageUrl={profile.profile_image_url}
                      userId={user?.id || ""}
                      displayName={profile.display_name || ""}
                      onImageChange={(url) => setProfile({ ...profile, profile_image_url: url })}
                      size="lg"
                    />
                  </div>

                  {/* Username */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AtSign className="w-4 h-4 text-primary" />
                        Username
                      </CardTitle>
                      <CardDescription>Your unique identifier for connections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                        <AtSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono font-medium">{profile?.username}</span>
                        <Button variant="ghost" size="sm" onClick={copyUsername} className="ml-auto">
                          {usernameCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
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
                          <Button onClick={saveUsername} disabled={saving || !usernameAvailable || !newUsername}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                        {checkingUsername && <p className="text-sm text-muted-foreground">Checking availability...</p>}
                        {usernameError && <p className="text-sm text-destructive">{usernameError}</p>}
                        {usernameAvailable && newUsername && <p className="text-sm text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Username available!</p>}
                        <p className="text-xs text-muted-foreground">Lowercase letters and numbers only, 3-30 characters</p>
                      </div>
                    </CardContent>
                  </Card>

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
                      <Label>Gym Affiliation</Label>
                      <Input
                        value={profile.gym_affiliation || ""}
                        onChange={(e) => setProfile({ ...profile, gym_affiliation: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., PureGym Manchester, Independent"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Where do you train clients? Leave blank if you're an online-only coach.
                      </p>
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

            {/* Verification Tab */}
            {selectedTab === "verification" && (
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                      <Badge className={statusConfig[currentStatus as keyof typeof statusConfig]?.color}>
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
                      <Card key={type}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{label}</CardTitle>
                          <CardDescription className="text-xs">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Uploaded documents */}
                          {typeDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-lg bg-muted/50 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="text-sm truncate">{doc.file_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
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
