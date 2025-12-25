import { Check, X, Loader2, UserPlus, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useConnections } from "@/hooks/useConnections";
import { useCelebration } from "@/contexts/CelebrationContext";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const UserConnectionRequests = () => {
  const { pendingRequests, acceptRequest, rejectRequest, loading } = useConnections();
  const { showFirstTimeAchievement } = useCelebration();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    await acceptRequest(id, () => showFirstTimeAchievement('first_connection'));
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectRequest(id);
    setProcessingId(null);
  };

  const getInitials = (profile: any) => {
    if (!profile) return "?";
    const first = profile.first_name?.[0] || profile.display_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const getName = (profile: any) => {
    if (!profile) return "Unknown User";
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.first_name || profile.display_name || profile.username || "Unknown User";
  };

  const getUsername = (profile: any) => {
    return profile?.username ? `@${profile.username}` : null;
  };

  const getLocation = (profile: any) => {
    return profile?.location || null;
  };

  const getAvatarUrl = (profile: any) => {
    return profile?.avatar_url || profile?.profile_image_url || null;
  };

  if (loading) {
    return (
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <UserPlus className="h-5 w-5 text-primary" />
            Friend Requests
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

  // Show empty state if there are no pending requests
  if (pendingRequests.length === 0) {
    return (
      <Card variant="elevated" className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display">
            <UserPlus className="h-5 w-5 text-primary" />
            Friend Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
              <UserPlus className="h-7 w-7 opacity-50" />
            </div>
            <p className="text-sm">No pending friend requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <UserPlus className="h-5 w-5 text-primary" />
            Friend Requests
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </CardTitle>
          <Badge className="bg-primary/15 text-primary border-primary/20 rounded-full px-3">
            {pendingRequests.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 animate-fade-in hover:bg-secondary/50 transition-colors"
            >
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage src={getAvatarUrl(request.profile)} className="rounded-xl" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-xl">
                  {getInitials(request.profile)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-foreground">
                    {getName(request.profile)}
                  </h4>
                  {getUsername(request.profile) && (
                    <span className="text-sm text-muted-foreground">
                      {getUsername(request.profile)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </span>
                </div>

                {getLocation(request.profile) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{getLocation(request.profile)}</span>
                  </div>
                )}

                {request.message && (
                  <div className="flex items-start gap-2 p-3 bg-background rounded-xl mt-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                  className="rounded-xl"
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept(request.id)}
                  disabled={processingId === request.id}
                  className="rounded-xl"
                >
                  {processingId === request.id ? (
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
      </CardContent>
    </Card>
  );
};

export default UserConnectionRequests;
