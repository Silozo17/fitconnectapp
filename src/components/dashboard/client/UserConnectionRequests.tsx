import { Check, X, Loader2, UserPlus, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useConnections } from "@/hooks/useConnections";
import { useCelebration } from "@/contexts/CelebrationContext";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserConnectionRequestsProps {
  className?: string;
}

const UserConnectionRequests = ({ className }: UserConnectionRequestsProps) => {
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
      <div className={cn("relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Show empty state if there are no pending requests
  if (pendingRequests.length === 0) {
    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
        
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
            <UserPlus className="h-7 w-7 opacity-50" />
          </div>
          <p className="text-sm">No pending friend requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-5 border border-border/50", className)}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />
      
      <div className="flex items-center justify-end mb-4">
        <Badge className="bg-primary/15 text-primary border-primary/20 rounded-full px-3">
          {pendingRequests.length} pending
        </Badge>
      </div>
      
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 animate-fade-in hover:bg-background/80 transition-colors"
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
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl mt-2">
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
    </div>
  );
};

export default UserConnectionRequests;
