import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, MapPin, AtSign, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingRequestCardProps {
  request: {
    id: string;
    message: string | null;
    created_at: string;
    profile?: {
      first_name?: string | null;
      last_name?: string | null;
      display_name?: string | null;
      username?: string | null;
      avatar_url?: string | null;
      profile_image_url?: string | null;
      location?: string | null;
    };
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  type: "incoming" | "sent";
  onCancel?: (id: string) => void;
}

export const PendingRequestCard = ({
  request,
  onAccept,
  onReject,
  type,
  onCancel,
}: PendingRequestCardProps) => {
  const profile = request.profile;
  const displayName =
    profile?.display_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "Unknown User";
  const avatarUrl = profile?.avatar_url || profile?.profile_image_url;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card variant="glass" className="p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{displayName}</h4>
          {profile?.username && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <AtSign className="w-3 h-3" />
              <span>{profile.username}</span>
            </div>
          )}
          {profile?.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {request.message && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{request.message}"
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-2">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {type === "incoming" ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept(request.id)}
                className="gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Accept</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(request.id)}
                className="gap-1.5"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Decline</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(request.id)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
