import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CheckoutType = "digital-product" | "digital-bundle" | "package" | "subscription";

export interface CheckoutItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  type: CheckoutType;
  // Product-specific
  contentType?: string;
  durationMinutes?: number;
  pageCount?: number;
  // Package-specific
  sessionCount?: number;
  validityDays?: number;
  // Subscription-specific
  billingPeriod?: string;
  sessionsPerPeriod?: number;
  features?: string[];
  // Bundle-specific
  productCount?: number;
  // Coach info
  coach: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    username: string | null;
  } | null;
}

// Helper to fetch coach profile
async function fetchCoachProfile(coachId: string) {
  const { data } = await supabase
    .from("coach_profiles")
    .select("id, display_name, profile_image_url, username")
    .eq("id", coachId)
    .single();
  
  if (!data) return null;
  
  return {
    id: data.id,
    displayName: data.display_name || "Coach",
    profileImageUrl: data.profile_image_url,
    username: data.username,
  };
}

export const useCheckoutItem = (type: CheckoutType | null, itemId: string | null, coachId?: string | null) => {
  return useQuery({
    queryKey: ["checkout-item", type, itemId],
    queryFn: async (): Promise<CheckoutItem | null> => {
      if (!type || !itemId) return null;

      switch (type) {
        case "digital-product": {
          const { data, error } = await supabase
            .from("digital_products")
            .select(`
              id,
              title,
              description,
              price,
              currency,
              cover_image_url,
              content_type,
              duration_minutes,
              page_count,
              coach_id,
              coach_profiles!digital_products_coach_id_fkey (
                id,
                display_name,
                profile_image_url,
                username
              )
            `)
            .eq("id", itemId)
            .single();

          if (error || !data) return null;

          const coach = data.coach_profiles;
          return {
            id: data.id,
            name: data.title,
            description: data.description,
            price: data.price,
            currency: data.currency || "GBP",
            imageUrl: data.cover_image_url,
            type: "digital-product",
            contentType: data.content_type,
            durationMinutes: data.duration_minutes,
            pageCount: data.page_count,
            coach: coach ? {
              id: coach.id,
              displayName: coach.display_name || "Coach",
              profileImageUrl: coach.profile_image_url,
              username: coach.username,
            } : null,
          };
        }

        case "digital-bundle": {
          const { data, error } = await supabase
            .from("digital_bundles")
            .select(`
              id,
              title,
              description,
              price,
              currency,
              cover_image_url,
              coach_id,
              coach_profiles!digital_bundles_coach_id_fkey (
                id,
                display_name,
                profile_image_url,
                username
              ),
              bundle_products (
                id
              )
            `)
            .eq("id", itemId)
            .single();

          if (error || !data) return null;

          const coach = data.coach_profiles;
          return {
            id: data.id,
            name: data.title,
            description: data.description,
            price: data.price,
            currency: data.currency || "GBP",
            imageUrl: data.cover_image_url,
            type: "digital-bundle",
            productCount: data.bundle_products?.length || 0,
            coach: coach ? {
              id: coach.id,
              displayName: coach.display_name || "Coach",
              profileImageUrl: coach.profile_image_url,
              username: coach.username,
            } : null,
          };
        }

        case "package": {
          const { data, error } = await supabase
            .from("coach_packages")
            .select("*")
            .eq("id", itemId)
            .single();

          if (error || !data) return null;

          // Fetch coach separately since there's no FK relation in types
          const coach = data.coach_id ? await fetchCoachProfile(data.coach_id) : null;

          return {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency || "GBP",
            imageUrl: null,
            type: "package",
            sessionCount: data.session_count,
            validityDays: data.validity_days,
            coach,
          };
        }

        case "subscription": {
          const { data, error } = await supabase
            .from("coach_subscription_plans")
            .select("*")
            .eq("id", itemId)
            .single();

          if (error || !data) return null;

          // Fetch coach separately since there's no FK relation in types
          const coach = data.coach_id ? await fetchCoachProfile(data.coach_id) : null;

          // Handle features - could be array or JSON
          const features = Array.isArray(data.features) 
            ? data.features.filter((f): f is string => typeof f === 'string')
            : [];

          return {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency || "GBP",
            imageUrl: null,
            type: "subscription",
            billingPeriod: data.billing_period,
            sessionsPerPeriod: data.sessions_per_period,
            features,
            coach,
          };
        }

        default:
          return null;
      }
    },
    enabled: !!type && !!itemId,
    staleTime: 1000 * 60 * 5,
  });
};
