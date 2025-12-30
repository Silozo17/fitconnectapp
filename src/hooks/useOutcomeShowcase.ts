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
  consentId: string;
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
}

export interface EligibleClient {
  clientId: string;
  clientName: string;
  consent: ClientConsent;
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

      // Get all active consents
      const { data: consents, error: consentsError } = await supabase
        .from("client_outcome_consents")
        .select(
          `
          *,
          client_profile:client_profiles!client_outcome_consents_client_id_fkey(
            id, first_name, last_name
          )
        `
        )
        .eq("coach_id", coachId)
        .eq("is_active", true);

      if (consentsError) throw consentsError;

      const eligible: EligibleClient[] = [];

      for (const consent of consents || []) {
        const profile = consent.client_profile as any;
        if (!profile) continue;

        // Get progress data for this client
        const { data: progressData } = await supabase
          .from("client_progress")
          .select("recorded_at, weight_kg")
          .eq("client_id", consent.client_id)
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
          clientId: consent.client_id,
          clientName: `${profile.first_name || ""} ${
            profile.last_name || ""
          }`.trim(),
          consent: {
            id: consent.id,
            clientId: consent.client_id,
            coachId: consent.coach_id,
            consentType: consent.consent_type as ConsentType,
            grantedAt: new Date(consent.granted_at),
            revokedAt: consent.revoked_at ? new Date(consent.revoked_at) : null,
            isActive: consent.is_active || false,
          },
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
      consentId: string;
      title?: string;
      description?: string;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
      stats?: Record<string, any>;
      isAnonymized?: boolean;
      displayName?: string;
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
        client_id: data.clientId,
        consent_id: data.consentId,
        title: data.title,
        description: data.description,
        before_photo_url: data.beforePhotoUrl,
        after_photo_url: data.afterPhotoUrl,
        stats: data.stats,
        is_anonymized: data.isAnonymized || false,
        display_name: data.displayName,
        display_order: nextOrder,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-items"] });
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
