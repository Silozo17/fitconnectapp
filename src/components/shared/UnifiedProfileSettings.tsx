import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, checkUsernameAvailable } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";
import { AtSign, Copy, Check, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { LocationAutocomplete } from "@/components/shared/LocationAutocomplete";

interface UnifiedProfileSettingsProps {
  showAvatar?: boolean;
  showUsername?: boolean;
  showLocation?: boolean;
}

export const UnifiedProfileSettings = ({
  showAvatar = true,
  showUsername = true,
  showLocation = true,
}: UnifiedProfileSettingsProps) => {
  const { user } = useAuth();
  const { profile, displayName, updateProfile, updateUsername, updateAvatar, isUpdating } = useUserProfile();
  
  const [newUsername, setNewUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [usernameCopied, setUsernameCopied] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [country, setCountry] = useState("");
  
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setLocation(profile.location || "");
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

  const saveUsername = async () => {
    if (!newUsername || !usernameAvailable) return;
    updateUsername(newUsername);
    setNewUsername("");
    setUsernameAvailable(null);
  };

  const saveProfile = () => {
    updateProfile({
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: firstName ? `${firstName}${lastName ? ` ${lastName}` : ""}` : null,
      location: location || null,
      city: city || null,
      county: county || null,
      country: country || null,
    });
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      {showAvatar && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>This photo is used across all your roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload
              currentImageUrl={profile.avatar_url}
              userId={user?.id || ""}
              displayName={displayName || ""}
              onImageChange={(url) => updateAvatar(url)}
              size="lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Username */}
      {showUsername && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AtSign className="w-5 h-5 text-primary" />
              Username
            </CardTitle>
            <CardDescription>Your unique identifier across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <AtSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono font-medium">{profile.username}</span>
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
                  disabled={isUpdating || !usernameAvailable || !newUsername}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
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
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your identity across all roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          
          {showLocation && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <LocationAutocomplete
                value={city ? `${city}${country ? `, ${country}` : ''}` : location || ''}
                onLocationChange={(loc, data) => {
                  if (data) {
                    setLocation(data.formatted_address);
                    setCity(data.city);
                    setCounty(data.region);
                    setCountry(data.country);
                  } else if (!loc) {
                    setLocation('');
                    setCity('');
                    setCounty('');
                    setCountry('');
                  }
                }}
                placeholder="Search for your city..."
              />
              <p className="text-xs text-muted-foreground">
                Search and select a location to auto-fill city, county, and country
              </p>
            </div>
          )}

          <Button onClick={saveProfile} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
