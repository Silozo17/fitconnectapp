import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ClientBadges {
  newPlans: number;
  pendingConnections: number;
}

interface CoachBadges {
  newLeads: number;
  pendingBookings: number;
  pendingClientRequests: number;
  pendingFriendRequests: number;
}

interface AdminBadges {
  pendingVerifications: number;
  newUsers: number;
}

export const useClientBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<ClientBadges>({ newPlans: 0, pendingConnections: 0 });
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

  // Fetch new plans count and pending connections
  const fetchBadges = useCallback(async () => {
    if (!clientProfileId || !user) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: plansCount } = await supabase
      .from("plan_assignments")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfileId)
      .gte("assigned_at", sevenDaysAgo.toISOString())
      .eq("status", "active");

    // Pending connection requests (where user is addressee)
    const { count: connectionsCount } = await supabase
      .from("user_connections")
      .select("*", { count: "exact", head: true })
      .eq("addressee_user_id", user.id)
      .eq("status", "pending");

    setBadges({ newPlans: plansCount || 0, pendingConnections: connectionsCount || 0 });
  }, [clientProfileId, user]);

  useEffect(() => {
    if (clientProfileId) fetchBadges();
  }, [clientProfileId, fetchBadges]);

  // Realtime subscription for plan assignments and connections
  useEffect(() => {
    if (!clientProfileId || !user) return;

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_connections",
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientProfileId, user, fetchBadges]);

  return badges;
};

export const useCoachBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<CoachBadges>({
    newLeads: 0,
    pendingBookings: 0,
    pendingClientRequests: 0,
    pendingFriendRequests: 0,
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
    if (!coachProfileId || !user) return;

    // Get coach's last viewed timestamp for leads
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("leads_last_viewed_at")
      .eq("id", coachProfileId)
      .single();

    // Count new leads created after last viewed (or all if never viewed)
    let leadsQuery = supabase
      .from("coach_leads")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("stage", "new_lead");

    if (coachProfile?.leads_last_viewed_at) {
      leadsQuery = leadsQuery.gt("created_at", coachProfile.leads_last_viewed_at);
    }

    const { count: leadsCount } = await leadsQuery;

    // Pending booking requests
    const { count: bookingsCount } = await supabase
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("status", "pending");

    // Pending client requests (clients wanting to hire this coach)
    const { count: clientRequestsCount } = await supabase
      .from("connection_requests")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachProfileId)
      .eq("status", "pending");

    // Pending friend requests (peer-to-peer connections where coach is addressee)
    const { count: friendRequestsCount } = await supabase
      .from("user_connections")
      .select("*", { count: "exact", head: true })
      .eq("addressee_user_id", user.id)
      .eq("status", "pending");

    setBadges({
      newLeads: leadsCount || 0,
      pendingBookings: bookingsCount || 0,
      pendingClientRequests: clientRequestsCount || 0,
      pendingFriendRequests: friendRequestsCount || 0,
    });
  }, [coachProfileId, user]);

  useEffect(() => {
    if (coachProfileId) fetchBadges();
  }, [coachProfileId, fetchBadges]);

  // Mark leads as viewed and refresh badge
  const markLeadsViewed = useCallback(async () => {
    if (!coachProfileId) return;
    
    await supabase
      .from("coach_profiles")
      .update({ leads_last_viewed_at: new Date().toISOString() })
      .eq("id", coachProfileId);
    
    fetchBadges();
  }, [coachProfileId, fetchBadges]);

  // Realtime subscriptions
  useEffect(() => {
    if (!coachProfileId || !user) return;

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_connections",
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachProfileId, user, fetchBadges]);

  return { badges, markLeadsViewed };
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

    // Get admin's last viewed timestamp
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("users_last_viewed_at")
      .eq("user_id", user.id)
      .maybeSingle();

    // Default to 24 hours ago if never viewed
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const viewedAt = adminProfile?.users_last_viewed_at || oneDayAgo.toISOString();

    // Count new client profiles since last viewed
    const { count: usersCount } = await supabase
      .from("client_profiles")
      .select("*", { count: "exact", head: true })
      .gt("created_at", viewedAt);

    setBadges({
      pendingVerifications: verificationsCount || 0,
      newUsers: usersCount || 0,
    });
  }, [user, isAdmin]);

  // Mark users as viewed and refresh badge
  const markUsersViewed = useCallback(async () => {
    if (!user || !isAdmin) return;
    
    await supabase
      .from("admin_profiles")
      .update({ users_last_viewed_at: new Date().toISOString() })
      .eq("user_id", user.id);
    
    fetchBadges();
  }, [user, isAdmin, fetchBadges]);

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
          table: "client_profiles",
        },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, fetchBadges]);

  return { ...badges, markUsersViewed };
};
