import { useEffect, memo, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, UserPlus, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { triggerHaptic } from "@/lib/despia";

interface ConnectionRequest {
  id: string;
  client_id: string;
  coach_id: string;
  status: string;
  message: string | null;
  created_at: string;
  client_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    fitness_goals: string[] | null;
  } | null;
}

const ClientRequests = memo(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { clientLimit, activeClientCount, canAddClient, isApproachingLimit, currentTier } = useFeatureAccess();

  // Get coach profile ID
  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch pending connection requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ["connection-requests", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile?.id) return [];

      // First get connection requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      if (!requestsData || requestsData.length === 0) return [];

      // Get client profiles for these requests
      const clientIds = requestsData.map((r) => r.client_id);
      const { data: clientProfiles, error: clientsError } = await supabase
        .from("client_profiles")
        .select("id, first_name, last_name, fitness_goals")
        .in("id", clientIds);

      if (clientsError) throw clientsError;

      // Combine the data
      return requestsData.map((request) => ({
        ...request,
        client_profile: clientProfiles?.find((c) => c.id === request.client_id) || null,
      })) as ConnectionRequest[];
    },
    enabled: !!coachProfile?.id,
  });

  // Real-time subscription for new connection requests
  useEffect(() => {
    if (!coachProfile?.id) return;

    const channel = supabase
      .channel("connection-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connection_requests",
          filter: `coach_id=eq.${coachProfile.id}`,
        },
        (payload) => {
          triggerHaptic('heavy');
          toast.info("New connection request received!");
          queryClient.invalidateQueries({ queryKey: ["connection-requests", coachProfile.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connection_requests",
          filter: `coach_id=eq.${coachProfile.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["connection-requests", coachProfile.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "connection_requests",
          filter: `coach_id=eq.${coachProfile.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["connection-requests", coachProfile.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfile?.id, queryClient]);

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (request: ConnectionRequest) => {
      // Check client limit FIRST
      if (!canAddClient()) {
        throw new Error(`Client limit reached (${clientLimit} clients). Upgrade your plan to add more.`);
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("connection_requests")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Create coach_clients relationship
      const { error: insertError } = await supabase.from("coach_clients").insert({
        coach_id: request.coach_id,
        client_id: request.client_id,
        status: "active",
      });

      if (insertError) throw insertError;
      
      // Send email to coach about new client
      await supabase.functions.invoke("send-new-client-email", {
        body: { coachId: request.coach_id, clientId: request.client_id },
      }).catch((err) => console.error("Failed to send new client email:", err));
    },
    onSuccess: () => {
      toast.success("Connection request accepted! Client added to your roster.");
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept request. Please try again.");
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected", responded_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Connection request declined.");
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
    },
    onError: (error) => {
      toast.error("Failed to decline request. Please try again.");
    },
  });

  const getClientInitials = useCallback((profile: ConnectionRequest["client_profile"]) => {
    if (!profile) return "?";
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase() || "?";
  }, []);

  const getClientName = useCallback((profile: ConnectionRequest["client_profile"]) => {
    if (!profile) return "Unknown Client";
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
    return name || "Unknown Client";
  }, []);

  const atLimit = useMemo(() => !canAddClient(), [canAddClient]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Client Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Client Requests
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {clientLimit !== null && (
              <Badge variant={atLimit ? "destructive" : isApproachingLimit() ? "secondary" : "outline"}>
                {activeClientCount}/{clientLimit} clients
              </Badge>
            )}
            {requests && requests.length > 0 && (
              <Badge variant="secondary">{requests.length} pending</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Client limit warning */}
        {atLimit && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You've reached your client limit ({clientLimit} clients) on the {currentTier} plan.
              </span>
              <Link to="/subscribe">
                <Button size="sm" variant="outline" className="ml-2">
                  Upgrade
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {isApproachingLimit() && !atLimit && (
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between text-amber-600">
              <span>
                You're approaching your client limit ({activeClientCount}/{clientLimit}).
              </span>
              <Link to="/subscribe">
                <Button size="sm" variant="outline" className="ml-2">
                  Upgrade
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 animate-fade-in"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getClientInitials(request.client_profile)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {getClientName(request.client_profile)}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {request.client_profile?.fitness_goals &&
                    request.client_profile.fitness_goals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {request.client_profile.fitness_goals.slice(0, 3).map((goal) => (
                          <Badge key={goal} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {request.message && (
                    <div className="flex items-start gap-2 p-2 bg-background rounded-md mt-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={rejectMutation.isPending || acceptMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate(request)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending || atLimit}
                    title={atLimit ? "Client limit reached - upgrade to accept" : "Accept request"}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pending client requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              New requests from prospective clients will appear here instantly
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ClientRequests.displayName = "ClientRequests";

export default ClientRequests;
