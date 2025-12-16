import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ClientBadges {
  newPlans: number;
}

interface CoachBadges {
  newLeads: number;
  pendingBookings: number;
  pendingConnections: number;
}

interface AdminBadges {
  pendingVerifications: number;
  newUsers: number;
}

export const useClientBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<ClientBadges>({ newPlans: 0 });
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);

  // Get client profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setClientProfileId(data.id);
    };
    fetchProfileId();
  }, [user]);

  // Fetch new plans count (plans assigned in last 7 days that haven't been viewed)
  const fetchBadges = useCallback(async () => {
    if (!clientProfileId) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count } = await supabase
      .from("plan_assignments")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfileId)
      .gte("assigned_at", sevenDaysAgo.toISOString())
      .eq("status", "active");

    setBadges({ newPlans: count || 0 });
  }, [clientProfileId]);

  useEffect(() => {
    if (clientProfileId) fetchBadges();
  }, [clientProfileId, fetchBadges]);

  // Realtime subscription for plan assignments
  useEffect(() => {
    if (!clientProfileId) return;

    const channel = supabase
      .channel(`client-badges-${clientProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "plan_assignments",
          filter: `client_id=eq.${clientProfileId}`,
        },
        () => {
          setBadges((prev) => ({ ...prev, newPlans: prev.newPlans + 1 }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientProfileId]);

  return badges;
};

export const useCoachBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<CoachBadges>({
    newLeads: 0,
    pendingBookings: 0,
    pendingConnections: 0,
  });
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);

  // Get coach profile ID
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setCoachProfileId(data.id);
    };
    fetchProfileId();
  }, [user]);

  // Fetch all badge counts
  const fetchBadges = useCallback(async () => {
    if (!coachProfileId) return;

    // New leads (stage = 'new_lead')
    const { count: leadsCount } = await supabase
      .from("coach_leads")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("stage", "new_lead");

    // Pending booking requests
    const { count: bookingsCount } = await supabase
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("status", "pending");

    // Pending connection requests
    const { count: connectionsCount } = await supabase
      .from("connection_requests")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("status", "pending");

    setBadges({
      newLeads: leadsCount || 0,
      pendingBookings: bookingsCount || 0,
      pendingConnections: connectionsCount || 0,
    });
  }, [coachProfileId]);

  useEffect(() => {
    if (coachProfileId) fetchBadges();
  }, [coachProfileId, fetchBadges]);

  // Realtime subscriptions
  useEffect(() => {
    if (!coachProfileId) return;

    const channel = supabase
      .channel(`coach-badges-${coachProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coach_leads",
          filter: `coach_id=eq.${coachProfileId}`,
        },
        () => fetchBadges()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_requests",
          filter: `coach_id=eq.${coachProfileId}`,
        },
        () => fetchBadges()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connection_requests",
          filter: `coach_id=eq.${coachProfileId}`,
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfileId, fetchBadges]);

  return badges;
};

export const useAdminBadges = () => {
  const { user, role } = useAuth();
  const [badges, setBadges] = useState<AdminBadges>({
    pendingVerifications: 0,
    newUsers: 0,
  });

  const isAdmin = role === "admin" || role === "manager" || role === "staff";

  // Fetch all badge counts
  const fetchBadges = useCallback(async () => {
    if (!user || !isAdmin) return;

    // Pending verification documents
    const { count: verificationsCount } = await supabase
      .from("coach_verification_documents")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // New users in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: usersCount } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneDayAgo.toISOString());

    setBadges({
      pendingVerifications: verificationsCount || 0,
      newUsers: usersCount || 0,
    });
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) fetchBadges();
  }, [user, isAdmin, fetchBadges]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel("admin-badges")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coach_verification_documents",
        },
        () => fetchBadges()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_roles",
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, fetchBadges]);

  return badges;
};
