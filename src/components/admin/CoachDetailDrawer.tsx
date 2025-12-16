import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUserAvatars, useUserSelectedAvatar, useRevokeAvatar, useAllAvatars } from "@/hooks/useAdminAvatars";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { RARITY_CONFIG } from "@/lib/avatar-config";
import { GrantAvatarModal } from "./GrantAvatarModal";
import { LockedAvatarsSection } from "./LockedAvatarsSection";
import { 
  Users, Calendar, Package, CreditCard, Star, 
  Gift, Ban, RefreshCw, DollarSign, CheckCircle,
  Trophy, Trash2, Image, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: any;
  onAssignFreePlan: () => void;
}

export function CoachDetailDrawer({ open, onOpenChange, coach, onAssignFreePlan }: CoachDetailDrawerProps) {
  const [grantModalOpen, setGrantModalOpen] = useState(false);

  // Fetch coach avatars
  const { data: coachAvatars, isLoading: avatarsLoading } = useUserAvatars(coach?.user_id);
  const { data: selectedAvatarData } = useUserSelectedAvatar(coach?.user_id, 'coach');
  const { data: allAvatars } = useAllAvatars();
  const revokeAvatar = useRevokeAvatar();
  
  const unlockedAvatarIds = useMemo(() => {
    return new Set(coachAvatars?.map(ua => ua.avatar_id) || []);
  }, [coachAvatars]);

  const totalAvatarCount = allAvatars?.length || 0;
  // Fetch coach's clients
  const { data: clients } = useQuery({
    queryKey: ["coach-clients", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_clients")
        .select("*, client_profiles(first_name, last_name)")
        .eq("coach_id", coach.id);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // Fetch coach's packages
  const { data: packages } = useQuery({
    queryKey: ["coach-packages", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_packages")
        .select("*")
        .eq("coach_id", coach.id);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // Fetch coach's subscription plans
  const { data: subscriptionPlans } = useQuery({
    queryKey: ["coach-subscription-plans", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_subscription_plans")
        .select("*")
        .eq("coach_id", coach.id);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // Fetch coach's sessions
  const { data: sessions } = useQuery({
    queryKey: ["coach-sessions", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("*")
        .eq("coach_id", coach.id)
        .order("scheduled_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // Fetch coach's reviews
  const { data: reviews } = useQuery({
    queryKey: ["coach-reviews-admin", coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("coach_id", coach.id);
      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  // Fetch granted subscription
  const { data: grantedSub } = useQuery({
    queryKey: ["coach-granted-sub", coach?.id],
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
    enabled: !!coach?.id,
  });

  if (!coach) return null;

  const averageRating = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const tierColors: Record<string, string> = {
    free: "bg-gray-500/10 text-gray-500",
    starter: "bg-blue-500/10 text-blue-500",
    pro: "bg-purple-500/10 text-purple-500",
    enterprise: "bg-amber-500/10 text-amber-500",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coach.profile_image_url} />
              <AvatarFallback className="text-lg">
                {coach.display_name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">{coach.display_name || "Unknown Coach"}</SheetTitle>
              <SheetDescription>{coach.location || "No location set"}</SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={tierColors[coach.subscription_tier] || tierColors.free}>
                  {coach.subscription_tier || "Free"}
                </Badge>
                {grantedSub && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <Gift className="h-3 w-3 mr-1" />
                    Gifted
                  </Badge>
                )}
                {coach.stripe_connect_onboarded && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Stripe Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{clients?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Clients</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{sessions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{packages?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Packages</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{averageRating || "-"}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Admin Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start" onClick={onAssignFreePlan}>
              <Gift className="h-4 w-4 mr-2" />
              {grantedSub ? "Change Plan" : "Give Free Plan"}
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Stripe
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <DollarSign className="h-4 w-4 mr-2" />
              View Earnings
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Detailed Tabs */}
        <Tabs defaultValue="clients" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="avatars">Avatars</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-4 space-y-2">
            {clients && clients.length > 0 ? (
              clients.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {client.client_profiles?.first_name} {client.client_profiles?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Since {format(new Date(client.created_at), "MMM yyyy")}
                    </p>
                  </div>
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No clients yet</p>
            )}
          </TabsContent>

          <TabsContent value="packages" className="mt-4 space-y-2">
            {packages && packages.length > 0 ? (
              packages.map((pkg: any) => (
                <div key={pkg.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{pkg.name}</p>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pkg.session_count} sessions • £{pkg.price}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No packages created</p>
            )}

            {subscriptionPlans && subscriptionPlans.length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-sm font-medium">Subscription Plans</p>
                {subscriptionPlans.map((plan: any) => (
                  <div key={plan.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{plan.name}</p>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      £{plan.price}/{plan.billing_period}
                    </p>
                  </div>
                ))}
              </>
            )}
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
                    <div className="h-16 w-16 rounded-lg bg-muted/50 overflow-hidden">
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
                  <Trophy className="h-4 w-4 text-amber-500" /> Unlocked ({coachAvatars?.length || 0}/{totalAvatarCount})
                </CardTitle>
                <Button size="sm" onClick={() => setGrantModalOpen(true)}>
                  <Gift className="h-4 w-4 mr-1" /> Grant Multiple
                </Button>
              </CardHeader>
              <CardContent>
                {avatarsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : coachAvatars && coachAvatars.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {coachAvatars.map((ua) => {
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
                          <div className="aspect-square rounded-md overflow-hidden mb-1 bg-background">
                            <img
                              src={getAvatarImageUrl(ua.avatar.slug)}
                              alt={ua.avatar.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[10px] font-medium truncate">{ua.avatar.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className={cn("text-[8px]", rarityConfig?.color)}>
                              {ua.avatar.rarity}
                            </Badge>
                            {canRevoke && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-destructive hover:text-destructive"
                                onClick={() => revokeAvatar.mutate({
                                  userAvatarId: ua.id,
                                  userId: coach.user_id,
                                  avatarName: ua.avatar.name,
                                })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No avatars unlocked</p>
                )}
              </CardContent>
            </Card>

            {/* Locked Avatars */}
            <LockedAvatarsSection 
              userId={coach?.user_id || ""} 
              unlockedAvatarIds={unlockedAvatarIds} 
            />
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-2">
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <div key={review.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-3 w-3 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">{review.review_text || "No text"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No reviews yet</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Account Info */}
        <Separator className="my-6" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Account Info</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p>{format(new Date(coach.created_at), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Hourly Rate</p>
              <p>£{coach.hourly_rate || 0}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Experience</p>
              <p>{coach.experience_years || 0} years</p>
            </div>
            <div>
              <p className="text-muted-foreground">Onboarding</p>
              <p className="flex items-center gap-1">
                {coach.onboarding_completed ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Complete
                  </>
                ) : (
                  "Incomplete"
                )}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Grant Avatar Modal */}
      <GrantAvatarModal
        open={grantModalOpen}
        onOpenChange={setGrantModalOpen}
        userId={coach?.user_id || ""}
        userName={coach?.display_name || "Coach"}
        unlockedAvatarIds={unlockedAvatarIds}
      />
    </Sheet>
  );
}