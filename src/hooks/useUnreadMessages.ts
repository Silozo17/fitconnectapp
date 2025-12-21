import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { triggerHaptic } from "@/lib/despia";

export const useUnreadMessages = () => {
  const { user, role } = useAuth();
  const { activeProfileId } = useAdminView();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

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

      // Handle admin role
      if (role === "admin" || role === "manager" || role === "staff") {
        const { data: adminData } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (adminData) {
          setCurrentProfileId(adminData.id);
          return;
        }
      }

      const table = role === "coach" ? "coach_profiles" : "client_profiles";
      
      const { data } = await supabase
        .from(table)
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCurrentProfileId(data.id);
      } else {
        setLoading(false);
      }
    };

    fetchProfileId();
  }, [user, role, activeProfileId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!currentProfileId) return;

    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", currentProfileId)
      .is("read_at", null);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
    setLoading(false);
  }, [currentProfileId]);

  // Initial fetch
  useEffect(() => {
    if (currentProfileId) {
      fetchUnreadCount();
    }
  }, [currentProfileId, fetchUnreadCount]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!currentProfileId) return;

    const channel = supabase
      .channel(`unread-messages-${currentProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentProfileId}`,
        },
        () => {
          // New message received - increment count and trigger haptic
          triggerHaptic('light');
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentProfileId}`,
        },
        (payload) => {
          // Message updated - check if it was marked as read
          const updated = payload.new as { read_at: string | null };
          const old = payload.old as { read_at: string | null };
          
          if (old.read_at === null && updated.read_at !== null) {
            // Message was marked as read - decrement count
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfileId]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
