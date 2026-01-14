import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Calendar, 
  QrCode, 
  MessageSquare, 
  CreditCard,
  ChevronRight,
  Users,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface GymMembership {
  id: string;
  status: string;
  joined_at: string;
  current_period_start: string;
  current_period_end: string | null;
  gym: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    city: string | null;
  };
  plan: {
    id: string;
    name: string;
    billing_interval: string | null;
  } | null;
}

export default function MyGyms() {
  const { user } = useAuth();

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["my-gym-memberships", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("gym_members")
        .select(`
          id,
          status,
          joined_at,
          current_period_start,
          current_period_end,
          gym:gym_id (
            id,
            name,
            slug,
            logo_url,
            city
          ),
          plan:plan_id (
            id,
            name,
            billing_interval
          )
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data as unknown as GymMembership[];
    },
    enabled: !!user?.id,
  });

  const activeMemberships = memberships?.filter(m => m.status === "active") || [];
  const inactiveMemberships = memberships?.filter(m => m.status !== "active") || [];

  return (
    <ClientDashboardLayout 
      title="My Gyms" 
      description="Manage your gym memberships"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Gyms</h1>
            <p className="text-muted-foreground">
              View and manage your gym memberships, book classes, and more.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/client/find-coaches">
              <Building2 className="mr-2 h-4 w-4" />
              Find New Gyms
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        )}

        {/* Active Memberships */}
        {!isLoading && activeMemberships.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Active Memberships ({activeMemberships.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeMemberships.map(membership => (
                <GymMembershipCard key={membership.id} membership={membership} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Memberships */}
        {!isLoading && inactiveMemberships.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground">
              Past Memberships
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {inactiveMemberships.map(membership => (
                <GymMembershipCard key={membership.id} membership={membership} inactive />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && memberships?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Gym Memberships</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                You haven't joined any gyms yet. Find a gym near you to get started.
              </p>
              <Button asChild>
                <Link to="/dashboard/client/find-coaches">
                  Browse Gyms
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientDashboardLayout>
  );
}

function GymMembershipCard({ 
  membership, 
  inactive = false 
}: { 
  membership: GymMembership; 
  inactive?: boolean;
}) {
  const gym = membership.gym;
  
  return (
    <Card className={inactive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={gym.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{gym.name}</CardTitle>
            <CardDescription>
              {gym.city && <span>{gym.city}</span>}
            </CardDescription>
          </div>
          <Badge 
            variant={membership.status === "active" ? "default" : "secondary"}
            className="capitalize"
          >
            {membership.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Info */}
        {membership.plan && (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{membership.plan.name}</p>
                {membership.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Renews: {format(new Date(membership.current_period_end), "MMM d, yyyy")}
                  </p>
                )}
              </div>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!inactive && (
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/gym-portal/${gym.id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Book Class
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/gym-portal/${gym.id}?tab=checkin`}>
                <QrCode className="mr-2 h-4 w-4" />
                Check-In
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/gym-portal/${gym.id}?tab=messages`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/gym-portal/${gym.id}?tab=membership`}>
                <FileText className="mr-2 h-4 w-4" />
                Contracts
              </Link>
            </Button>
          </div>
        )}

        {/* View Portal Link */}
        <Button asChild variant="ghost" className="w-full justify-between">
          <Link to={`/gym-portal/${gym.id}`}>
            View Full Portal
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
