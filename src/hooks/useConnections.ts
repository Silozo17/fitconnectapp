import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserConnection {
  id: string;
  requester_user_id: string;
  requester_profile_type: string;
  addressee_user_id: string;
  addressee_profile_type: string;
  status: string;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  // Joined profile data
  profile?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    profile_image_url?: string | null;
    location?: string | null;
    // Avatar data for character avatars
    selected_avatar_slug?: string | null;
    selected_avatar_rarity?: string | null;
  };
}

export interface SearchResult {
  user_id: string;
  username: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  profile_image_url: string | null;
  profile_type: "client" | "coach" | "admin"; // Keep for backward compat
  profile_types: ("client" | "coach" | "admin")[]; // All roles this user has
  primary_profile_type: "client" | "coach" | "admin"; // Primary role (coach > client)
  location: string | null;
}

export const useConnections = () => {
  const { user, role } = useAuth();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserConnection[]>([]);
  const [sentRequests, setSentRequests] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProfileType = useCallback(() => {
    if (role === "client") return "client";
    if (role === "coach") return "coach";
    return "admin";
  }, [role]);

  // Fetch all connections for current user
  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch accepted connections
      const { data: acceptedData, error: acceptedError } = await supabase
        .from("user_connections")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_user_id.eq.${user.id},addressee_user_id.eq.${user.id}`);

      if (acceptedError) throw acceptedError;

      // Fetch pending requests (where user is addressee)
      const { data: pendingData, error: pendingError } = await supabase
        .from("user_connections")
        .select("*")
        .eq("status", "pending")
        .eq("addressee_user_id", user.id);

      if (pendingError) throw pendingError;

      // Fetch sent requests (where user is requester)
      const { data: sentData, error: sentError } = await supabase
        .from("user_connections")
        .select("*")
        .eq("status", "pending")
        .eq("requester_user_id", user.id);

      if (sentError) throw sentError;

      // Enrich connections with profile data using batched queries
      const enrichedAccepted = await enrichConnectionsWithProfiles(acceptedData || [], user.id);
      const enrichedPending = await enrichConnectionsWithProfiles(pendingData || [], user.id, true);
      const enrichedSent = await enrichConnectionsWithProfiles(sentData || [], user.id, false);

      setConnections(enrichedAccepted);
      setPendingRequests(enrichedPending);
      setSentRequests(enrichedSent);
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError("Failed to load connections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Enrich connections with profile data using BATCHED queries to avoid N+1
  const enrichConnectionsWithProfiles = async (
    connections: UserConnection[],
    currentUserId: string,
    showRequester: boolean = false
  ): Promise<UserConnection[]> => {
    if (connections.length === 0) return [];

    // Collect all target user IDs grouped by profile type
    const clientUserIds: string[] = [];
    const coachUserIds: string[] = [];
    const adminUserIds: string[] = [];
    const connectionTargets: { conn: UserConnection; targetUserId: string; targetProfileType: string }[] = [];

    for (const conn of connections) {
      const isRequester = conn.requester_user_id === currentUserId;
      const targetUserId = showRequester 
        ? conn.requester_user_id 
        : (isRequester ? conn.addressee_user_id : conn.requester_user_id);
      const targetProfileType = showRequester 
        ? conn.requester_profile_type 
        : (isRequester ? conn.addressee_profile_type : conn.requester_profile_type);

      connectionTargets.push({ conn, targetUserId, targetProfileType });

      if (targetProfileType === "client") {
        clientUserIds.push(targetUserId);
      } else if (targetProfileType === "coach") {
        coachUserIds.push(targetUserId);
      } else {
        adminUserIds.push(targetUserId);
      }
    }

    // Batch fetch all profiles in parallel
    const [clientProfiles, coachProfiles, adminProfiles] = await Promise.all([
      clientUserIds.length > 0
        ? supabase
            .from("client_profiles")
            .select("id, user_id, first_name, last_name, username, avatar_url, location, avatars:selected_avatar_id(slug, rarity)")
            .in("user_id", clientUserIds)
        : Promise.resolve({ data: [] }),
      coachUserIds.length > 0
        ? supabase
            .from("coach_profiles")
            .select("id, user_id, display_name, username, profile_image_url, location, avatars:selected_avatar_id(slug, rarity)")
            .in("user_id", coachUserIds)
        : Promise.resolve({ data: [] }),
      adminUserIds.length > 0
        ? supabase
            .from("admin_profiles")
            .select("id, user_id, first_name, last_name, display_name, username, avatar_url")
            .in("user_id", adminUserIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Create lookup maps by user_id
    const clientMap = new Map((clientProfiles.data || []).map(p => [p.user_id, p]));
    const coachMap = new Map((coachProfiles.data || []).map(p => [p.user_id, p]));
    const adminMap = new Map((adminProfiles.data || []).map(p => [p.user_id, p]));

    // Enrich connections with profile data
    return connectionTargets.map(({ conn, targetUserId, targetProfileType }) => {
      let profile = null;

      if (targetProfileType === "client") {
        const data = clientMap.get(targetUserId);
        if (data) {
          const avatarData = data.avatars as { slug: string; rarity: string } | null;
          profile = {
            ...data,
            selected_avatar_slug: avatarData?.slug || null,
            selected_avatar_rarity: avatarData?.rarity || null,
          };
        }
      } else if (targetProfileType === "coach") {
        const data = coachMap.get(targetUserId);
        if (data) {
          const avatarData = data.avatars as { slug: string; rarity: string } | null;
          profile = {
            ...data,
            selected_avatar_slug: avatarData?.slug || null,
            selected_avatar_rarity: avatarData?.rarity || null,
          };
        }
      } else {
        profile = adminMap.get(targetUserId) || null;
      }

      return { ...conn, profile: profile || undefined };
    });
  };

  // Search users by username, name, or email
  const searchUsers = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const isEmailSearch = query.includes("@");

    // Map to group results by user_id
    const userMap = new Map<string, {
      user_id: string;
      username: string | null;
      display_name: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      profile_image_url: string | null;
      profile_types: ("client" | "coach" | "admin")[];
      location: string | null;
    }>();

    // If query looks like an email, search by exact email match
    if (isEmailSearch) {
      const { data: emailResults } = await supabase.rpc("search_users_by_email", {
        search_email: query,
      });

      if (emailResults) {
        emailResults.forEach((r: any) => {
          if (r.user_id !== user?.id) {
            const existing = userMap.get(r.user_id);
            if (existing) {
              // Add this profile type if not already present
              if (!existing.profile_types.includes(r.profile_type)) {
                existing.profile_types.push(r.profile_type);
              }
              // Prefer coach data over client data
              if (r.profile_type === "coach") {
                existing.display_name = r.display_name || existing.display_name;
                existing.profile_image_url = r.profile_image_url || existing.profile_image_url;
                existing.location = r.location || existing.location;
              }
            } else {
              userMap.set(r.user_id, {
                user_id: r.user_id,
                username: r.username,
                display_name: r.display_name,
                first_name: r.first_name,
                last_name: r.last_name,
                avatar_url: r.avatar_url,
                profile_image_url: r.profile_image_url,
                profile_types: [r.profile_type as "client" | "coach" | "admin"],
                location: r.location,
              });
            }
          }
        });
      }
      return consolidateResults(userMap);
    }

    // Search clients by username or name
    const { data: clients } = await supabase
      .from("client_profiles")
      .select("user_id, username, first_name, last_name, avatar_url, location")
      .or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .neq("user_id", user?.id)
      .limit(15);

    clients?.forEach((c) => {
      const existing = userMap.get(c.user_id);
      if (existing) {
        if (!existing.profile_types.includes("client")) {
          existing.profile_types.push("client");
        }
      } else {
        userMap.set(c.user_id, {
          user_id: c.user_id,
          username: c.username,
          display_name: null,
          first_name: c.first_name,
          last_name: c.last_name,
          avatar_url: c.avatar_url,
          profile_image_url: null,
          profile_types: ["client"],
          location: c.location,
        });
      }
    });

    // Search coaches by username or display name
    const { data: coaches } = await supabase
      .from("coach_profiles")
      .select("user_id, username, display_name, profile_image_url, location")
      .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
      .neq("user_id", user?.id)
      .limit(15);

    coaches?.forEach((c) => {
      const existing = userMap.get(c.user_id);
      if (existing) {
        if (!existing.profile_types.includes("coach")) {
          existing.profile_types.push("coach");
        }
        // Prefer coach data
        existing.display_name = c.display_name || existing.display_name;
        existing.profile_image_url = c.profile_image_url || existing.profile_image_url;
        existing.location = c.location || existing.location;
        existing.username = c.username || existing.username;
      } else {
        userMap.set(c.user_id, {
          user_id: c.user_id,
          username: c.username,
          display_name: c.display_name,
          first_name: null,
          last_name: null,
          avatar_url: null,
          profile_image_url: c.profile_image_url,
          profile_types: ["coach"],
          location: c.location,
        });
      }
    });

    return consolidateResults(userMap);
  };

  // Helper to consolidate grouped results into final SearchResult array
  const consolidateResults = (userMap: Map<string, {
    user_id: string;
    username: string | null;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    profile_image_url: string | null;
    profile_types: ("client" | "coach" | "admin")[];
    location: string | null;
  }>): SearchResult[] => {
    return Array.from(userMap.values()).map((u) => {
      // Determine primary profile type: coach > client > admin
      const primary: "client" | "coach" | "admin" = 
        u.profile_types.includes("coach") ? "coach" :
        u.profile_types.includes("client") ? "client" : "admin";
      
      return {
        user_id: u.user_id,
        username: u.username,
        display_name: u.display_name,
        first_name: u.first_name,
        last_name: u.last_name,
        avatar_url: u.avatar_url,
        profile_image_url: u.profile_image_url,
        profile_type: primary, // backward compat
        profile_types: u.profile_types,
        primary_profile_type: primary,
        location: u.location,
      };
    });
  };

  // Send connection request
  const sendConnectionRequest = async (
    addresseeUserId: string,
    addresseeProfileType: string,
    message?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("user_connections").insert({
        requester_user_id: user.id,
        requester_profile_type: getProfileType(),
        addressee_user_id: addresseeUserId,
        addressee_profile_type: addresseeProfileType,
        message: message || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You already have a pending request with this user");
        } else {
          throw error;
        }
        return false;
      }

      toast.success("Connection request sent!");
      fetchConnections();
      return true;
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
      return false;
    }
  };

  // Accept connection request
  const acceptRequest = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Connection accepted!");
      fetchConnections();
      return true;
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
      return false;
    }
  };

  // Reject connection request
  const rejectRequest = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .update({ status: "rejected", responded_at: new Date().toISOString() })
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Request declined");
      fetchConnections();
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to decline request");
      return false;
    }
  };

  // Cancel sent request
  const cancelRequest = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Request cancelled");
      fetchConnections();
      return true;
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
      return false;
    }
  };

  // Remove connection
  const removeConnection = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Connection removed");
      fetchConnections();
      return true;
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove connection");
      return false;
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`connections-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_connections",
        },
        () => fetchConnections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConnections]);

  return {
    connections,
    pendingRequests,
    sentRequests,
    loading,
    error,
    searchUsers,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
    refreshConnections: fetchConnections,
  };
};
