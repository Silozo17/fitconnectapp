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
  // Avatar data for character avatars
  participantAvatarSlug?: string | null;
  participantAvatarRarity?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ProfileData {
  id: string;
  name: string;
  type: "client" | "coach" | "admin";
  avatar: string | null;
  location?: string | null;
  avatarSlug?: string | null;
  avatarRarity?: string | null;
}

// Batch fetch profiles by IDs - single function to reduce N+1 queries
async function batchFetchProfiles(partnerIds: string[]): Promise<Map<string, ProfileData>> {
  const profileMap = new Map<string, ProfileData>();
  
  if (partnerIds.length === 0) return profileMap;

  // Fetch all profile types in parallel
  const [coachResult, clientResult, adminResult] = await Promise.all([
    supabase
      .from("coach_profiles")
      .select("id, display_name, profile_image_url, location, avatars:selected_avatar_id(slug, rarity)")
      .in("id", partnerIds),
    supabase
      .from("client_profiles")
      .select("id, first_name, last_name, avatar_url, avatars:selected_avatar_id(slug, rarity)")
      .in("id", partnerIds),
    supabase
      .from("admin_profiles")
      .select("id, display_name, first_name, last_name, avatar_url")
      .in("id", partnerIds),
  ]);

  // Process coach profiles
  coachResult.data?.forEach((coach) => {
    if (coach.display_name) {
      const avatarData = coach.avatars as { slug: string; rarity: string } | null;
      profileMap.set(coach.id, {
        id: coach.id,
        name: coach.display_name,
        type: "coach",
        avatar: coach.profile_image_url,
        location: coach.location,
        avatarSlug: avatarData?.slug || null,
        avatarRarity: avatarData?.rarity || null,
      });
    }
  });

  // Process client profiles (only if not already found as coach)
  clientResult.data?.forEach((client) => {
    if (!profileMap.has(client.id)) {
      const avatarData = client.avatars as { slug: string; rarity: string } | null;
      profileMap.set(client.id, {
        id: client.id,
        name: `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client",
        type: "client",
        avatar: client.avatar_url,
        avatarSlug: avatarData?.slug || null,
        avatarRarity: avatarData?.rarity || null,
      });
    }
  });

  // Process admin profiles (only if not already found)
  adminResult.data?.forEach((admin) => {
    if (!profileMap.has(admin.id)) {
      profileMap.set(admin.id, {
        id: admin.id,
        name: admin.display_name || `${admin.first_name || ""} ${admin.last_name || ""}`.trim() || "Admin",
        type: "admin",
        avatar: admin.avatar_url,
      });
    }
  });

  return profileMap;
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

  // Fetch conversations with batched profile lookups
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

      // Batch fetch all partner profiles at once
      const partnerIds = Array.from(conversationMap.keys());
      const profileMap = await batchFetchProfiles(partnerIds);

      // Build conversation list with partner details
      const conversationList: Conversation[] = [];
      
      for (const [partnerId, msgs] of conversationMap) {
        const profile = profileMap.get(partnerId);
        
        const lastMsg = msgs[0];
        const unreadCount = msgs.filter(
          (m) => m.receiver_id === currentProfileId && !m.read_at
        ).length;

        conversationList.push({
          participantId: partnerId,
          participantName: profile?.name || "Deleted User",
          participantType: profile?.type || "client",
          participantAvatar: profile?.avatar || null,
          participantLocation: profile?.location || null,
          participantAvatarSlug: profile?.avatarSlug || null,
          participantAvatarRarity: profile?.avatarRarity || null,
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

      // Batch fetch all partner profiles at once
      const partnerIds = Array.from(conversationMap.keys());
      const profileMap = await batchFetchProfiles(partnerIds);

      const conversationList: Conversation[] = [];
      
      for (const [partnerId, msgs] of conversationMap) {
        const profile = profileMap.get(partnerId);
        
        const lastMsg = msgs[0];
        const unreadCount = msgs.filter(
          (m) => m.receiver_id === currentProfileId && !m.read_at
        ).length;

        conversationList.push({
          participantId: partnerId,
          participantName: profile?.name || "Deleted User",
          participantType: profile?.type || "client",
          participantAvatar: profile?.avatar || null,
          participantLocation: profile?.location || null,
          participantAvatarSlug: profile?.avatarSlug || null,
          participantAvatarRarity: profile?.avatarRarity || null,
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
      
      // Send message notification email (fire and forget)
      if (data?.id) {
        supabase.functions.invoke("send-message-notification", {
          body: { messageId: data.id },
        }).catch((err) => console.error("Failed to send message notification:", err));
      }
      
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

  // Set up realtime subscription
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
                // Check if message already exists (from optimistic update)
                setMessages((prev) => {
                  const exists = prev.some(
                    (m) => m.id === newMessage.id || 
                    (m.id.startsWith("temp-") && 
                     m.content === newMessage.content && 
                     m.sender_id === newMessage.sender_id)
                  );
                  if (exists) {
                    // Replace temp message with real one
                    return prev.map((m) => 
                      m.id.startsWith("temp-") && 
                      m.content === newMessage.content && 
                      m.sender_id === newMessage.sender_id
                        ? newMessage
                        : m
                    );
                  }
                  return [...prev, newMessage];
                });
                
                // Mark as read if we received it
                if (isReceived) {
                  supabase
                    .from("messages")
                    .update({ read_at: new Date().toISOString() })
                    .eq("id", newMessage.id)
                    .then();
                }
              }
            }
            
            // Refresh conversation list
            softRefreshConversations();
          }
          
          if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as Message;
            
            // Update message in list if it's in the current conversation
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
            );
            
            // Refresh conversations to update unread counts
            softRefreshConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfileId, participantId, softRefreshConversations]);

  // Fetch data when profile ID changes
  useEffect(() => {
    if (currentProfileId) {
      if (participantId) {
        fetchMessages();
      }
      fetchConversations();
    }
  }, [currentProfileId, participantId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    fetchConversations,
    softRefreshConversations,
    currentProfileId,
  };
};

// Hook to start a new conversation
export const useStartConversation = () => {
  const { user, role } = useAuth();
  const { activeProfileId } = useAdminView();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const startConversation = async (recipientId: string, initialMessage: string): Promise<boolean> => {
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
      // Get current profile ID
      let senderId = activeProfileId;
      
      if (!senderId) {
        const table = role === "coach" ? "coach_profiles" : 
                      role === "admin" || role === "manager" || role === "staff" ? "admin_profiles" : 
                      "client_profiles";
        
        const { data: profile } = await supabase
          .from(table)
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          throw new Error("Profile not found");
        }
        senderId = profile.id;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: recipientId,
          content: initialMessage.trim(),
        });

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("[useStartConversation] Error:", err);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  return { startConversation, sending };
};
