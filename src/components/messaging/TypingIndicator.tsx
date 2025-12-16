import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingIndicatorProps {
  conversationPartnerId: string;
  currentUserId: string;
}

// Generate a consistent channel name by sorting IDs
const getTypingChannelName = (userId1: string, userId2: string) => {
  return `typing:${[userId1, userId2].sort().join("-")}`;
};

const TypingIndicator = ({ conversationPartnerId, currentUserId }: TypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const channelName = getTypingChannelName(currentUserId, conversationPartnerId);
    console.log("[TypingIndicator] Subscribing to channel:", channelName);
    
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        console.log("[TypingIndicator] Received typing event:", payload);
        // Only show typing if it's from the conversation partner
        if (payload.payload?.userId === conversationPartnerId) {
          setIsTyping(true);
          
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Auto-hide after 3 seconds
          timeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      })
      .subscribe((status) => {
        console.log("[TypingIndicator] Subscription status:", status);
      });

    return () => {
      console.log("[TypingIndicator] Cleaning up channel:", channelName);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

// Hook to broadcast typing status - uses same channel naming convention
export const useTypingBroadcast = (currentUserId: string, partnerId: string) => {
  const lastTypingTimeRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Create and subscribe to the channel once
    const channelName = getTypingChannelName(currentUserId, partnerId);
    console.log("[useTypingBroadcast] Creating channel:", channelName);
    
    channelRef.current = supabase.channel(channelName);
    channelRef.current.subscribe((status) => {
      console.log("[useTypingBroadcast] Channel status:", status);
    });

    return () => {
      if (channelRef.current) {
        console.log("[useTypingBroadcast] Cleaning up channel");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, partnerId]);

  const broadcastTyping = async () => {
    const now = Date.now();
    // Only broadcast every 2 seconds to avoid spam
    if (now - lastTypingTimeRef.current < 2000) return;
    
    lastTypingTimeRef.current = now;
    
    if (channelRef.current) {
      console.log("[useTypingBroadcast] Broadcasting typing event for user:", currentUserId);
      await channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId },
      });
    }
  };

  return { broadcastTyping };
};

export default TypingIndicator;
