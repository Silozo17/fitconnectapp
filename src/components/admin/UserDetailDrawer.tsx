import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { 
  User, Heart, Target, MapPin, Calendar, Dumbbell,
  Save, Loader2, AlertTriangle, Apple, Activity
} from "lucide-react";

interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSaved?: () => void;
}

export function UserDetailDrawer({ open, onOpenChange, user, onSaved }: UserDetailDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const logAction = useLogAdminAction();

  // Fetch connected coaches
  const { data: connectedCoaches } = useQuery({
    queryKey: ["user-coaches", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_clients")
        .select("*, coach_profiles(display_name, profile_image_url)")
        .eq("client_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  // Fetch user's sessions
  const { data: sessions } = useQuery({
    queryKey: ["user-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*, coach_profiles(display_name)")
        .eq("client_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  // Fetch user's progress
  const { data: progress } = useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_progress")
        .select("*")
        .eq("client_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  // Initialize form data when user changes
  useState(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        age: user.age || "",
        gender_pronouns: user.gender_pronouns || "",
        city: user.city || "",
        county: user.county || "",
        country: user.country || "",
        weight_kg: user.weight_kg || "",
        height_cm: user.height_cm || "",
        medical_conditions: (user.medical_conditions || []).join(", "),
        allergies: (user.allergies || []).join(", "),
        dietary_restrictions: (user.dietary_restrictions || []).join(", "),
        fitness_goals: (user.fitness_goals || []).join(", "),
        leaderboard_visible: user.leaderboard_visible || false,
        leaderboard_display_name: user.leaderboard_display_name || "",
      });
    }
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updateData = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        age: formData.age ? Number(formData.age) : null,
        gender_pronouns: formData.gender_pronouns || null,
        city: formData.city || null,
        county: formData.county || null,
        country: formData.country || null,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        medical_conditions: formData.medical_conditions ? formData.medical_conditions.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        dietary_restrictions: formData.dietary_restrictions ? formData.dietary_restrictions.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        fitness_goals: formData.fitness_goals ? formData.fitness_goals.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        leaderboard_visible: formData.leaderboard_visible,
        leaderboard_display_name: formData.leaderboard_display_name || null,
      };

      const { error } = await supabase
        .from("client_profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      logAction.mutate({
        action: "UPDATE_USER",
        entityType: "client_profiles",
        entityId: user.id,
        oldValues: user,
        newValues: updateData,
      });

      toast.success("User profile updated");
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg">
                {user.first_name?.charAt(0) || user.last_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">
                {user.first_name || ""} {user.last_name || "Unnamed User"}
              </SheetTitle>
              <SheetDescription>
                {user.city && user.country ? `${user.city}, ${user.country}` : "No location set"}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                  {user.onboarding_completed ? "Active" : "Onboarding"}
                </Badge>
                {user.leaderboard_visible && (
                  <Badge variant="outline">Leaderboard</Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Dumbbell className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{connectedCoaches?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Coaches</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{sessions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{progress?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={formData.first_name || ""}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={formData.last_name || ""}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pronouns</Label>
                <Input
                  value={formData.gender_pronouns || ""}
                  onChange={(e) => setFormData({ ...formData, gender_pronouns: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Input
                    value={formData.county || ""}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" /> Fitness Goals
              </h4>
              <Textarea
                placeholder="Enter goals separated by commas"
                value={formData.fitness_goals || ""}
                onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="health" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight_kg || ""}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={formData.height_cm || ""}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Medical Conditions
              </h4>
              <Textarea
                placeholder="Enter conditions separated by commas"
                value={formData.medical_conditions || ""}
                onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Allergies
              </h4>
              <Textarea
                placeholder="Enter allergies separated by commas"
                value={formData.allergies || ""}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Apple className="h-4 w-4 text-green-500" /> Dietary Restrictions
              </h4>
              <Textarea
                placeholder="Enter restrictions separated by commas"
                value={formData.dietary_restrictions || ""}
                onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connected Coaches</CardTitle>
              </CardHeader>
              <CardContent>
                {connectedCoaches && connectedCoaches.length > 0 ? (
                  <div className="space-y-2">
                    {connectedCoaches.map((cc: any) => (
                      <div key={cc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={cc.coach_profiles?.profile_image_url} />
                            <AvatarFallback>{cc.coach_profiles?.display_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{cc.coach_profiles?.display_name}</span>
                        </div>
                        <Badge variant={cc.status === "active" ? "default" : "secondary"}>{cc.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No coaches connected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{session.coach_profiles?.display_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.scheduled_at), "MMM d, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                        <Badge variant={session.status === "completed" ? "default" : "outline"}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Leaderboard Visibility</Label>
                  <p className="text-sm text-muted-foreground">Show on public leaderboards</p>
                </div>
                <Switch
                  checked={formData.leaderboard_visible || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, leaderboard_visible: checked })}
                />
              </div>

              {formData.leaderboard_visible && (
                <div className="space-y-2">
                  <Label>Leaderboard Display Name</Label>
                  <Input
                    placeholder="Alias for leaderboard"
                    value={formData.leaderboard_display_name || ""}
                    onChange={(e) => setFormData({ ...formData, leaderboard_display_name: e.target.value })}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Account Info</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{user.user_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p>{format(new Date(user.created_at), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
