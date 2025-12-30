import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ConsentType = "stats_only" | "with_photos" | "with_name" | "full";

export interface ShowcaseConsent {
  id: string;
  coachId: string;
  consentType: ConsentType;
  grantedAt: Date;
  revokedAt: Date | null;
  isActive: boolean;
}

export interface CoachWithConsent {
  coachId: string;
  coachName: string;
  consent: ShowcaseConsent | null;
}

export function useClientProfileId() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-profile-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!user,
  });
}

export function useMyShowcaseConsents() {
  const { data: clientId } = useClientProfileId();

  return useQuery({
    queryKey: ["my-showcase-consents", clientId],
    queryFn: async (): Promise<Map<string, ShowcaseConsent>> => {
      if (!clientId) throw new Error("No client ID");

      const { data, error } = await supabase
        .from("client_outcome_consents")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true);

      if (error) throw error;

      const consentMap = new Map<string, ShowcaseConsent>();
      for (const consent of data || []) {
        consentMap.set(consent.coach_id, {
          id: consent.id,
          coachId: consent.coach_id,
          consentType: consent.consent_type as ConsentType,
          grantedAt: new Date(consent.granted_at),
          revokedAt: consent.revoked_at ? new Date(consent.revoked_at) : null,
          isActive: consent.is_active || false,
        });
      }

      return consentMap;
    },
    enabled: !!clientId,
  });
}

export function useGrantShowcaseConsent() {
  const queryClient = useQueryClient();
  const { data: clientId } = useClientProfileId();

  return useMutation({
    mutationFn: async (data: { coachId: string; consentType: ConsentType }) => {
      if (!clientId) throw new Error("No client ID");

      // Revoke any existing consent first
      await supabase
        .from("client_outcome_consents")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .eq("coach_id", data.coachId)
        .eq("is_active", true);

      // Create new consent
      const { error } = await supabase.from("client_outcome_consents").insert({
        client_id: clientId,
        coach_id: data.coachId,
        consent_type: data.consentType,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-showcase-consents"] });
      toast.success("Showcase permission granted");
    },
    onError: () => {
      toast.error("Failed to grant permission");
    },
  });
}

export function useUpdateShowcaseConsent() {
  const queryClient = useQueryClient();
  const { data: clientId } = useClientProfileId();

  return useMutation({
    mutationFn: async (data: { coachId: string; consentType: ConsentType }) => {
      if (!clientId) throw new Error("No client ID");

      // Revoke existing and create new with updated type
      await supabase
        .from("client_outcome_consents")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .eq("coach_id", data.coachId)
        .eq("is_active", true);

      const { error } = await supabase.from("client_outcome_consents").insert({
        client_id: clientId,
        coach_id: data.coachId,
        consent_type: data.consentType,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-showcase-consents"] });
      toast.success("Showcase permission updated");
    },
    onError: () => {
      toast.error("Failed to update permission");
    },
  });
}

export function useRevokeShowcaseConsent() {
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
      queryClient.invalidateQueries({ queryKey: ["my-showcase-consents"] });
      toast.success("Showcase permission revoked");
    },
    onError: () => {
      toast.error("Failed to revoke permission");
    },
  });
}
