import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  conversationPartnerId: string;
  currentUserId: string;
}

const TypingIndicator = ({ conversationPartnerId, currentUserId }: TypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const channel = supabase.channel(`typing:${conversationPartnerId}:${currentUserId}`);

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId === conversationPartnerId) {
          setIsTyping(true);
          // Auto-hide after 3 seconds
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationPartnerId, currentUserId]);

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-muted-foreground">typing...</span>
    </div>
  );
};

// Hook to broadcast typing status
export const useTypingBroadcast = (currentUserId: string, partnerId: string) => {
  const [lastTypingTime, setLastTypingTime] = useState(0);

  const broadcastTyping = async () => {
    const now = Date.now();
    // Only broadcast every 2 seconds to avoid spam
    if (now - lastTypingTime < 2000) return;
    
    setLastTypingTime(now);
    
    const channel = supabase.channel(`typing:${currentUserId}:${partnerId}`);
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    });
  };

  return { broadcastTyping };
};

export default TypingIndicator;
