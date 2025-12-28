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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, User, MapPin, Heart, Target, Shield, Trophy } from "lucide-react";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { StatusBadge } from "./StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LocationAutocomplete } from "@/components/shared/LocationAutocomplete";

interface ClientUser {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  date_of_birth: string | null;
  onboarding_completed: boolean;
  created_at: string;
  status?: string | null;
  gender_pronouns?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
  location?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goals?: string[] | null;
  medical_conditions?: string[] | null;
  allergies?: string[] | null;
  dietary_restrictions?: string[] | null;
  leaderboard_visible?: boolean | null;
  leaderboard_display_name?: string | null;
}

interface EditUserModalProps {
  user: ClientUser;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditUserModal = ({ user, open, onClose, onSaved }: EditUserModalProps) => {
  // Basic Info
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth || "");
  const [pronouns, setPronouns] = useState(user.gender_pronouns || "");
  
  // Email
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  
  // Location
  const [city, setCity] = useState(user.city || "");
  const [county, setCounty] = useState(user.county || "");
  const [country, setCountry] = useState(user.country || "");
  
  // Health Data
  const [heightCm, setHeightCm] = useState(user.height_cm?.toString() || "");
  const [weightKg, setWeightKg] = useState(user.weight_kg?.toString() || "");
  const [fitnessGoals, setFitnessGoals] = useState(user.fitness_goals?.join(", ") || "");
  const [medicalConditions, setMedicalConditions] = useState(user.medical_conditions?.join(", ") || "");
  const [allergies, setAllergies] = useState(user.allergies?.join(", ") || "");
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user.dietary_restrictions?.join(", ") || "");
  
  // Settings
  const [onboardingCompleted, setOnboardingCompleted] = useState(user.onboarding_completed);
  const [leaderboardVisible, setLeaderboardVisible] = useState(user.leaderboard_visible || false);
  const [leaderboardDisplayName, setLeaderboardDisplayName] = useState(user.leaderboard_display_name || "");
  
  const [saving, setSaving] = useState(false);
  
  const { getUserEmail, updateEmail } = useAdminUserManagement("client");

  useEffect(() => {
    const fetchEmail = async () => {
      setLoadingEmail(true);
      const userEmail = await getUserEmail(user.user_id);
      if (userEmail) {
        setEmail(userEmail);
        setOriginalEmail(userEmail);
      }
      setLoadingEmail(false);
    };
    
    if (open && user.user_id) {
      fetchEmail();
    }
  }, [open, user.user_id]);

  // Reset form when user changes
  useEffect(() => {
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setDateOfBirth(user.date_of_birth || "");
    setPronouns(user.gender_pronouns || "");
    setCity(user.city || "");
    setCounty(user.county || "");
    setCountry(user.country || "");
    setHeightCm(user.height_cm?.toString() || "");
    setWeightKg(user.weight_kg?.toString() || "");
    setFitnessGoals(user.fitness_goals?.join(", ") || "");
    setMedicalConditions(user.medical_conditions?.join(", ") || "");
    setAllergies(user.allergies?.join(", ") || "");
    setDietaryRestrictions(user.dietary_restrictions?.join(", ") || "");
    setOnboardingCompleted(user.onboarding_completed);
    setLeaderboardVisible(user.leaderboard_visible || false);
    setLeaderboardDisplayName(user.leaderboard_display_name || "");
  }, [user]);

  const handleEmailUpdate = async () => {
    if (!email || email === originalEmail) return;
    
    setUpdatingEmail(true);
    const success = await updateEmail(user.user_id, user.id, email);
    if (success) {
      setOriginalEmail(email);
    }
    setUpdatingEmail(false);
  };

  const parseCommaSeparated = (value: string): string[] => {
    return value.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("client_profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        date_of_birth: dateOfBirth || null, // Age auto-calculated by trigger
        gender_pronouns: pronouns || null,
        city: city || null,
        county: county || null,
        country: country || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        fitness_goals: parseCommaSeparated(fitnessGoals),
        medical_conditions: parseCommaSeparated(medicalConditions),
        allergies: parseCommaSeparated(allergies),
        dietary_restrictions: parseCommaSeparated(dietaryRestrictions),
        onboarding_completed: onboardingCompleted,
        leaderboard_visible: leaderboardVisible,
        leaderboard_display_name: leaderboardDisplayName || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update user");
      console.error(error);
    } else {
      toast.success("User updated successfully");
      onSaved();
      onClose();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update all user account details and settings
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="location" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Location
              </TabsTrigger>
              <TabsTrigger value="health" className="text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Health
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              {/* Status Display */}
              <div className="flex items-center justify-between p-3 rounded-lg glass-item">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Account Status:</Label>
                  <StatusBadge status={user.status || "active"} />
                </div>
                <span className="text-xs text-muted-foreground">
                  (Change via dropdown menu)
                </span>
              </div>

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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {user.age !== null && (
                    <p className="text-xs text-muted-foreground">Current age: {user.age} years</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="e.g., he/him, she/her, they/them"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <LocationAutocomplete
                  value={city ? `${city}${country ? `, ${country}` : ''}` : ''}
                  onLocationChange={(loc, data) => {
                    if (data) {
                      setCity(data.city);
                      setCounty(data.region);
                      setCountry(data.country);
                    } else if (!loc) {
                      setCity('');
                      setCounty('');
                      setCountry('');
                    }
                  }}
                  placeholder="Search for a city..."
                />
                <p className="text-xs text-muted-foreground">
                  Search and select a location to auto-fill city, county, and country
                </p>
              </div>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="Enter height in cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Enter weight in kg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessGoals">Fitness Goals</Label>
                <Textarea
                  id="fitnessGoals"
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                  placeholder="Comma-separated goals (e.g., Weight loss, Build muscle, Improve endurance)"
                  rows={2}
                />
                {fitnessGoals && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseCommaSeparated(fitnessGoals).map((goal, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions" className="text-amber-600">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="Comma-separated conditions"
                  rows={2}
                />
                {medicalConditions && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseCommaSeparated(medicalConditions).map((condition, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">{condition}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-red-600">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Comma-separated allergies"
                  rows={2}
                />
                {allergies && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseCommaSeparated(allergies).map((allergy, i) => (
                      <Badge key={i} className="text-xs bg-red-500/10 text-red-600 border-red-500/30">{allergy}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="Comma-separated restrictions (e.g., Vegetarian, Gluten-free)"
                  rows={2}
                />
                {dietaryRestrictions && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseCommaSeparated(dietaryRestrictions).map((restriction, i) => (
                      <Badge key={i} className="text-xs bg-green-500/10 text-green-600 border-green-500/30">{restriction}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Onboarding Completed</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark whether the user has completed onboarding
                  </p>
                </div>
                <Switch
                  checked={onboardingCompleted}
                  onCheckedChange={setOnboardingCompleted}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <Label className="text-base">Show on Leaderboard</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Whether to display this user on public leaderboards
                  </p>
                </div>
                <Switch
                  checked={leaderboardVisible}
                  onCheckedChange={setLeaderboardVisible}
                />
              </div>

              {leaderboardVisible && (
                <div className="space-y-2">
                  <Label htmlFor="leaderboardName">Leaderboard Display Name</Label>
                  <Input
                    id="leaderboardName"
                    value={leaderboardDisplayName}
                    onChange={(e) => setLeaderboardDisplayName(e.target.value)}
                    placeholder="Optional alias for leaderboard (uses first name if empty)"
                  />
                  <p className="text-xs text-muted-foreground">
                    For GDPR compliance, only this name and location will be shown publicly
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;