import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteSettings {
  id: string;
  gym_id: string;
  theme_color: string | null;
  secondary_color: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  about_title: string | null;
  about_content: string | null;
  mission_statement: string | null;
  features_title: string | null;
  features_enabled: boolean;
  testimonials_enabled: boolean;
  classes_enabled: boolean;
  trainers_enabled: boolean;
  pricing_enabled: boolean;
  contact_enabled: boolean;
  gallery_enabled: boolean;
  custom_css: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  gym_id: string;
  image_url: string;
  caption: string | null;
  alt_text: string | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  gym_id: string;
  member_id: string | null;
  author_name: string;
  author_role: string | null;
  author_image_url: string | null;
  content: string;
  rating: number | null;
  is_featured: boolean;
  is_approved: boolean;
  display_order: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  gym_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  category: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  gym_id: string;
  platform: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface OpeningHours {
  id: string;
  gym_id: string;
  location_id: string | null;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  special_note: string | null;
  created_at: string;
}

export interface FeaturedTrainer {
  id: string;
  gym_id: string;
  staff_id: string | null;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Fetch website settings
export function useGymWebsiteSettings(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gym-website-settings', gymId],
    queryFn: async () => {
      if (!gymId) return null;
      const { data, error } = await supabase
        .from('gym_website_settings')
        .select('*')
        .eq('gym_id', gymId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WebsiteSettings | null;
    },
    enabled: !!gymId,
  });
}

// Upsert website settings
export function useUpsertWebsiteSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<WebsiteSettings> & { gym_id: string }) => {
      const { data, error } = await supabase
        .from('gym_website_settings')
        .upsert(settings, { onConflict: 'gym_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-website-settings', variables.gym_id] });
    },
  });
}

// Gallery images
export function useGymGallery(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gym-gallery', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from('gym_gallery_images')
        .select('*')
        .eq('gym_id', gymId)
        .order('display_order');
      
      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!gymId,
  });
}

export function useAddGalleryImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (image: Omit<GalleryImage, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_gallery_images')
        .insert(image)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-gallery', variables.gym_id] });
    },
  });
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from('gym_gallery_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-gallery', variables.gymId] });
    },
  });
}

// Testimonials
export function useGymTestimonials(gymId: string | undefined, approvedOnly = false) {
  return useQuery({
    queryKey: ['gym-testimonials', gymId, approvedOnly],
    queryFn: async () => {
      if (!gymId) return [];
      let query = supabase
        .from('gym_testimonials')
        .select('*')
        .eq('gym_id', gymId)
        .order('display_order');
      
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Testimonial[];
    },
    enabled: !!gymId,
  });
}

export function useAddTestimonial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_testimonials')
        .insert(testimonial)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-testimonials', variables.gym_id] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gymId, ...updates }: Partial<Testimonial> & { id: string; gymId: string }) => {
      const { data, error } = await supabase
        .from('gym_testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-testimonials', variables.gymId] });
    },
  });
}

// Announcements
export function useGymAnnouncements(gymId: string | undefined, publishedOnly = false) {
  return useQuery({
    queryKey: ['gym-announcements', gymId, publishedOnly],
    queryFn: async () => {
      if (!gymId) return [];
      let query = supabase
        .from('gym_announcements')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!gymId,
  });
}

export function useAddAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
      const { data, error } = await supabase
        .from('gym_announcements')
        .insert(announcement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-announcements', variables.gym_id] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gymId, ...updates }: Partial<Announcement> & { id: string; gymId: string }) => {
      const { data, error } = await supabase
        .from('gym_announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-announcements', variables.gymId] });
    },
  });
}

// Social links
export function useGymSocialLinks(gymId: string | undefined) {
  return useQuery({
    queryKey: ['gym-social-links', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from('gym_social_links')
        .select('*')
        .eq('gym_id', gymId)
        .order('display_order');
      
      if (error) throw error;
      return data as SocialLink[];
    },
    enabled: !!gymId,
  });
}

export function useUpsertSocialLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (link: Omit<SocialLink, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_social_links')
        .upsert(link, { onConflict: 'gym_id,platform' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-social-links', variables.gym_id] });
    },
  });
}

// Opening hours
export function useGymOpeningHours(gymId: string | undefined, locationId?: string) {
  return useQuery({
    queryKey: ['gym-opening-hours', gymId, locationId],
    queryFn: async () => {
      if (!gymId) return [];
      let query = supabase
        .from('gym_opening_hours')
        .select('*')
        .eq('gym_id', gymId)
        .order('day_of_week');
      
      if (locationId) {
        query = query.eq('location_id', locationId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OpeningHours[];
    },
    enabled: !!gymId,
  });
}

export function useUpsertOpeningHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hours: Omit<OpeningHours, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('gym_opening_hours')
        .upsert(hours, { onConflict: 'gym_id,location_id,day_of_week' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['gym-opening-hours', variables[0].gym_id] });
      }
    },
  });
}

// Featured trainers
export function useGymFeaturedTrainers(gymId: string | undefined, activeOnly = false) {
  return useQuery({
    queryKey: ['gym-featured-trainers', gymId, activeOnly],
    queryFn: async () => {
      if (!gymId) return [];
      let query = supabase
        .from('gym_featured_trainers')
        .select('*')
        .eq('gym_id', gymId)
        .order('display_order');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FeaturedTrainer[];
    },
    enabled: !!gymId,
  });
}

export function useAddFeaturedTrainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainer: Omit<FeaturedTrainer, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_featured_trainers')
        .insert(trainer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-featured-trainers', variables.gym_id] });
    },
  });
}

export function useUpdateFeaturedTrainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, gymId, ...updates }: Partial<FeaturedTrainer> & { id: string; gymId: string }) => {
      const { data, error } = await supabase
        .from('gym_featured_trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-featured-trainers', variables.gymId] });
    },
  });
}
