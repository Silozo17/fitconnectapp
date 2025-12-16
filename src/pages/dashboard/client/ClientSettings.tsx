import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, LogOut } from "lucide-react";

interface ClientProfile {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender_pronouns: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_goals: string[] | null;
}

const ClientSettings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("client_profiles")
        .select("first_name, last_name, age, gender_pronouns, weight_kg, height_cm, fitness_goals")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("client_profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        gender_pronouns: profile.gender_pronouns,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const updateField = (field: keyof ClientProfile, value: string | number | null) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <ClientDashboardLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout
      title="Settings"
      description="Manage your account settings"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile?.first_name || ""}
                  onChange={(e) => updateField("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile?.last_name || ""}
                  onChange={(e) => updateField("last_name", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile?.age || ""}
                  onChange={(e) => updateField("age", parseInt(e.target.value) || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={profile?.gender_pronouns || ""}
                  onChange={(e) => updateField("gender_pronouns", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Body Metrics</CardTitle>
            <CardDescription>Your current measurements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile?.weight_kg || ""}
                  onChange={(e) => updateField("weight_kg", parseFloat(e.target.value) || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
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
        <Card>
          <CardHeader>
            <CardTitle>Fitness Goals</CardTitle>
            <CardDescription>Your current objectives</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.fitness_goals && profile.fitness_goals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.fitness_goals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No fitness goals set</p>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>

        <Separator />

        {/* Account Actions */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientSettings;
