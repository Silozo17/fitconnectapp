import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, UserMinus, MapPin, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminView } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { FriendProfileSheet } from "./FriendProfileSheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";

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
      selected_avatar_slug?: string | null;
      selected_avatar_rarity?: string | null;
    };
  };
  currentUserId: string;
  onRemove: (id: string) => void;
}

export const ConnectionCard = ({ connection, currentUserId, onRemove }: ConnectionCardProps) => {
  const navigate = useNavigate();
  const { activeProfileType } = useAdminView();
  const [showProfile, setShowProfile] = useState(false);
  
  const profile = connection.profile;
  const displayName = profile?.display_name || 
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || 
    "Unknown User";
  const avatarUrl = profile?.avatar_url || profile?.profile_image_url;

  // Determine the friend's user_id (the other person in the connection)
  const friendUserId = connection.requester_user_id === currentUserId 
    ? connection.addressee_user_id 
    : connection.requester_user_id;

  const handleMessage = () => {
    const profileId = profile?.id;
    if (!profileId) {
      toast.error("Unable to start conversation");
      return;
    }
    const basePath = `/dashboard/${activeProfileType || "client"}`;
    navigate(`${basePath}/messages/${profileId}`);
  };

  return (
    <>
      <Card className="p-4 bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-4">
          <div 
            className="cursor-pointer pt-3"
            onClick={() => setShowProfile(true)}
          >
            <UserAvatar
              src={avatarUrl}
              avatarSlug={profile?.selected_avatar_slug}
              avatarRarity={profile?.selected_avatar_rarity as Rarity | undefined}
              name={displayName}
              variant="squircle"
              size="xs"
            />
          </div>
          
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setShowProfile(true)}
          >
            <h4 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
              {displayName}
            </h4>
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

      <FriendProfileSheet
        open={showProfile}
        onOpenChange={setShowProfile}
        connectionId={connection.id}
        friendUserId={friendUserId}
        friendProfileId={profile?.id}
        onRemove={onRemove}
      />
    </>
  );
};
