import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
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
  const { activeProfileId, activeProfileType } = useAdminView();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current user's profile ID - prioritize activeProfileId from AdminContext
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // If we have an active profile from AdminContext (view switching), use it
      if (activeProfileId) {
        setCurrentProfileId(activeProfileId);
        return;
      }

      // Fall back to role-based lookup for users without view switching
      if (role === "admin" || role === "manager" || role === "staff") {
        const { data: adminData, error: adminError } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (adminData) {
          setCurrentProfileId(adminData.id);
          return;
        }
        
        if (adminError) {
          console.warn("[useMessages] No admin profile found:", adminError.message);
        }
      }

      const table = role === "coach" ? "coach_profiles" : "client_profiles";
      
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
        setCurrentProfileId(data.id);
      } else {
        setError("No profile found. Please complete onboarding.");
        setLoading(false);
      }
    };

    fetchProfileId();
  }, [user, role, activeProfileId]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!currentProfileId) {
      return;
    }

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

      if (!messagesData || messagesData.length === 0) {
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

      setConversations(conversationList);
    } catch (err) {
      console.error("[useMessages] Unexpected error in fetchConversations:", err);
      setError("An unexpected error occurred while loading conversations");
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  // Soft refresh conversations - for new conversations only (no loading state)
  const softRefreshConversations = useCallback(async () => {
    if (!currentProfileId) return;
    
    // Don't set loading to true - this is a background refresh
    try {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentProfileId},receiver_id.eq.${currentProfileId}`)
        .order("created_at", { ascending: false });

      if (!messagesData || messagesData.length === 0) return;

      const conversationMap = new Map<string, Message[]>();
      messagesData.forEach((msg) => {
        const partnerId = msg.sender_id === currentProfileId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      const conversationList: Conversation[] = [];
      
      for (const [partnerId, msgs] of conversationMap) {
        let participantName = "Unknown";
        let participantType: "client" | "coach" | "admin" = "client";
        let participantAvatar: string | null = null;
        let participantLocation: string | null = null;

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
        } else {
          const { data: clientData } = await supabase
            .from("client_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", partnerId)
            .single();

          if (clientData) {
            participantName = `${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client";
            participantType = "client";
            participantAvatar = clientData.avatar_url;
          } else {
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

      conversationList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(conversationList);
    } catch (err) {
      console.error("[useMessages] Soft refresh error:", err);
    }
  }, [currentProfileId]);

  const fetchMessages = useCallback(async () => {
    if (!currentProfileId || !participantId) {
      return;
    }

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
      toast({
        title: "Error",
        description: "Your profile could not be loaded. Please refresh the page.",
        variant: "destructive",
      });
      return false;
    }

    if (!participantId) {
      toast({
        title: "Error",
        description: "No recipient selected.",
        variant: "destructive",
      });
      return false;
    }

    if (!content.trim()) {
      return false;
    }

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

  // Set up realtime subscription - simplified with wildcard event and manual filtering
  useEffect(() => {
    if (!currentProfileId) {
      return;
    }

    const channelName = `messages-${currentProfileId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as Message;
            
            // Check if this message involves current user
            const isReceived = newMessage.receiver_id === currentProfileId;
            const isSent = newMessage.sender_id === currentProfileId;
            
            if (!isReceived && !isSent) {
              return;
            }
            
            // If viewing a specific conversation
            if (participantId) {
              const isInConversation = 
                (newMessage.sender_id === participantId && newMessage.receiver_id === currentProfileId) ||
                (newMessage.sender_id === currentProfileId && newMessage.receiver_id === participantId);
              
              if (isInConversation) {
                // Only add if not already in messages (avoid duplicates from optimistic update)
                setMessages((prev) => {
                  const exists = prev.some(m => m.id === newMessage.id);
                  if (exists) return prev;
                  return [...prev, newMessage];
                });
                
                // Mark as read if received
                if (isReceived) {
                  supabase
                    .from("messages")
                    .update({ read_at: new Date().toISOString() })
                    .eq("id", newMessage.id)
                    .then();
                }
              }
            }
            
            // Refresh conversations for any new message
            softRefreshConversations();
          }
          
          if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as Message;
            
            // Check if this message involves current user
            const isReceived = updatedMessage.receiver_id === currentProfileId;
            const isSent = updatedMessage.sender_id === currentProfileId;
            
            if (!isReceived && !isSent) {
              return; // Not relevant to current user
            }
            
            // If viewing a specific conversation, check if message belongs to it
            if (participantId) {
              const isInConversation = 
                (updatedMessage.sender_id === participantId && updatedMessage.receiver_id === currentProfileId) ||
                (updatedMessage.sender_id === currentProfileId && updatedMessage.receiver_id === participantId);
              
              if (isInConversation) {
                // Update the message in state (this includes read_at changes)
                setMessages((prev) =>
                  prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
                );
              }
            }
            
            // Refresh conversations to update read status in conversation list
            softRefreshConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, participantId, softRefreshConversations]);

  // Auto-fetch conversations when profile ID is available
  useEffect(() => {
    if (currentProfileId && !participantId) {
      fetchConversations();
    }
  }, [currentProfileId, participantId, fetchConversations]);

  // Auto-fetch messages when viewing a conversation
  useEffect(() => {
    if (currentProfileId && participantId) {
      fetchMessages();
    }
  }, [currentProfileId, participantId, fetchMessages]);

  return {
    messages,
    conversations,
    loading,
    error,
    currentProfileId,
    sendMessage,
    fetchMessages,
    fetchConversations,
    softRefreshConversations,
  };
};

// Hook to start a new conversation
export const useStartConversation = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const startConversation = async (
    recipientId: string,
    initialMessage: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages.",
        variant: "destructive",
      });
      return false;
    }

    setSending(true);

    try {
      // Get current user's profile ID
      const table = role === "coach" ? "coach_profiles" : 
                    (role === "admin" || role === "manager" || role === "staff") ? "admin_profiles" : 
                    "client_profiles";
      
      const { data: profile, error: profileError } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "Could not find your profile.",
          variant: "destructive",
        });
        return false;
      }

      // Send the initial message
      const { error: sendError } = await supabase.from("messages").insert({
        sender_id: profile.id,
        receiver_id: recipientId,
        content: initialMessage.trim(),
      });

      if (sendError) {
        console.error("[useStartConversation] Error:", sendError);
        toast({
          title: "Failed to send message",
          description: sendError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Message sent",
        description: "Your conversation has been started.",
      });
      
      return true;
    } catch (err) {
      console.error("[useStartConversation] Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  return { startConversation, sending };
};
