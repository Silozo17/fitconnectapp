import { useState, useRef, useEffect } from "react";
import { useMessages } from "@/hooks/useMessages";
import { format } from "date-fns";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ChatQuickActions from "./ChatQuickActions";

interface ChatWindowProps {
  participantId: string;
  participantName?: string;
}

const ChatWindow = ({ participantId, participantName }: ChatWindowProps) => {
  const { messages, loading, sendMessage, currentProfileId } = useMessages(participantId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role } = useAuth();

  const basePath = role === "coach" ? "/dashboard/coach/messages" : "/dashboard/client/messages";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Link to={basePath} className="lg:hidden">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold">
            {participantName?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{participantName || "Conversation"}</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentProfileId;
            return (
              <div
                key={message.id}
                className={cn("flex", isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {format(new Date(message.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (for coaches) */}
      <ChatQuickActions 
        coachId={participantId} 
        onSendMessage={async (msg) => {
          const success = await sendMessage(msg);
          return success;
        }}
      />

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
