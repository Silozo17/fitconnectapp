import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  participantId: string;
  participantName: string;
  participantType: "client" | "coach" | "admin";
  participantAvatar: string | null;
  participantLocation?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = (participantId?: string) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current user's profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        console.log("[useMessages] No user found, skipping profile fetch");
        setLoading(false);
        return;
      }

      console.log("[useMessages] Fetching profile ID for user:", user.id, "role:", role);
      
      // Handle admin role - they may not have a profile in client/coach tables
      if (role === "admin" || role === "manager" || role === "staff") {
        console.log("[useMessages] Admin user detected, checking admin_profiles");
        const { data: adminData, error: adminError } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (adminData) {
          console.log("[useMessages] Admin profile found:", adminData.id);
          setCurrentProfileId(adminData.id);
          return;
        }
        
        if (adminError) {
          console.warn("[useMessages] No admin profile found:", adminError.message);
        }
      }

      const table = role === "coach" ? "coach_profiles" : "client_profiles";
      console.log("[useMessages] Querying table:", table);
      
      const { data, error: profileError } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("[useMessages] Error fetching profile:", profileError);
        setError(`Failed to load profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("[useMessages] Profile ID found:", data.id);
        setCurrentProfileId(data.id);
      } else {
        console.warn("[useMessages] No profile found for user");
        setError("No profile found. Please complete onboarding.");
        setLoading(false);
      }
    };

    fetchProfileId();
  }, [user, role]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!currentProfileId) {
      console.log("[useMessages] No profile ID, skipping conversation fetch");
      return;
    }

    console.log("[useMessages] Fetching conversations for profile:", currentProfileId);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all messages involving current user
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentProfileId},receiver_id.eq.${currentProfileId}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("[useMessages] Error fetching messages:", messagesError);
        setError(`Failed to load conversations: ${messagesError.message}`);
        setLoading(false);
        return;
      }

      console.log("[useMessages] Fetched messages count:", messagesData?.length || 0);

      if (!messagesData || messagesData.length === 0) {
        console.log("[useMessages] No messages found");
        setConversations([]);
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const conversationMap = new Map<string, Message[]>();
      
      messagesData.forEach((msg) => {
        const partnerId = msg.sender_id === currentProfileId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      console.log("[useMessages] Unique conversation partners:", conversationMap.size);

      // Build conversation list with partner details
      const conversationList: Conversation[] = [];
      
      for (const [partnerId, msgs] of conversationMap) {
        let participantName = "Unknown";
        let participantType: "client" | "coach" | "admin" = "client";
        let participantAvatar: string | null = null;
        let participantLocation: string | null = null;

        // Try to get coach profile first
        const { data: coachData } = await supabase
          .from("coach_profiles")
          .select("display_name, profile_image_url, location")
          .eq("id", partnerId)
          .single();

        if (coachData?.display_name) {
          participantName = coachData.display_name;
          participantType = "coach";
          participantAvatar = coachData.profile_image_url;
          participantLocation = coachData.location;
          console.log("[useMessages] Found coach partner:", participantName);
        } else {
          // Try client profile
          const { data: clientData } = await supabase
            .from("client_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", partnerId)
            .single();

          if (clientData) {
            participantName = `${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client";
            participantType = "client";
            participantAvatar = clientData.avatar_url;
            console.log("[useMessages] Found client partner:", participantName);
          } else {
            // Try admin profile
            const { data: adminData } = await supabase
              .from("admin_profiles")
              .select("display_name, first_name, last_name, avatar_url")
              .eq("id", partnerId)
              .single();

            if (adminData) {
              participantName = adminData.display_name || 
                `${adminData.first_name || ""} ${adminData.last_name || ""}`.trim() || "Admin";
              participantType = "admin";
              participantAvatar = adminData.avatar_url;
              console.log("[useMessages] Found admin partner:", participantName);
            } else {
              console.warn("[useMessages] Could not find partner profile for ID:", partnerId);
            }
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
          participantAvatar,
          participantLocation,
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.created_at,
          unreadCount,
        });
      }

      // Sort by last message time (most recent first)
      conversationList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log("[useMessages] Final conversation count:", conversationList.length);
      setConversations(conversationList);
    } catch (err) {
      console.error("[useMessages] Unexpected error in fetchConversations:", err);
      setError("An unexpected error occurred while loading conversations");
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  // Fetch messages for specific conversation
  const fetchMessages = useCallback(async () => {
    if (!currentProfileId || !participantId) {
      console.log("[useMessages] Missing IDs for message fetch - profileId:", currentProfileId, "participantId:", participantId);
      return;
    }

    console.log("[useMessages] Fetching messages between", currentProfileId, "and", participantId);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentProfileId},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${currentProfileId})`
        )
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("[useMessages] Error fetching messages:", fetchError);
        setError(`Failed to load messages: ${fetchError.message}`);
        return;
      }

      console.log("[useMessages] Fetched message count:", data?.length || 0);
      setMessages(data || []);

      // Mark received messages as read
      const { error: updateError } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", participantId)
        .eq("receiver_id", currentProfileId)
        .is("read_at", null);

      if (updateError) {
        console.warn("[useMessages] Error marking messages as read:", updateError);
      }
    } catch (err) {
      console.error("[useMessages] Unexpected error in fetchMessages:", err);
      setError("An unexpected error occurred while loading messages");
    } finally {
      setLoading(false);
    }
  }, [currentProfileId, participantId]);

  // Send message with optimistic update
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!currentProfileId) {
      console.error("[useMessages] Cannot send message - no profile ID");
      toast({
        title: "Error",
        description: "Your profile could not be loaded. Please refresh the page.",
        variant: "destructive",
      });
      return false;
    }

    if (!participantId) {
      console.error("[useMessages] Cannot send message - no participant ID");
      toast({
        title: "Error",
        description: "No recipient selected.",
        variant: "destructive",
      });
      return false;
    }

    if (!content.trim()) {
      console.warn("[useMessages] Cannot send empty message");
      return false;
    }

    console.log("[useMessages] Sending message to:", participantId);

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentProfileId,
      receiver_id: participantId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data, error: sendError } = await supabase
        .from("messages")
        .insert({
          sender_id: currentProfileId,
          receiver_id: participantId,
          content: content.trim(),
        })
        .select()
        .single();

      if (sendError) {
        console.error("[useMessages] Error sending message:", sendError);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        toast({
          title: "Failed to send message",
          description: sendError.message,
          variant: "destructive",
        });
        return false;
      }

      console.log("[useMessages] Message sent successfully:", data?.id);
      
      // Replace optimistic message with real one
      setMessages((prev) => 
        prev.map((m) => m.id === optimisticMessage.id ? data : m)
      );
      
      return true;
    } catch (err) {
      console.error("[useMessages] Unexpected error sending message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      toast({
        title: "Failed to send message",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set up realtime subscription with unique channel per user
  useEffect(() => {
    if (!currentProfileId) {
      console.log("[useMessages] No profile ID, skipping realtime subscription");
      return;
    }

    console.log("[useMessages] Setting up realtime subscription for profile:", currentProfileId);

    // Create unique channel for this user's messages
    const channelName = `user-messages-${currentProfileId}-${participantId || 'all'}`;
    
    const channel = supabase
      .channel(channelName)
      // Listen for messages received by current user
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log("[useMessages] Realtime: Received message:", newMessage.id, "from:", newMessage.sender_id);
          
          // If viewing a specific conversation, check if message is from that participant
          if (participantId) {
            if (newMessage.sender_id === participantId) {
              console.log("[useMessages] Realtime: Adding received message to active conversation");
              setMessages((prev) => {
                // Check for duplicates
                if (prev.some(m => m.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
              
              // Mark as read since we're viewing this conversation
              supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMessage.id)
                .then(() => console.log("[useMessages] Marked message as read"));
            }
          }
          
          // Always refresh conversations list for unread counts
          fetchConversations();
        }
      )
      // Listen for messages sent by current user (for confirmation)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log("[useMessages] Realtime: Sent message confirmed:", newMessage.id);
          
          // Replace optimistic message with real one if in active conversation
          if (participantId && newMessage.receiver_id === participantId) {
            setMessages((prev) => {
              // Find and replace temp message
              const tempIndex = prev.findIndex(m => 
                m.id.startsWith('temp-') && 
                m.content === newMessage.content && 
                m.sender_id === newMessage.sender_id
              );
              
              if (tempIndex >= 0) {
                const updated = [...prev];
                updated[tempIndex] = newMessage;
                return updated;
              }
              
              // If no temp message found, check for duplicate
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              
              // Add the message if not found
              return [...prev, newMessage];
            });
          }
          
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      // Listen for read receipt updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          console.log("[useMessages] Realtime: Message updated (read receipt):", updatedMessage.id);
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe((status) => {
        console.log("[useMessages] Realtime subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("[useMessages] Successfully subscribed to channel:", channelName);
        }
      });

    return () => {
      console.log("[useMessages] Cleaning up realtime subscription:", channelName);
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, participantId, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    if (!currentProfileId) return;
    
    if (participantId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [participantId, currentProfileId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    currentProfileId,
    refetch: participantId ? fetchMessages : fetchConversations,
  };
};
