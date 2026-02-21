import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ===== Linked Packages =====

export interface LinkedPackage {
  id: string;
  community_id: string;
  package_id: string;
  is_free_for_members: boolean;
  created_at: string;
}

export const useCommunityLinkedPackages = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-linked-packages", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_linked_packages")
        .select("*, coach_packages(id, name, description, price, currency, sessions_included)")
        .eq("community_id", communityId!);
      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
};

export const useLinkPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { community_id: string; package_id: string; is_free_for_members?: boolean }) => {
      const { error } = await supabase.from("community_linked_packages").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["community-linked-packages", v.community_id] });
    },
  });
};

export const useUnlinkPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, communityId }: { id: string; communityId: string }) => {
      const { error } = await supabase.from("community_linked_packages").delete().eq("id", id);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      qc.invalidateQueries({ queryKey: ["community-linked-packages", communityId] });
    },
  });
};

// ===== Linked Products =====

export interface LinkedProduct {
  id: string;
  community_id: string;
  product_id: string;
  is_free_for_members: boolean;
  created_at: string;
}

export const useCommunityLinkedProducts = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-linked-products", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_linked_products")
        .select("*, digital_products(id, title, description, price, currency, cover_image_url)")
        .eq("community_id", communityId!);
      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
};

export const useLinkProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { community_id: string; product_id: string; is_free_for_members?: boolean }) => {
      const { error } = await supabase.from("community_linked_products").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["community-linked-products", v.community_id] });
    },
  });
};

export const useUnlinkProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, communityId }: { id: string; communityId: string }) => {
      const { error } = await supabase.from("community_linked_products").delete().eq("id", id);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      qc.invalidateQueries({ queryKey: ["community-linked-products", communityId] });
    },
  });
};
