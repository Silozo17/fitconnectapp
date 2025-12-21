import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Star, Calendar, ExternalLink, Award, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { getBadgeIcon } from "@/lib/badge-icons";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { RARITY_ORDER } from "@/hooks/useGamification";

interface CoachProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachProfileId: string | null;
  participantName: string;
  participantAvatar?: string;
}

export const CoachProfileSheet = ({
  open,
  onOpenChange,
  coachProfileId,
  participantName,
  participantAvatar,
}: CoachProfileSheetProps) => {
  const linkPrefix = useCoachLinkPrefix();
  
  // Fetch coach profile data with all related info in parallel
  const { data, isLoading } = useQuery({
    queryKey: ['coach-profile-sheet', coachProfileId],
    queryFn: async () => {
      if (!coachProfileId) return null;

        const [profileResult, reviewsResult, badgesResult] = await Promise.all([
        supabase
          .from('coach_profiles')
          .select(`
            *,
            avatars:selected_avatar_id(slug, rarity, image_url),
            username
          `)
          .eq('id', coachProfileId)
          .single(),
        supabase
          .from('reviews')
          .select('rating')
          .eq('coach_id', coachProfileId),
        supabase
          .from('coach_badges')
          .select('*, badge:badges(name, icon, description, rarity, image_url)')
          .eq('coach_id', coachProfileId)
          .limit(4)
      ]);

      const profile = profileResult.data;
      const reviews = reviewsResult.data || [];
      const badges = badgesResult.data || [];

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return {
        profile,
        avgRating,
        reviewCount: reviews.length,
        badges
      };
    },
    enabled: !!coachProfileId && open,
    staleTime: 30000, // Cache for 30 seconds
  });

  const profile = data?.profile;
  const fullName = profile?.display_name || participantName;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Coach Profile</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profile ? (
          <div className="space-y-6 mt-6">
            {/* Profile Header - Centered Layout */}
            <div className="flex flex-col items-center text-center mt-20">
              <UserAvatar
                src={profile.profile_image_url || participantAvatar}
                avatarSlug={profile.avatars?.slug}
                avatarRarity={profile.avatars?.rarity as Rarity}
                name={fullName}
                variant="squircle"
                size="lg"
                showRarityBorder
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">{fullName}</h3>
                {profile.location && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </p>
                )}
                {data?.reviewCount > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{data.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({data.reviewCount} review{data.reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Badge */}
            {profile.is_verified && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Award className="h-3 w-3 mr-1" />
                Verified Coach
              </Badge>
            )}

            <Separator />

            {/* Specialties */}
            {profile.coach_types && profile.coach_types.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.coach_types.map((type: string) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">About</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Experience & Rate */}
            <div className="grid grid-cols-2 gap-4">
              {profile.experience_years && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-medium">{profile.experience_years} years</p>
                </div>
              )}
              {profile.hourly_rate && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="text-sm font-medium">
                    {profile.currency === 'GBP' ? '£' : profile.currency === 'EUR' ? '€' : '$'}
                    {profile.hourly_rate}
                  </p>
                </div>
              )}
            </div>

            {/* Badges */}
            {data?.badges && data.badges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Achievements
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[...data.badges]
                    .sort((a: any, b: any) => {
                      const rarityA = RARITY_ORDER[a.badge?.rarity || 'common'] || 0;
                      const rarityB = RARITY_ORDER[b.badge?.rarity || 'common'] || 0;
                      return rarityA - rarityB;
                    })
                    .map((badge: any) => {
                    const BadgeIcon = getBadgeIcon(badge.badge?.icon || 'Trophy');
                    return (
                      <div key={badge.id} className="flex flex-col items-center text-center">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {badge.badge?.image_url ? (
                            <img 
                              src={badge.badge.image_url} 
                              alt={badge.badge?.name}
                              className="h-12 w-12 object-contain"
                            />
                          ) : (
                            <BadgeIcon className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {badge.badge?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link to={`${linkPrefix}/${profile.username || coachProfileId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to={`${linkPrefix}/${profile.username || coachProfileId}?book=true`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Session
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Profile not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
