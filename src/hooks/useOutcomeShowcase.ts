import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { toast } from "sonner";

export type ConsentType = "stats_only" | "with_photos" | "with_name" | "full";

export interface ClientConsent {
  id: string;
  clientId: string;
  coachId: string;
  consentType: ConsentType;
  grantedAt: Date;
  revokedAt: Date | null;
  isActive: boolean;
}

export interface OutcomeShowcase {
  id: string;
  coachId: string;
  clientId: string;
  consentId: string | null;
  title: string | null;
  description: string | null;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  stats: Record<string, any> | null;
  isAnonymized: boolean;
  displayName: string | null;
  displayOrder: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  isExternal: boolean;
  externalClientName: string | null;
  coachConsentAcknowledged: boolean;
}

export interface EligibleClient {
  clientId: string;
  clientName: string;
  consent: ClientConsent | null;
  hasProgress: boolean;
  progressStats: {
    weightChange?: number;
    startDate?: Date;
    latestDate?: Date;
  } | null;
}

export function useClientConsent(clientId: string) {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["client-consent", coachId, clientId],
    queryFn: async (): Promise<ClientConsent | null> => {
      if (!coachId) throw new Error("No coach ID");

      const { data, error } = await supabase
        .from("client_outcome_consents")
        .select("*")
        .eq("coach_id", coachId)
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("granted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        clientId: data.client_id,
        coachId: data.coach_id,
        consentType: data.consent_type as ConsentType,
        grantedAt: new Date(data.granted_at),
        revokedAt: data.revoked_at ? new Date(data.revoked_at) : null,
        isActive: data.is_active || false,
      };
    },
    enabled: !!coachId && !!clientId,
  });
}

export function useEligibleClients() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["eligible-showcase-clients", coachId],
    queryFn: async (): Promise<EligibleClient[]> => {
      if (!coachId) throw new Error("No coach ID");

      // Get all active clients for this coach
      const { data: clients, error: clientsError } = await supabase
        .from("coach_clients")
        .select(`
          client_id,
          client_profile:client_profiles!coach_clients_client_id_fkey(
            id, first_name, last_name
          )
        `)
        .eq("coach_id", coachId)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      // Get existing consents for these clients
      const clientIds = (clients || []).map(c => c.client_id);
      const { data: consents } = await supabase
        .from("client_outcome_consents")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_active", true)
        .in("client_id", clientIds);

      const consentMap = new Map(
        (consents || []).map(c => [c.client_id, c])
      );

      const eligible: EligibleClient[] = [];

      for (const client of clients || []) {
        const profile = client.client_profile as any;
        if (!profile) continue;

        const existingConsent = consentMap.get(client.client_id);

        // Get progress data for this client
        const { data: progressData } = await supabase
          .from("client_progress")
          .select("recorded_at, weight_kg")
          .eq("client_id", client.client_id)
          .order("recorded_at", { ascending: true });

        let progressStats = null;
        if (progressData && progressData.length >= 2) {
          const first = progressData[0];
          const last = progressData[progressData.length - 1];
          if (first.weight_kg && last.weight_kg) {
            progressStats = {
              weightChange: last.weight_kg - first.weight_kg,
              startDate: new Date(first.recorded_at),
              latestDate: new Date(last.recorded_at),
            };
          }
        }

        eligible.push({
          clientId: client.client_id,
          clientName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          consent: existingConsent ? {
            id: existingConsent.id,
            clientId: existingConsent.client_id,
            coachId: existingConsent.coach_id,
            consentType: existingConsent.consent_type as ConsentType,
            grantedAt: new Date(existingConsent.granted_at),
            revokedAt: existingConsent.revoked_at ? new Date(existingConsent.revoked_at) : null,
            isActive: existingConsent.is_active || false,
          } : null,
          hasProgress: progressStats !== null,
          progressStats,
        });
      }

      return eligible;
    },
    enabled: !!coachId,
  });
}

export function useShowcaseItems(coachId?: string, publishedOnly = false) {
  return useQuery({
    queryKey: ["showcase-items", coachId, publishedOnly],
    queryFn: async (): Promise<OutcomeShowcase[]> => {
      if (!coachId) throw new Error("No coach ID");

      let query = supabase
        .from("coach_outcome_showcases")
        .select("*")
        .eq("coach_id", coachId)
        .order("display_order", { ascending: true });

      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((s) => ({
        id: s.id,
        coachId: s.coach_id,
        clientId: s.client_id,
        consentId: s.consent_id,
        title: s.title,
        description: s.description,
        beforePhotoUrl: s.before_photo_url,
        afterPhotoUrl: s.after_photo_url,
        stats: s.stats as Record<string, any> | null,
        isAnonymized: s.is_anonymized || false,
        displayName: s.display_name,
        displayOrder: s.display_order || 0,
        isPublished: s.is_published || false,
        publishedAt: s.published_at ? new Date(s.published_at) : null,
        createdAt: new Date(s.created_at),
        isExternal: s.is_external || false,
        externalClientName: s.external_client_name,
        coachConsentAcknowledged: s.coach_consent_acknowledged || false,
      }));
    },
    enabled: !!coachId,
  });
}

export function useMyShowcaseItems() {
  const { data: coachId } = useCoachProfileId();
  return useShowcaseItems(coachId, false);
}

export function usePublicShowcaseItems(coachId: string) {
  return useShowcaseItems(coachId, true);
}

export function useGrantConsent() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      consentType: ConsentType;
      clientIp?: string;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      // Revoke any existing consent of this type
      await supabase
        .from("client_outcome_consents")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("coach_id", coachId)
        .eq("client_id", data.clientId)
        .eq("consent_type", data.consentType);

      // Create new consent
      const { error } = await supabase.from("client_outcome_consents").insert({
        client_id: data.clientId,
        coach_id: coachId,
        consent_type: data.consentType,
        client_ip: data.clientIp,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-consent"] });
      queryClient.invalidateQueries({ queryKey: ["eligible-showcase-clients"] });
      toast.success("Consent granted successfully");
    },
    onError: () => {
      toast.error("Failed to grant consent");
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consentId: string) => {
      const { error } = await supabase
        .from("client_outcome_consents")
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
        })
        .eq("id", consentId);

      if (error) throw error;

      // Also unpublish any showcases using this consent
      await supabase
        .from("coach_outcome_showcases")
        .update({ is_published: false })
        .eq("consent_id", consentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-consent"] });
      queryClient.invalidateQueries({ queryKey: ["eligible-showcase-clients"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
      toast.success("Consent revoked");
    },
    onError: () => {
      toast.error("Failed to revoke consent");
    },
  });
}

export function useCreateShowcase() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      consentId?: string | null;
      title?: string;
      description?: string;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      stats?: Record<string, any>;
      isAnonymized?: boolean;
      displayName?: string;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      let consentId = data.consentId;

      // If no consent exists, create one automatically
      if (!consentId) {
        const { data: newConsent, error: consentError } = await supabase
          .from("client_outcome_consents")
          .insert({
            client_id: data.clientId,
            coach_id: coachId,
            consent_type: "stats_only",
            is_active: true,
          })
          .select()
          .single();

        if (consentError) throw consentError;
        consentId = newConsent.id;
      }

      // Get max display order
      const { data: existing } = await supabase
        .from("coach_outcome_showcases")
        .select("display_order")
        .eq("coach_id", coachId)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.display_order || 0) + 1;

      const { error } = await supabase.from("coach_outcome_showcases").insert({
        coach_id: coachId,
        client_id: data.clientId,
        consent_id: consentId,
        title: data.title,
        description: data.description,
        before_photo_url: data.beforePhotoUrl,
        after_photo_url: data.afterPhotoUrl,
        stats: data.stats,
        is_anonymized: data.isAnonymized || false,
        display_name: data.displayName,
        display_order: nextOrder,
        is_published: false, // Start unpublished until client confirms consent
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
      queryClient.invalidateQueries({ queryKey: ["eligible-showcase-clients"] });
      toast.success("Showcase created");
    },
    onError: () => {
      toast.error("Failed to create showcase");
    },
  });
}

export function useUpdateShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      showcaseId: string;
      title?: string;
      description?: string;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      stats?: Record<string, any>;
      isAnonymized?: boolean;
      displayName?: string;
      isPublished?: boolean;
      displayOrder?: number;
    }) => {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) updates.title = data.title;
      if (data.description !== undefined) updates.description = data.description;
      if (data.beforePhotoUrl !== undefined)
        updates.before_photo_url = data.beforePhotoUrl;
      if (data.afterPhotoUrl !== undefined)
        updates.after_photo_url = data.afterPhotoUrl;
      if (data.stats !== undefined) updates.stats = data.stats;
      if (data.isAnonymized !== undefined)
        updates.is_anonymized = data.isAnonymized;
      if (data.displayName !== undefined)
        updates.display_name = data.displayName;
      if (data.displayOrder !== undefined)
        updates.display_order = data.displayOrder;

      if (data.isPublished !== undefined) {
        updates.is_published = data.isPublished;
        if (data.isPublished) {
          updates.published_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from("coach_outcome_showcases")
        .update(updates)
        .eq("id", data.showcaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
      toast.success("Showcase updated");
    },
    onError: () => {
      toast.error("Failed to update showcase");
    },
  });
}

export function useDeleteShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (showcaseId: string) => {
      const { error } = await supabase
        .from("coach_outcome_showcases")
        .delete()
        .eq("id", showcaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
      toast.success("Showcase deleted");
    },
    onError: () => {
      toast.error("Failed to delete showcase");
    },
  });
}

export function useCreateExternalShowcase() {
  const queryClient = useQueryClient();
  const { data: coachId } = useCoachProfileId();

  return useMutation({
    mutationFn: async (data: {
      externalClientName: string;
      displayName?: string;
      title?: string;
      description?: string;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      stats?: Record<string, any>;
      isAnonymized?: boolean;
    }) => {
      if (!coachId) throw new Error("No coach ID");

      // Get max display order
      const { data: existing } = await supabase
        .from("coach_outcome_showcases")
        .select("display_order")
        .eq("coach_id", coachId)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.display_order || 0) + 1;

      const { error } = await supabase.from("coach_outcome_showcases").insert({
        coach_id: coachId,
        client_id: coachId, // Use coach's own ID as placeholder for external
        consent_id: null,
        is_external: true,
        external_client_name: data.externalClientName,
        coach_consent_acknowledged: true,
        coach_consent_acknowledged_at: new Date().toISOString(),
        display_name: data.displayName || data.externalClientName,
        title: data.title,
        description: data.description,
        before_photo_url: data.beforePhotoUrl,
        after_photo_url: data.afterPhotoUrl,
        stats: data.stats,
        is_anonymized: data.isAnonymized || false,
        display_order: nextOrder,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
      toast.success("External transformation added");
    },
    onError: () => {
      toast.error("Failed to add external transformation");
    },
  });
}
