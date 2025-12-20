import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminView } from "@/contexts/AdminContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  UserMinus, 
  MapPin, 
  Zap, 
  Trophy,
  Target,
  Dumbbell,
  Flame
} from "lucide-react";
import { calculateLevelFromXP, getLevelTitle, RARITY_COLORS } from "@/hooks/useGamification";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { Rarity } from "@/lib/avatar-utils";

interface FriendProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  friendUserId: string;
  friendProfileId?: string;
  friendProfileType?: string;
  onRemove: (id: string) => void;
}

interface FriendProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string;
  avatar_url: string | null;
  location: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  fitness_goals: string[] | null;
  selected_avatar_id: string | null;
}

interface FriendAvatar {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  rarity: string;
}

interface FriendXP {
  total_xp: number;
  current_level: number;
}

interface FriendBadge {
  id: string;
  earned_at: string;
  badge: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
    description: string;
  };
}

interface FriendStats {
  workoutCount: number;
  habitStreak: number;
  progressEntries: number;
  badgesEarned: number;
}

export function FriendProfileSheet({
  open,
  onOpenChange,
  connectionId,
  friendUserId,
  friendProfileId,
  friendProfileType = "client",
  onRemove,
}: FriendProfileSheetProps) {
  const navigate = useNavigate();
  const { activeProfileType } = useAdminView();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [avatar, setAvatar] = useState<FriendAvatar | null>(null);
  const [xp, setXp] = useState<FriendXP | null>(null);
  const [badges, setBadges] = useState<FriendBadge[]>([]);
  const [stats, setStats] = useState<FriendStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && friendUserId) {
      fetchFriendData();
    }
  }, [open, friendUserId, friendProfileType]);

  const fetchFriendData = async () => {
    setIsLoading(true);
    try {
      let profileData: FriendProfile | null = null;

      if (friendProfileType === "coach") {
        // Fetch coach profile
        const { data: coachData } = await supabase
          .from("coach_profiles")
          .select("id, user_id, display_name, username, profile_image_url, location, location_city, location_country, selected_avatar_id")
          .eq("user_id", friendUserId)
          .single();

        if (coachData) {
          profileData = {
            id: coachData.id,
            first_name: null,
            last_name: null,
            username: coachData.username,
            avatar_url: coachData.profile_image_url,
            location: coachData.location,
            city: coachData.location_city,
            county: null,
            country: coachData.location_country,
            fitness_goals: null,
            selected_avatar_id: coachData.selected_avatar_id,
          };
        }
      } else if (friendProfileType === "admin") {
        // Fetch admin profile
        const { data: adminData } = await supabase
          .from("admin_profiles")
          .select("id, user_id, display_name, first_name, last_name, username, avatar_url")
          .eq("user_id", friendUserId)
          .single();

        if (adminData) {
          profileData = {
            id: adminData.id,
            first_name: adminData.first_name,
            last_name: adminData.last_name,
            username: adminData.username,
            avatar_url: adminData.avatar_url,
            location: null,
            city: null,
            county: null,
            country: null,
            fitness_goals: null,
            selected_avatar_id: null,
          };
        }
      } else {
        // Fetch client profile (default)
        const { data: clientData } = await supabase
          .from("client_profiles")
          .select("id, first_name, last_name, username, avatar_url, location, city, county, country, fitness_goals, selected_avatar_id")
          .eq("user_id", friendUserId)
          .single();

        profileData = clientData;
      }

      if (profileData) {
        setProfile(profileData);

        // Fetch custom avatar if selected
        if (profileData.selected_avatar_id) {
          const { data: avatarData } = await supabase
            .from("avatars")
            .select("id, name, slug, image_url, rarity")
            .eq("id", profileData.selected_avatar_id)
            .single();
          
          if (avatarData) {
            setAvatar(avatarData);
          }
        } else {
          setAvatar(null);
        }

        // Gamification data is only for clients
        if (friendProfileType === "client") {
          // Fetch XP data
          const { data: xpData } = await supabase
            .from("client_xp")
            .select("total_xp, current_level")
            .eq("client_id", profileData.id)
            .single();

          if (xpData) {
            setXp(xpData);
          } else {
            setXp(null);
          }

          // Fetch badges (up to 6)
          let badgeCount = 0;
          const { data: badgesData } = await supabase
            .from("client_badges")
            .select("id, earned_at, badge_id")
            .eq("client_id", profileData.id)
            .order("earned_at", { ascending: false })
            .limit(6);

          if (badgesData && badgesData.length > 0) {
            const badgeIds = badgesData.map(b => b.badge_id);
            const { data: badgeDetails } = await supabase
              .from("badges")
              .select("id, name, icon, rarity, description")
              .in("id", badgeIds);

            const enrichedBadges = badgesData.map(b => ({
              id: b.id,
              earned_at: b.earned_at,
              badge: badgeDetails?.find(bd => bd.id === b.badge_id) || null
            })).filter(b => b.badge);

            setBadges(enrichedBadges as FriendBadge[]);
            badgeCount = enrichedBadges.length;
          } else {
            setBadges([]);
          }

          // Fetch stats
          const { count: progressCount } = await supabase
            .from("client_progress")
            .select("id", { count: "exact", head: true })
            .eq("client_id", profileData.id);

          // Get habit streak from XP data level approximation
          const habitStreak = xpData?.current_level ? Math.floor(xpData.current_level * 0.5) : 0;

          setStats({
            workoutCount: 0,
            habitStreak: habitStreak,
            progressEntries: progressCount || 0,
            badgesEarned: badgeCount,
          });
        } else {
          // Clear gamification data for non-clients
          setXp(null);
          setBadges([]);
          setStats(null);
        }
      }
    } catch (error) {
      console.error("Error fetching friend data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    if (!friendProfileId) {
      toast.error("Unable to start conversation");
      return;
    }
    const basePath = `/dashboard/${activeProfileType || "client"}`;
    onOpenChange(false);
    navigate(`${basePath}/messages/${friendProfileId}`);
  };

  const handleRemove = () => {
    onRemove(connectionId);
    onOpenChange(false);
  };

  // For coaches, we need to get display_name from profile data differently
  const displayName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}`
    : profile?.username || "Friend";

  const locationDisplay = [profile?.city, profile?.county, profile?.country]
    .filter(Boolean)
    .join(", ") || profile?.location;

  const totalXP = xp?.total_xp || 0;
  const { level, xpInLevel, xpForNextLevel } = calculateLevelFromXP(totalXP);
  const progressPercent = (xpInLevel / xpForNextLevel) * 100;
  const levelTitle = getLevelTitle(level);

  const avatarRarity = avatar?.rarity || "common";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Friend Profile</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-6 mt-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center gap-3 mt-20">
              <UserAvatar
                src={profile.avatar_url}
                avatarSlug={avatar?.slug}
                avatarRarity={avatar?.rarity as Rarity}
                name={displayName}
                variant="squircle"
                size="lg"
                showRarityBorder
              />
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">{displayName}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>

              {locationDisplay && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{locationDisplay}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Level & XP */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 rounded-full p-2">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Level {level}</div>
                    <div className="text-xs text-muted-foreground">{levelTitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{totalXP.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={progressPercent} className="h-2 bg-muted" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{xpInLevel.toLocaleString()} XP</span>
                  <span>{xpForNextLevel.toLocaleString()} to Level {level + 1}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{stats.habitStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <Dumbbell className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{stats.progressEntries}</div>
                  <div className="text-xs text-muted-foreground">Check-ins</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{stats.badgesEarned}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{level}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
              </div>
            )}

            {/* Fitness Goals */}
            {profile.fitness_goals && profile.fitness_goals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Fitness Goals</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.fitness_goals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Badges/Achievements */}
            {badges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Recent Achievements</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((badgeItem) => {
                    const badgeRarity = badgeItem.badge?.rarity || "common";
                    const colors = RARITY_COLORS[badgeRarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
                    return (
                      <div 
                        key={badgeItem.id}
                        className="bg-card border rounded-lg p-2 text-center"
                        style={{ borderColor: colors.border }}
                        title={badgeItem.badge?.description}
                      >
                        <span className="text-2xl">{badgeItem.badge?.icon || "🏆"}</span>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {badgeItem.badge?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleMessage} 
                className="flex-1"
                disabled={!friendProfileId}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button 
                onClick={handleRemove} 
                variant="destructive"
                size="icon"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Unable to load profile
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
