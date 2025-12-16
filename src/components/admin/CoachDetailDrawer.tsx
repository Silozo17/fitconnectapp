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
import { 
  Users, Calendar, Package, CreditCard, Star, 
  Gift, Ban, RefreshCw, DollarSign, CheckCircle 
} from "lucide-react";

interface CoachDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: any;
  onAssignFreePlan: () => void;
}

export function CoachDetailDrawer({ open, onOpenChange, coach, onAssignFreePlan }: CoachDetailDrawerProps) {
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
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
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
    </Sheet>
  );
}