import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useClientProfileId } from "@/hooks/useClientProfileId";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { triggerHaptic } from "@/lib/despia";

// PERFORMANCE FIX: Delay before creating realtime subscriptions (ms)
const SUBSCRIPTION_DELAY_MS = 2000;

export const useUnreadMessages = () => {
  const { user, role } = useAuth();
  const { activeProfileId } = useAdminView();
  const { data: clientProfileId } = useClientProfileId();
  const { data: coachProfileId } = useCoachProfileId();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const subscriptionDelayRef = useRef<NodeJS.Timeout | null>(null);

  // PERFORMANCE FIX: Use cached profile IDs instead of fetching inline
  // Priority: activeProfileId (admin switching) > role-based profile ID
  const currentProfileId = activeProfileId || 
    (role === "coach" ? coachProfileId : clientProfileId) || 
    null;

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
    } else {
      setLoading(false);
    }
  }, [currentProfileId, fetchUnreadCount]);

  // PERFORMANCE FIX: Deferred realtime subscription
  useEffect(() => {
    if (!currentProfileId) return;

    // Clear any existing delay timer
    if (subscriptionDelayRef.current) {
      clearTimeout(subscriptionDelayRef.current);
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Delay subscription creation to allow UI to render first
    subscriptionDelayRef.current = setTimeout(() => {
      channel = supabase
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
            const updated = payload.new as { read_at: string | null };
            const old = payload.old as { read_at: string | null };
            
            if (old.read_at === null && updated.read_at !== null) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    }, SUBSCRIPTION_DELAY_MS);

    return () => {
      if (subscriptionDelayRef.current) {
        clearTimeout(subscriptionDelayRef.current);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentProfileId]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
