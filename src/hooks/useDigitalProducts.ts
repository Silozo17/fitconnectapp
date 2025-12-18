import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DigitalProduct {
  id: string;
  coach_id: string;
  title: string;
  slug?: string | null;
  description: string | null;
  short_description: string | null;
  content_type: 'ebook' | 'video_course' | 'single_video' | 'template' | 'audio' | 'other';
  price: number;
  compare_at_price: number | null;
  currency: string;
  cover_image_url: string | null;
  preview_url: string | null;
  content_url: string | null;
  video_url: string | null;
  file_size_bytes: number | null;
  duration_minutes: number | null;
  page_count: number | null;
  is_downloadable: boolean;
  is_streamable: boolean;
  tags: string[];
  category: string;
  difficulty_level: string;
  is_published: boolean;
  is_featured: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  coach_profiles?: {
    display_name: string | null;
    profile_image_url: string | null;
  };
  average_rating?: number;
  review_count?: number;
}

export interface DigitalBundle {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  coach_profiles?: {
    display_name: string | null;
    profile_image_url: string | null;
  };
  products?: DigitalProduct[];
}

export interface ContentPurchase {
  id: string;
  user_id: string;
  product_id: string | null;
  bundle_id: string | null;
  coach_id: string;
  amount_paid: number;
  currency: string;
  purchased_at: string;
  access_expires_at: string | null;
  digital_products?: DigitalProduct;
  digital_bundles?: DigitalBundle;
}

export interface ContentReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

// Fetch all published products for marketplace
export function useMarketplaceProducts(filters?: {
  category?: string;
  contentType?: string;
  priceRange?: [number, number];
  coachId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["marketplace-products", filters],
    queryFn: async () => {
      let query = supabase
        .from("digital_products")
        .select(`
          *,
          coach_profiles (
            display_name,
            profile_image_url
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.contentType && filters.contentType !== "all") {
        query = query.eq("content_type", filters.contentType as any);
      }
      if (filters?.coachId) {
        query = query.eq("coach_id", filters.coachId);
      }
      if (filters?.priceRange) {
        query = query.gte("price", filters.priceRange[0]).lte("price", filters.priceRange[1]);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DigitalProduct[];
    },
  });
}

// Fetch featured products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select(`
          *,
          coach_profiles (
            display_name,
            profile_image_url
          )
        `)
        .eq("is_published", true)
        .eq("is_featured", true)
        .limit(8);

      if (error) throw error;
      return data as DigitalProduct[];
    },
  });
}

// Fetch single product by ID or slug
export function useDigitalProduct(productIdOrSlug: string) {
  return useQuery({
    queryKey: ["digital-product", productIdOrSlug],
    queryFn: async () => {
      // Check if it's a UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productIdOrSlug);
      
      let query = supabase
        .from("digital_products")
        .select(`
          *,
          coach_profiles (
            display_name,
            profile_image_url,
            bio
          )
        `);

      if (isUUID) {
        query = query.eq("id", productIdOrSlug);
      } else {
        query = query.eq("slug", productIdOrSlug);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data as DigitalProduct & { slug?: string };
    },
    enabled: !!productIdOrSlug,
  });
}

// Fetch product reviews
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContentReview[];
    },
    enabled: !!productId,
  });
}

// Fetch all published bundles
export function useMarketplaceBundles() {
  return useQuery({
    queryKey: ["marketplace-bundles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_bundles")
        .select(`
          *,
          coach_profiles (
            display_name,
            profile_image_url
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalBundle[];
    },
  });
}

// Fetch single bundle with products
export function useDigitalBundle(bundleId: string) {
  return useQuery({
    queryKey: ["digital-bundle", bundleId],
    queryFn: async () => {
      const { data: bundle, error: bundleError } = await supabase
        .from("digital_bundles")
        .select(`
          *,
          coach_profiles (
            display_name,
            profile_image_url
          )
        `)
        .eq("id", bundleId)
        .single();

      if (bundleError) throw bundleError;

      const { data: bundleProducts, error: productsError } = await supabase
        .from("bundle_products")
        .select(`
          product_id,
          display_order,
          digital_products (*)
        `)
        .eq("bundle_id", bundleId)
        .order("display_order");

      if (productsError) throw productsError;

      return {
        ...bundle,
        products: bundleProducts?.map((bp: any) => bp.digital_products) || [],
      } as DigitalBundle;
    },
    enabled: !!bundleId,
  });
}

// Coach's products
export function useCoachProducts() {
  return useQuery({
    queryKey: ["coach-products"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("digital_products")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalProduct[];
    },
  });
}

// Coach's bundles
export function useCoachBundles() {
  return useQuery({
    queryKey: ["coach-bundles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("digital_bundles")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalBundle[];
    },
  });
}

// User's purchased content
export function useMyLibrary() {
  return useQuery({
    queryKey: ["my-library"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("content_purchases")
        .select(`
          *,
          digital_products (*),
          digital_bundles (*)
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data as ContentPurchase[];
    },
  });
}

// Check if user has purchased a product
export function useHasPurchased(productId?: string, bundleId?: string) {
  return useQuery({
    queryKey: ["has-purchased", productId, bundleId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from("content_purchases")
        .select("id")
        .eq("user_id", user.id);

      if (productId) {
        query = query.eq("product_id", productId);
      }
      if (bundleId) {
        query = query.eq("bundle_id", bundleId);
      }

      const { data, error } = await query.limit(1);
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!(productId || bundleId),
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: Partial<DigitalProduct>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("digital_products")
        .insert({ ...product, coach_id: coachProfile.id } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-products"] });
      toast({ title: "Product created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DigitalProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from("digital_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-products"] });
      toast({ title: "Product updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("digital_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });
}

// Create bundle mutation
export function useCreateBundle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bundle: Partial<DigitalBundle> & { productIds?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) throw new Error("Coach profile not found");

      const { productIds, ...bundleData } = bundle;

      const { data, error } = await supabase
        .from("digital_bundles")
        .insert({ ...bundleData, coach_id: coachProfile.id } as any)
        .select()
        .single();

      if (error) throw error;

      // Add products to bundle
      if (productIds && productIds.length > 0) {
        const bundleProducts = productIds.map((productId, index) => ({
          bundle_id: data.id,
          product_id: productId,
          display_order: index,
        }));

        const { error: bpError } = await supabase
          .from("bundle_products")
          .insert(bundleProducts);

        if (bpError) throw bpError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-bundles"] });
      toast({ title: "Bundle created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create bundle", description: error.message, variant: "destructive" });
    },
  });
}

// Delete bundle mutation
export function useDeleteBundle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bundleId: string) => {
      const { error } = await supabase
        .from("digital_bundles")
        .delete()
        .eq("id", bundleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-bundles"] });
      toast({ title: "Bundle deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete bundle", description: error.message, variant: "destructive" });
    },
  });
}

// Create review mutation
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: { product_id: string; rating: number; review_text?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("content_reviews")
        .insert({ ...review, user_id: user.id, is_verified_purchase: true })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
      toast({ title: "Review submitted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    },
  });
}

// Content categories
export const CONTENT_CATEGORIES = [
  { value: "workout", label: "Workout Programs", icon: "Dumbbell" },
  { value: "nutrition", label: "Nutrition Guides", icon: "Salad" },
  { value: "mindset", label: "Mindset & Motivation", icon: "Brain" },
  { value: "recovery", label: "Recovery & Mobility", icon: "Wrench" },
  { value: "templates", label: "Templates & Trackers", icon: "BarChart" },
  { value: "sport_specific", label: "Sport-Specific Training", icon: "Target" },
  { value: "other", label: "Other", icon: "Package" },
];

// Content types
export const CONTENT_TYPES = [
  { value: "ebook", label: "E-book", icon: "BookOpen" },
  { value: "video_course", label: "Video Course", icon: "Video" },
  { value: "single_video", label: "Single Video", icon: "Film" },
  { value: "template", label: "Template", icon: "ClipboardList" },
  { value: "audio", label: "Audio Content", icon: "Headphones" },
  { value: "other", label: "Other", icon: "Package" },
];
