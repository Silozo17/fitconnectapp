import { useState, useEffect, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { useAdminUserStats } from "@/hooks/useAdminUserStats";
import { useUserAvatars, useUserSelectedAvatar, useRevokeAvatar } from "@/hooks/useAdminAvatars";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { RARITY_CONFIG } from "@/lib/avatar-config";
import { GrantAvatarModal } from "./GrantAvatarModal";
import { 
  User, Heart, Target, MapPin, Calendar, Dumbbell,
  Save, Loader2, AlertTriangle, Apple, Activity,
  Trophy, Zap, Flame, Award, Star, TrendingUp, Gift, Trash2, Image
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSaved?: () => void;
}

const rarityColors: Record<string, string> = {
  common: "border-muted-foreground/30",
  uncommon: "border-green-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-amber-500",
};

const sourceLabels: Record<string, string> = {
  workout_logged: "Workout",
  badge_earned: "Badge",
  challenge_completed: "Challenge",
  habit_streak: "Habit Streak",
  progress_logged: "Progress",
  session_completed: "Session",
};

export function UserDetailDrawer({ open, onOpenChange, user, onSaved }: UserDetailDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const logAction = useLogAdminAction();

  // Fetch gamification stats
  const { data: stats, isLoading: statsLoading } = useAdminUserStats(user?.id);
  
  // Fetch user avatars
  const { data: userAvatars, isLoading: avatarsLoading } = useUserAvatars(user?.user_id);
  const { data: selectedAvatarData } = useUserSelectedAvatar(user?.user_id, 'client');
  const revokeAvatar = useRevokeAvatar();
  
  const unlockedAvatarIds = useMemo(() => {
    return new Set(userAvatars?.map(ua => ua.avatar_id) || []);
  }, [userAvatars]);

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
  useEffect(() => {
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
  }, [user]);

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

  const xpProgress = stats?.xp ? Math.min((stats.xp.total % (stats.xp.level * 100)) / (stats.xp.level * 100) * 100, 100) : 0;

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
                {stats && stats.xp.level > 1 && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" /> Level {stats.xp.level}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Stats - Enhanced with gamification */}
        <div className="grid grid-cols-6 gap-2 mt-6">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Dumbbell className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{connectedCoaches?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Coaches</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Calendar className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-bold">{sessions?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Zap className="h-3 w-3 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{stats?.xp.level || 1}</p>
            <p className="text-[10px] text-muted-foreground">Level</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Trophy className="h-3 w-3 mx-auto mb-1 text-amber-500" />
            <p className="text-sm font-bold">{stats?.badges.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Flame className="h-3 w-3 mx-auto mb-1 text-orange-500" />
            <p className="text-sm font-bold">{stats?.habitStreak.current || 0}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Target className="h-3 w-3 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-bold">{stats?.challenges.completed || 0}</p>
            <p className="text-[10px] text-muted-foreground">Challenges</p>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="gamification">Stats</TabsTrigger>
            <TabsTrigger value="avatars">Avatars</TabsTrigger>
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

          {/* New Gamification Tab */}
          <TabsContent value="gamification" className="mt-4 space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : stats ? (
              <>
                {/* XP & Level Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> XP & Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">Level {stats.xp.level}</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.xp.total.toLocaleString()} XP total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Rank #{stats.leaderboardRank}</p>
                        <p className="text-xs text-muted-foreground">
                          of {stats.totalUsers} users
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to next level</span>
                        <span>{Math.round(xpProgress)}%</span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Badges Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" /> Badges Earned ({stats.badges.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.badges.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {stats.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex flex-col items-center p-2 rounded-lg border-2 bg-muted/30 ${rarityColors[badge.rarity] || rarityColors.common}`}
                            title={`${badge.name} - Earned ${format(new Date(badge.earnedAt), "MMM d, yyyy")}`}
                          >
                            <span className="text-2xl">{badge.icon}</span>
                            <span className="text-[10px] text-center mt-1 line-clamp-1">{badge.name}</span>
                            {badge.isFeatured && (
                              <Star className="h-3 w-3 text-amber-500 mt-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Challenges & Habits */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" /> Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-500">{stats.challenges.active}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">{stats.challenges.completed}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      {stats.challenges.recent.length > 0 && (
                        <div className="space-y-1">
                          {stats.challenges.recent.slice(0, 3).map((c) => (
                            <div key={c.id} className="flex items-center justify-between text-xs p-1.5 bg-muted/50 rounded">
                              <span className="truncate flex-1">{c.title}</span>
                              <Badge variant={c.status === "completed" ? "default" : "secondary"} className="text-[10px] ml-2">
                                {c.status === "completed" ? "Done" : `${c.progress}/${c.target}`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" /> Habit Streaks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-orange-500">{stats.habitStreak.current}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Current Streak</p>
                            <p className="text-xs text-muted-foreground">days</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="font-bold">{stats.habitStreak.longest}</p>
                            <p className="text-[10px] text-muted-foreground">Best Streak</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="font-bold">{stats.habitStreak.totalCompletions}</p>
                            <p className="text-[10px] text-muted-foreground">Total Done</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent XP Activity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" /> Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivity.length > 0 ? (
                      <div className="space-y-2">
                        {stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-green-500 border-green-500/50">
                                +{activity.amount} XP
                              </Badge>
                              <span className="text-muted-foreground">
                                {sourceLabels[activity.source] || activity.source}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No gamification data available</p>
            )}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {progress && progress.length > 0 ? (
                  <div className="space-y-2">
                    {progress.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {p.weight_kg && `${p.weight_kg}kg`}
                            {p.body_fat_percentage && ` • ${p.body_fat_percentage}% BF`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(p.recorded_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        {p.photo_urls?.length > 0 && (
                          <Badge variant="outline">{p.photo_urls.length} photos</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No progress logged yet</p>
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

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="mt-4 space-y-4">
            {/* Selected Avatar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" /> Selected Avatar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAvatarData?.avatar ? (
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted/50 overflow-hidden">
                      <img
                        src={getAvatarImageUrl(selectedAvatarData.avatar.slug)}
                        alt={selectedAvatarData.avatar.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{selectedAvatarData.avatar.name}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1",
                          RARITY_CONFIG[selectedAvatarData.avatar.rarity as keyof typeof RARITY_CONFIG]?.color
                        )}
                      >
                        {selectedAvatarData.avatar.rarity}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No avatar selected</p>
                )}
              </CardContent>
            </Card>

            {/* Unlocked Avatars */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Unlocked Avatars ({userAvatars?.length || 0})
                </CardTitle>
                <Button size="sm" onClick={() => setGrantModalOpen(true)}>
                  <Gift className="h-4 w-4 mr-1" /> Grant
                </Button>
              </CardHeader>
              <CardContent>
                {avatarsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : userAvatars && userAvatars.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {userAvatars.map((ua) => {
                      const rarityConfig = RARITY_CONFIG[ua.avatar.rarity as keyof typeof RARITY_CONFIG];
                      const isSelected = selectedAvatarData?.selected_avatar_id === ua.avatar_id;
                      const canRevoke = ua.unlock_source === 'admin_grant';

                      return (
                        <div
                          key={ua.id}
                          className={cn(
                            "relative p-2 rounded-lg border-2 bg-muted/30",
                            isSelected ? "border-primary" : rarityConfig?.border || "border-muted"
                          )}
                        >
                          {isSelected && (
                            <Badge className="absolute -top-2 -right-2 text-[10px]">Active</Badge>
                          )}
                          <div className="aspect-square rounded-md overflow-hidden mb-2 bg-background">
                            <img
                              src={getAvatarImageUrl(ua.avatar.slug)}
                              alt={ua.avatar.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs font-medium truncate">{ua.avatar.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className={cn("text-[10px]", rarityConfig?.color)}>
                              {ua.avatar.rarity}
                            </Badge>
                            {canRevoke && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-destructive hover:text-destructive"
                                onClick={() => revokeAvatar.mutate({
                                  userAvatarId: ua.id,
                                  userId: user.user_id,
                                  avatarName: ua.avatar.name,
                                })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {ua.unlock_source === 'admin_grant' ? 'Admin granted' : 
                             ua.unlock_source === 'default' ? 'Free' :
                             ua.unlock_source === 'stat_unlock' ? 'Stat unlock' : ua.unlock_source}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No avatars unlocked yet</p>
                )}
              </CardContent>
            </Card>
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

      {/* Grant Avatar Modal */}
      <GrantAvatarModal
        open={grantModalOpen}
        onOpenChange={setGrantModalOpen}
        userId={user?.user_id || ""}
        userName={`${user?.first_name || ""} ${user?.last_name || "User"}`}
        unlockedAvatarIds={unlockedAvatarIds}
      />
    </Sheet>
  );
}