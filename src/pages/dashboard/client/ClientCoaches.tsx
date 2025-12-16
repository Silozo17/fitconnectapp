import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, UserPlus, Loader2 } from "lucide-react";

interface CoachConnection {
  id: string;
  status: string;
  start_date: string | null;
  coach: {
    id: string;
    display_name: string | null;
    profile_image_url: string | null;
    coach_types: string[] | null;
    bio: string | null;
  };
}

const ClientCoaches = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<CoachConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      if (!user) return;

      // Get client profile first
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch connected coaches
      const { data } = await supabase
        .from("coach_clients")
        .select(`
          id,
          status,
          start_date,
          coach:coach_profiles!coach_clients_coach_id_fkey (
            id,
            display_name,
            profile_image_url,
            coach_types,
            bio
          )
        `)
        .eq("client_id", profile.id)
        .eq("status", "active");

      setCoaches((data as unknown as CoachConnection[]) || []);
      setLoading(false);
    };

    fetchCoaches();
  }, [user]);

  return (
    <ClientDashboardLayout
      title="My Coaches"
      description="View and manage your coaching connections"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Coaches</h1>
          <p className="text-muted-foreground">
            {coaches.length} active connection{coaches.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link to="/coaches">
            <UserPlus className="w-4 h-4 mr-2" />
            Find More Coaches
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : coaches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No coaches yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse our marketplace to find a coach that fits your goals.
            </p>
            <Button asChild>
              <Link to="/coaches">Browse Coaches</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coaches.map((connection) => (
            <Card key={connection.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={connection.coach.profile_image_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {connection.coach.display_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {connection.coach.display_name || "Coach"}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {connection.coach.coach_types?.slice(0, 2).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    {connection.coach.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {connection.coach.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/dashboard/client/messages/${connection.coach.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/dashboard/client/sessions">
                      <Calendar className="w-4 h-4 mr-2" />
                      Sessions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientCoaches;
