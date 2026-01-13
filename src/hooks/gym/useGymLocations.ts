import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymLocation {
  id: string;
  gym_id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  is_active: boolean;
  timezone: string | null;
  amenities: string[] | null;
}

export function useGymLocations() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-locations", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_locations")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Map database fields to our interface
      return (data || []).map((l: any) => ({
        id: l.id,
        gym_id: l.gym_id,
        name: l.name,
        address_line1: l.address_line_1 || l.address_line1 || null,
        address_line2: l.address_line_2 || l.address_line2 || null,
        city: l.city,
        state: l.state || l.county || null,
        postal_code: l.postal_code || null,
        country: l.country,
        latitude: l.latitude,
        longitude: l.longitude,
        phone: l.phone,
        email: l.email,
        is_primary: l.is_primary ?? false,
        is_active: l.is_active ?? true,
        timezone: l.timezone,
        amenities: l.amenities,
      })) as GymLocation[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreateGymLocation() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationData: Partial<GymLocation>) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await (supabase as any)
        .from("gym_locations")
        .insert({
          gym_id: gym.id,
          name: locationData.name,
          address_line_1: locationData.address_line1,
          address_line_2: locationData.address_line2,
          city: locationData.city,
          county: locationData.state,
          postal_code: locationData.postal_code,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          phone: locationData.phone,
          email: locationData.email,
          is_primary: locationData.is_primary,
          is_active: locationData.is_active ?? true,
          timezone: locationData.timezone,
          amenities: locationData.amenities,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-locations", gym?.id] });
      toast.success("Location created successfully");
    },
    onError: (error) => {
      console.error("Failed to create location:", error);
      toast.error("Failed to create location");
    },
  });
}

export function useUpdateGymLocation() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      locationId, 
      updates 
    }: { 
      locationId: string; 
      updates: Partial<GymLocation> 
    }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.address_line1 !== undefined) dbUpdates.address_line_1 = updates.address_line1;
      if (updates.address_line2 !== undefined) dbUpdates.address_line_2 = updates.address_line2;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.county = updates.state;
      if (updates.postal_code !== undefined) dbUpdates.postal_code = updates.postal_code;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.is_primary !== undefined) dbUpdates.is_primary = updates.is_primary;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      
      const { data, error } = await (supabase as any)
        .from("gym_locations")
        .update(dbUpdates)
        .eq("id", locationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-locations", gym?.id] });
      toast.success("Location updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update location:", error);
      toast.error("Failed to update location");
    },
  });
}
