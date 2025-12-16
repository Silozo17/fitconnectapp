import { useMessages, Conversation } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2, User, Briefcase, AlertCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import ProspectProfileSheet from "./ProspectProfileSheet";

interface ConversationListProps {
  activeConversationId?: string;
}

const ConversationList = ({ activeConversationId }: ConversationListProps) => {
  const { conversations, loading, error } = useMessages();
  const { role } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Conversation | null>(null);
  
  const basePath = role === "coach" ? "/dashboard/coach/messages" : "/dashboard/client/messages";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        <h3 className="font-medium text-foreground mb-1">Unable to load conversations</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-foreground mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          {role === "coach" 
            ? "Start a conversation with one of your clients"
            : "Message a coach to get started"}
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
              {/* Clickable Avatar for Profile View */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProfile(conversation);
                }}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                title="View profile"
              >
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={conversation.participantAvatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(conversation.participantName)}
                  </AvatarFallback>
                </Avatar>
              </button>
              
              {/* Clickable Content for Chat */}
              <Link
                to={`${basePath}/${conversation.participantId}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {conversation.participantName}
                    </span>
                    <span className="text-muted-foreground">
                      {getTypeIcon(conversation.participantType)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
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

      {/* Profile Preview Sheet - Enhanced for Coaches */}
      {role === "coach" && selectedProfile?.participantType === "client" ? (
        <ProspectProfileSheet
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          clientProfileId={selectedProfile?.participantId || null}
          participantName={selectedProfile?.participantName || ''}
          participantAvatar={selectedProfile?.participantAvatar}
        />
      ) : (
        <ProspectProfileSheet
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          clientProfileId={selectedProfile?.participantId || null}
          participantName={selectedProfile?.participantName || ''}
          participantAvatar={selectedProfile?.participantAvatar}
        />
      )}
    </>
  );
};

export default ConversationList;
