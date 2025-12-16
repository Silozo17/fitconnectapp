import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2, User, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ConversationListProps {
  activeConversationId?: string;
}

const ConversationList = ({ activeConversationId }: ConversationListProps) => {
  const { conversations, loading } = useMessages();
  const { role } = useAuth();
  
  const basePath = role === "coach" ? "/dashboard/coach/messages" : "/dashboard/client/messages";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <Link
          key={conversation.participantId}
          to={`${basePath}/${conversation.participantId}`}
          className={`block p-4 hover:bg-muted/50 transition-colors ${
            activeConversationId === conversation.participantId ? "bg-muted" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {conversation.participantType === "coach" ? (
                <Briefcase className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground truncate">
                  {conversation.participantName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>
            </div>

            {conversation.unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                {conversation.unreadCount}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ConversationList;
