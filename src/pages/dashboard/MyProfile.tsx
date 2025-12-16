import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, AtSign, Copy, Check, Mail, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { checkUsernameAvailable } from "@/hooks/useUserProfile";
import { format } from "date-fns";

const MyProfile = () => {
  const { user } = useAuth();
  const { 
    profile, 
    isLoading, 
    displayName, 
    updateProfile, 
    updateUsername, 
    updateAvatar,
    isUpdating 
  } = useUserProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [country, setCountry] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [usernameCopied, setUsernameCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setCity(profile.city || "");
      setCounty(profile.county || "");
      setCountry(profile.country || "");
    }
  }, [profile]);

  const copyUsername = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(`@${profile.username}`);
      setUsernameCopied(true);
      setTimeout(() => setUsernameCopied(false), 2000);
      toast.success("Username copied!");
    }
  };

  const handleUsernameChange = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    setNewUsername(cleaned);

    if (!cleaned || cleaned.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(cleaned.length > 0 ? "Username must be at least 3 characters" : "");
      return;
    }
    if (cleaned.length > 30) {
      setUsernameAvailable(null);
      setUsernameError("Username must be 30 characters or less");
      return;
    }
    if (cleaned === profile?.username) {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    setCheckingUsername(true);
    setUsernameError("");

    const available = await checkUsernameAvailable(cleaned);
    setCheckingUsername(false);
    setUsernameAvailable(available);
    if (!available) {
      setUsernameError("This username is already taken");
    }
  };

  const saveUsername = () => {
    if (!newUsername || !usernameAvailable) return;
    updateUsername(newUsername);
    setNewUsername("");
    setUsernameAvailable(null);
  };

  const saveProfile = () => {
    updateProfile({
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: firstName && lastName ? `${firstName} ${lastName}` : firstName || null,
      city: city || null,
      county: county || null,
      country: country || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information across all roles</p>
        </div>

        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>This photo is used across all your roles (Client, Coach, Admin)</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload
              currentImageUrl={profile?.avatar_url || null}
              userId={user?.id || ""}
              displayName={displayName || ""}
              onImageChange={(url) => updateAvatar(url)}
              size="lg"
            />
          </CardContent>
        </Card>

        {/* Username */}
        <Card>
          <CardHeader>
            <CardTitle>Username</CardTitle>
            <CardDescription>Your unique identifier on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Username */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <AtSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{profile?.username}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={copyUsername}
              >
                {usernameCopied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Change Username */}
            <Separator />
            <div className="space-y-2">
              <Label>Change Username</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="newusername"
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={saveUsername}
                  disabled={!newUsername || !usernameAvailable || isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </div>
              {checkingUsername && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {usernameError && (
                <p className="text-sm text-destructive">{usernameError}</p>
              )}
              {usernameAvailable === true && (
                <p className="text-sm text-primary">Username is available!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your name and location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County/State</Label>
                  <Input
                    id="county"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="Your county"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Your country"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {profile?.created_at ? format(new Date(profile.created_at), "MMMM d, yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
