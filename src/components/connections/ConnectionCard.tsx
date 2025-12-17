import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserMinus, MapPin, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ConnectionCardProps {
  connection: {
    id: string;
    requester_user_id: string;
    addressee_user_id: string;
    profile?: {
      id?: string;
      first_name?: string | null;
      last_name?: string | null;
      display_name?: string | null;
      username?: string | null;
      avatar_url?: string | null;
      profile_image_url?: string | null;
      location?: string | null;
    };
  };
  onRemove: (id: string) => void;
}

export const ConnectionCard = ({ connection, onRemove }: ConnectionCardProps) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const profile = connection.profile;
  const displayName = profile?.display_name || 
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || 
    "Unknown User";
  const avatarUrl = profile?.avatar_url || profile?.profile_image_url;
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleMessage = () => {
    const profileId = profile?.id;
    if (!profileId) {
      toast.error("Unable to start conversation");
      return;
    }
    const basePath = role === "coach" ? "/dashboard/coach" : "/dashboard/client";
    navigate(`${basePath}/messages/${profileId}`);
  };

  return (
    <Card className="p-4 bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4">
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMessage}
            className="gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Message</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(connection.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
