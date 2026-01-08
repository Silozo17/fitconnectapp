import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Mail, MapPin, FileText, Globe, User, Clock, Building2, Gift, AlertCircle } from "lucide-react";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useGrantFreePlan, useRevokeGrantedPlan } from "@/hooks/useAdminData";
import { StatusBadge } from "./StatusBadge";
import { LocationAutocomplete, LocationData } from "@/components/shared/LocationAutocomplete";
import { CoachTypeSelector } from "@/components/coach/CoachTypeSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AdminQualificationsManager } from "./AdminQualificationsManager";
import { GymAutocomplete } from "@/components/shared/GymAutocomplete";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
  experience_start_date: string | null;
  gym_affiliation: string | null;
}

const EditCoachModal = ({ coach, open, onClose, onSaved }: EditCoachModalProps) => {
  const [displayName, setDisplayName] = useState(coach.display_name || "");
  const [hourlyRate, setHourlyRate] = useState(coach.hourly_rate?.toString() || "");
  const [subscriptionTier, setSubscriptionTier] = useState(coach.subscription_tier || "free");
  const [originalTier, setOriginalTier] = useState(coach.subscription_tier || "free");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [tierChangePending, setTierChangePending] = useState(false);
  
  // Extended fields
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [coachTypes, setCoachTypes] = useState<string[]>([]);
  const [onlineAvailable, setOnlineAvailable] = useState(false);
  const [inPersonAvailable, setInPersonAvailable] = useState(false);
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceStartDate, setExperienceStartDate] = useState("");
  const [gymAffiliation, setGymAffiliation] = useState("");
  
  const { getUserEmail, updateEmail } = useAdminUserManagement("coach");
  const grantFreePlan = useGrantFreePlan();
  const revokeGrantedPlan = useRevokeGrantedPlan();

  // Fetch active admin grant for this coach
  const { data: activeGrant, refetch: refetchGrant } = useQuery({
    queryKey: ["coach-active-grant", coach.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_granted_subscriptions")
        .select("*")
        .eq("coach_id", coach.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: open && !!coach.id,
  });

  // Fetch full coach profile data
  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!open || !coach.id) return;
      
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("bio, location, location_city, location_region, location_country, location_country_code, location_lat, location_lng, coach_types, online_available, in_person_available, experience_years, experience_start_date, gym_affiliation")
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
        setExperienceStartDate(profile.experience_start_date || "");
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
    setOriginalTier(coach.subscription_tier || "free");
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

  // Handle tier change via admin grant system
  const handleTierChange = async (newTier: string) => {
    if (newTier === originalTier) {
      setSubscriptionTier(newTier);
      return;
    }

    setTierChangePending(true);
    try {
      // CRITICAL: For founder tier, ALWAYS use edge function (even without active grant)
      // The protect_founder_tier trigger blocks direct updates, so we must use the RPC
      if (originalTier === "founder" && newTier !== "founder") {
        await revokeGrantedPlan.mutateAsync({
          grantId: activeGrant?.id || "direct-admin-change",
          coachId: coach.id,
          tier: originalTier,
          coachName: coach.display_name || undefined,
          targetTier: newTier,
        });
        toast.success(`Coach tier changed to ${newTier}`);
      } else if (newTier === "free") {
        // Revoke any existing grant and set to free (non-founder case)
        if (activeGrant) {
          await revokeGrantedPlan.mutateAsync({
            grantId: activeGrant.id,
            coachId: coach.id,
            tier: activeGrant.tier,
            coachName: coach.display_name || undefined,
          });
        } else {
          // Direct update is OK for non-founder tiers
          await supabase
            .from("coach_profiles")
            .update({ subscription_tier: "free" })
            .eq("id", coach.id);
        }
        toast.success("Coach set to Free tier");
      } else {
        // Grant the new tier via admin grant system (protected from RevenueCat reconciliation)
        await grantFreePlan.mutateAsync({
          coachId: coach.id,
          tier: newTier,
          reason: "Admin tier change via Edit Coach modal",
          coachName: coach.display_name || undefined,
        });
        toast.success(`Coach granted ${newTier} tier`);
      }
      
      setSubscriptionTier(newTier);
      setOriginalTier(newTier);
      refetchGrant();
    } catch (error) {
      console.error("Failed to change tier:", error);
      toast.error("Failed to change tier");
      // Revert to original
      setSubscriptionTier(originalTier);
    } finally {
      setTierChangePending(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Note: subscription_tier is now handled separately via handleTierChange
    const updateData: Record<string, unknown> = {
      display_name: displayName || null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      bio: bio || null,
      coach_types: coachTypes.length > 0 ? coachTypes : null,
      online_available: onlineAvailable,
      in_person_available: inPersonAvailable,
      // Calculate experience_start_date from years if years changed
      experience_start_date: experienceYears 
        ? new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(experienceYears, 10))).toISOString().split('T')[0]
        : experienceStartDate || null,
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
                  <Select 
                    value={subscriptionTier} 
                    onValueChange={handleTierChange}
                    disabled={tierChangePending}
                  >
                    <SelectTrigger>
                      {tierChangePending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select tier" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="z-[200]" position="popper" sideOffset={4}>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Active admin grant indicator */}
                  {activeGrant && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                      <Gift className="h-4 w-4 text-green-500" />
                      <div className="flex-1 text-xs">
                        <span className="text-green-600 font-medium">Admin Granted</span>
                        {activeGrant.expires_at && (
                          <span className="text-muted-foreground ml-1">
                            • Expires {format(new Date(activeGrant.expires_at), "MMM d, yyyy")}
                          </span>
                        )}
                        {!activeGrant.expires_at && activeGrant.tier !== "founder" && (
                          <span className="text-muted-foreground ml-1">• No expiry</span>
                        )}
                        {activeGrant.tier === "founder" && (
                          <span className="text-amber-500 ml-1">• Lifetime</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Tier changes are protected from automatic reconciliation
                  </p>
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
                    <p className="text-xs text-muted-foreground">Experience years auto-increment each year from start date</p>
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
