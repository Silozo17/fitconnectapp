import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, FileText, Globe, User, Clock, Building2 } from "lucide-react";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { StatusBadge } from "./StatusBadge";
import { LocationAutocomplete, LocationData } from "@/components/shared/LocationAutocomplete";
import { CoachTypeSelector } from "@/components/coach/CoachTypeSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AdminQualificationsManager } from "./AdminQualificationsManager";
import { GymAutocomplete } from "@/components/shared/GymAutocomplete";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
  created_at: string;
  status?: string | null;
}

interface EditCoachModalProps {
  coach: CoachUser;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface CoachProfileData {
  bio: string | null;
  location: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  location_country_code: string | null;
  location_lat: number | null;
  location_lng: number | null;
  coach_types: string[] | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  experience_years: number | null;
  gym_affiliation: string | null;
}

const EditCoachModal = ({ coach, open, onClose, onSaved }: EditCoachModalProps) => {
  const [displayName, setDisplayName] = useState(coach.display_name || "");
  const [hourlyRate, setHourlyRate] = useState(coach.hourly_rate?.toString() || "");
  const [subscriptionTier, setSubscriptionTier] = useState(coach.subscription_tier || "free");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Extended fields
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [coachTypes, setCoachTypes] = useState<string[]>([]);
  const [onlineAvailable, setOnlineAvailable] = useState(false);
  const [inPersonAvailable, setInPersonAvailable] = useState(false);
  const [experienceYears, setExperienceYears] = useState("");
  const [gymAffiliation, setGymAffiliation] = useState("");
  
  const { getUserEmail, updateEmail } = useAdminUserManagement("coach");

  // Fetch full coach profile data
  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!open || !coach.id) return;
      
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("bio, location, location_city, location_region, location_country, location_country_code, location_lat, location_lng, coach_types, online_available, in_person_available, experience_years, gym_affiliation")
        .eq("id", coach.id)
        .single();
      
      if (error) {
        console.error("Failed to fetch coach profile:", error);
      } else if (data) {
        const profile = data as CoachProfileData;
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setCoachTypes(profile.coach_types || []);
        setOnlineAvailable(profile.online_available || false);
        setInPersonAvailable(profile.in_person_available || false);
        setExperienceYears(profile.experience_years?.toString() || "");
        setGymAffiliation(profile.gym_affiliation || "");
        
        if (profile.location) {
          setLocationData({
            formattedAddress: profile.location,
            city: profile.location_city || undefined,
            region: profile.location_region || undefined,
            country: profile.location_country || undefined,
            countryCode: profile.location_country_code || undefined,
            lat: profile.location_lat || undefined,
            lng: profile.location_lng || undefined,
          });
        }
      }
      setLoadingProfile(false);
    };

    fetchCoachProfile();
  }, [open, coach.id]);

  useEffect(() => {
    const fetchEmail = async () => {
      setLoadingEmail(true);
      const userEmail = await getUserEmail(coach.user_id);
      if (userEmail) {
        setEmail(userEmail);
        setOriginalEmail(userEmail);
      }
      setLoadingEmail(false);
    };
    
    if (open && coach.user_id) {
      fetchEmail();
    }
  }, [open, coach.user_id]);

  // Reset form when coach changes
  useEffect(() => {
    setDisplayName(coach.display_name || "");
    setHourlyRate(coach.hourly_rate?.toString() || "");
    setSubscriptionTier(coach.subscription_tier || "free");
  }, [coach]);

  const handleEmailUpdate = async () => {
    if (!email || email === originalEmail) return;
    
    setUpdatingEmail(true);
    const success = await updateEmail(coach.user_id, coach.id, email);
    if (success) {
      setOriginalEmail(email);
    }
    setUpdatingEmail(false);
  };

  const handleLocationChange = (loc: string, data?: LocationData) => {
    setLocation(loc);
    setLocationData(data || null);
  };

  const handleSave = async () => {
    setSaving(true);

    const updateData: Record<string, unknown> = {
      display_name: displayName || null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      subscription_tier: subscriptionTier,
      bio: bio || null,
      coach_types: coachTypes.length > 0 ? coachTypes : null,
      online_available: onlineAvailable,
      in_person_available: inPersonAvailable,
      experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
      gym_affiliation: gymAffiliation || null,
    };

    // Add location data if set
    if (locationData) {
      updateData.location = locationData.formattedAddress || locationData.formatted_address;
      updateData.location_city = locationData.city || null;
      updateData.location_region = locationData.region || null;
      updateData.location_country = locationData.country || null;
      updateData.location_country_code = locationData.countryCode || locationData.country_code || null;
      updateData.location_lat = locationData.lat || null;
      updateData.location_lng = locationData.lng || null;
    } else if (location) {
      // Manual location without autocomplete data
      updateData.location = location;
    }

    const { error } = await supabase
      .from("coach_profiles")
      .update(updateData)
      .eq("id", coach.id);

    if (error) {
      toast.error("Failed to update coach");
      console.error(error);
    } else {
      toast.success("Coach updated successfully");
      onSaved();
      onClose();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Coach Profile</DialogTitle>
          <DialogDescription>
            Update coach account details and profile information
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Account Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Details
              </h3>
              
              {/* Email Section */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  {loadingEmail ? (
                    <div className="flex-1 flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email"
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleEmailUpdate}
                        disabled={!email || email === originalEmail || updatingEmail}
                      >
                        {updatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Display */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <StatusBadge status={coach.status || "active"} />
                  <span className="text-xs text-muted-foreground">
                    (Change status via dropdown menu)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="Enter hourly rate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Subscription Tier</Label>
                  <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Profile Information
              </h3>

              {loadingProfile ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profile data...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Enter coach bio..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <LocationAutocomplete
                      value={location}
                      onLocationChange={handleLocationChange}
                      placeholder="Search for location..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gymAffiliation" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Gym Affiliation
                    </Label>
                    <GymAutocomplete
                      value={gymAffiliation}
                      onChange={setGymAffiliation}
                      placeholder="Search for a gym or studio..."
                      locationBias={locationData ? { lat: locationData.lat!, lng: locationData.lng! } : null}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceYears" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Years of Experience
                    </Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      max="50"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="Enter years of experience"
                    />
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Services Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Services & Availability
              </h3>

              {!loadingProfile && (
                <>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="onlineAvailable"
                        checked={onlineAvailable}
                        onCheckedChange={(checked) => setOnlineAvailable(checked === true)}
                      />
                      <Label htmlFor="onlineAvailable" className="text-sm font-normal">
                        Available Online
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inPersonAvailable"
                        checked={inPersonAvailable}
                        onCheckedChange={(checked) => setInPersonAvailable(checked === true)}
                      />
                      <Label htmlFor="inPersonAvailable" className="text-sm font-normal">
                        Available In-Person
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Coach Types / Specialties</Label>
                    <CoachTypeSelector
                      selectedTypes={coachTypes}
                      onChange={setCoachTypes}
                    />
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Qualifications Section */}
            <AdminQualificationsManager coachId={coach.id} />
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loadingProfile}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCoachModal;
