import { useMessages, Conversation } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2, User, Briefcase, AlertCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminView } from "@/contexts/AdminContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProspectProfileSheet from "./ProspectProfileSheet";
import { CoachProfileSheet } from "./CoachProfileSheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";

interface ConversationListProps {
  activeConversationId?: string;
}

const ConversationList = ({ activeConversationId }: ConversationListProps) => {
  const { t } = useTranslation('messaging');
  const { conversations, loading, error } = useMessages();
  const { activeProfileType } = useAdminView();
  const [selectedProfile, setSelectedProfile] = useState<Conversation | null>(null);
  
  const basePath = activeProfileType === "admin" 
    ? "/dashboard/admin/messages" 
    : activeProfileType === "coach" 
      ? "/dashboard/coach/messages" 
      : "/dashboard/client/messages";

  const getTypeIcon = (type: "client" | "coach" | "admin") => {
    switch (type) {
      case "coach":
        return <Briefcase className="w-3 h-3" />;
      case "admin":
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="font-medium text-foreground mb-1">{t('conversationList.unableToLoad')}</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-1">{t('noConversations')}</h3>
        <p className="text-sm text-muted-foreground">
          {activeProfileType === "coach" 
            ? t('conversationList.coachEmptyState')
            : t('conversationList.clientEmptyState')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <div
            key={conversation.participantId}
            className={`block p-4 hover:bg-muted/50 transition-colors ${
              activeConversationId === conversation.participantId ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Clickable Avatar for Profile View - now uses UserAvatar with character avatar support */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProfile(conversation);
                }}
                className="flex-shrink-0 hover:opacity-80 transition-opacity pt-3"
                title="View profile"
              >
                <UserAvatar
                  src={conversation.participantAvatar}
                  avatarSlug={conversation.participantAvatarSlug}
                  avatarRarity={conversation.participantAvatarRarity as Rarity | undefined}
                  name={conversation.participantName}
                  variant="squircle"
                  size="xs"
                />
              </button>
              
              {/* Clickable Content for Chat */}
              <Link
                to={`${basePath}/${conversation.participantId}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium text-foreground truncate">
                      {conversation.participantName}
                    </span>
                    <span className="text-muted-foreground">
                      {getTypeIcon(conversation.participantType)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </Link>

              {conversation.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Preview Sheet - Role-aware */}
      {activeProfileType === "coach" && selectedProfile?.participantType === "client" ? (
        // Coach viewing client - show ProspectProfileSheet
        <ProspectProfileSheet
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          clientProfileId={selectedProfile?.participantId || null}
          participantName={selectedProfile?.participantName || ''}
          participantAvatar={selectedProfile?.participantAvatar}
        />
      ) : selectedProfile?.participantType === "coach" ? (
        // Client/Admin viewing coach - show CoachProfileSheet
        <CoachProfileSheet
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          coachProfileId={selectedProfile?.participantId || null}
          participantName={selectedProfile?.participantName || ''}
          participantAvatar={selectedProfile?.participantAvatar}
        />
      ) : selectedProfile ? (
        // Fallback for other cases (viewing admin, etc.)
        <ProspectProfileSheet
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          clientProfileId={selectedProfile?.participantId || null}
          participantName={selectedProfile?.participantName || ''}
          participantAvatar={selectedProfile?.participantAvatar}
        />
      ) : null}
    </>
  );
};

export default ConversationList;
