import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  participantId: string;
  participantName: string;
  participantType: "client" | "coach";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = (participantId?: string) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Get current user's profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;

      const table = role === "coach" ? "coach_profiles" : "client_profiles";
      const { data } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCurrentProfileId(data.id);
      }
    };

    fetchProfileId();
  }, [user, role]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!currentProfileId) return;

    setLoading(true);
    
    // Fetch all messages involving current user
    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentProfileId},receiver_id.eq.${currentProfileId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      return;
    }

    // Group by conversation partner
    const conversationMap = new Map<string, Message[]>();
    
    messagesData?.forEach((msg) => {
      const partnerId = msg.sender_id === currentProfileId ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, []);
      }
      conversationMap.get(partnerId)!.push(msg);
    });

    // Build conversation list with partner details
    const conversationList: Conversation[] = [];
    
    for (const [partnerId, msgs] of conversationMap) {
      // Try to get coach profile first
      let partnerData = await supabase
        .from("coach_profiles")
        .select("display_name")
        .eq("id", partnerId)
        .single();

      let participantName = "Unknown";
      let participantType: "client" | "coach" = "coach";

      if (partnerData.data?.display_name) {
        participantName = partnerData.data.display_name;
      } else {
        // Try client profile
        const clientData = await supabase
          .from("client_profiles")
          .select("first_name, last_name")
          .eq("id", partnerId)
          .single();

        if (clientData.data) {
          participantName = `${clientData.data.first_name || ""} ${clientData.data.last_name || ""}`.trim() || "Client";
          participantType = "client";
        }
      }

      const lastMsg = msgs[0];
      const unreadCount = msgs.filter(
        (m) => m.receiver_id === currentProfileId && !m.read_at
      ).length;

      conversationList.push({
        participantId: partnerId,
        participantName,
        participantType,
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.created_at,
        unreadCount,
      });
    }

    setConversations(conversationList);
    setLoading(false);
  }, [currentProfileId]);

  // Fetch messages for specific conversation
  const fetchMessages = useCallback(async () => {
    if (!currentProfileId || !participantId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentProfileId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${currentProfileId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);

    // Mark received messages as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", participantId)
      .eq("receiver_id", currentProfileId)
      .is("read_at", null);
  }, [currentProfileId, participantId]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!currentProfileId || !participantId || !content.trim()) return false;

    const { error } = await supabase.from("messages").insert({
      sender_id: currentProfileId,
      receiver_id: participantId,
      content: content.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      return false;
    }

    return true;
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!currentProfileId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Check if message involves current user
          if (
            newMessage.sender_id === currentProfileId ||
            newMessage.receiver_id === currentProfileId
          ) {
            // Update messages if in active conversation
            if (
              participantId &&
              (newMessage.sender_id === participantId ||
                newMessage.receiver_id === participantId)
            ) {
              setMessages((prev) => [...prev, newMessage]);
            }
            
            // Refresh conversations list
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, participantId, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    if (participantId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [participantId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    currentProfileId,
    refetch: participantId ? fetchMessages : fetchConversations,
  };
};
