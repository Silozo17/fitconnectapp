import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, Settings, Calendar } from "lucide-react";

interface GymInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
}

interface GymAffiliation {
  id: string;
  gym_id: string;
  role: string;
  gym: GymInfo;
}

interface GymMembershipData {
  id: string;
  gym_id: string;
  status: string;
  gym: GymInfo;
}

async function fetchStaffGyms(userId: string): Promise<GymAffiliation[]> {
  // Use any to bypass deep type instantiation issues with large schema
  const client = supabase as any;
  
  // First get staff records
  const { data: staffData, error: staffError } = await client
    .from("gym_staff")
    .select("id, gym_id, role")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (staffError) throw staffError;
  if (!staffData || staffData.length === 0) return [];

  // Then get gym details for each
  const gymIds = staffData.map((s: any) => s.gym_id);
  const { data: gymData, error: gymError } = await client
    .from("gym_profiles")
    .select("id, name, slug, logo_url, city")
    .in("id", gymIds);

  if (gymError) throw gymError;

  const gymMap = new Map((gymData || []).map((g: any) => [g.id, g as GymInfo]));
  
  return staffData
    .map((staff: any) => ({
      id: staff.id,
      gym_id: staff.gym_id,
      role: staff.role,
      gym: gymMap.get(staff.gym_id)!
    }))
    .filter((s: GymAffiliation) => s.gym);
}

async function fetchMemberGyms(userId: string): Promise<GymMembershipData[]> {
  // Use any to bypass deep type instantiation issues with large schema
  const client = supabase as any;
  
  // First get member records
  const { data: memberData, error: memberError } = await client
    .from("gym_members")
    .select("id, gym_id, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (memberError) throw memberError;
  if (!memberData || memberData.length === 0) return [];

  // Then get gym details for each
  const gymIds = memberData.map((m: any) => m.gym_id);
  const { data: gymData, error: gymError } = await client
    .from("gym_profiles")
    .select("id, name, slug, logo_url, city")
    .in("id", gymIds);

  if (gymError) throw gymError;

  const gymMap = new Map((gymData || []).map((g: any) => [g.id, g as GymInfo]));
  
  return memberData
    .map((member: any) => ({
      id: member.id,
      gym_id: member.gym_id,
      status: member.status,
      gym: gymMap.get(member.gym_id)!
    }))
    .filter((m: GymMembershipData) => m.gym);
}

export function MyGymsWidget() {
  const { user } = useAuth();

  const { data: staffGyms, isLoading: loadingStaff } = useQuery({
    queryKey: ["my-staff-gyms", user?.id],
    queryFn: () => fetchStaffGyms(user!.id),
    enabled: !!user,
  });

  const { data: memberGyms, isLoading: loadingMember } = useQuery({
    queryKey: ["my-member-gyms", user?.id],
    queryFn: () => fetchMemberGyms(user!.id),
    enabled: !!user,
  });

  const isLoading = loadingStaff || loadingMember;
  const hasGyms = (staffGyms?.length || 0) > 0 || (memberGyms?.length || 0) > 0;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "manager":
        return "secondary";
      case "coach":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            My Gyms
          </CardTitle>
          <CardDescription>Gyms you manage or are a member of</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/gym/register">
            <Plus className="h-4 w-4 mr-1" />
            Add Gym
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!hasGyms ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              You're not affiliated with any gyms yet
            </p>
            <Button asChild>
              <Link to="/gym/register">
                <Plus className="h-4 w-4 mr-2" />
                Register Your Gym
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Staff/Owner Gyms */}
            {staffGyms?.map((affiliation) => (
              <div
                key={affiliation.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {affiliation.gym?.logo_url ? (
                      <img
                        src={affiliation.gym.logo_url}
                        alt={affiliation.gym.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{affiliation.gym?.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(affiliation.role)} className="text-xs">
                        {affiliation.role}
                      </Badge>
                      {affiliation.gym?.city && (
                        <span className="text-xs text-muted-foreground">
                          {affiliation.gym.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/gym/${affiliation.gym?.slug}/admin`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {/* Member Gyms */}
            {memberGyms?.map((membership) => (
              <div
                key={membership.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    {membership.gym?.logo_url ? (
                      <img
                        src={membership.gym.logo_url}
                        alt={membership.gym.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{membership.gym?.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Member
                      </Badge>
                      {membership.gym?.city && (
                        <span className="text-xs text-muted-foreground">
                          {membership.gym.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/gym/${membership.gym?.slug}/classes`}>
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
