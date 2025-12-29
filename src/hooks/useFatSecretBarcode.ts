import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BarcodeFood {
  fatsecret_id: string;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  saturated_fat_g: number;
  image_url: string | null;
  allergens: string[];
  dietary_preferences: string[];
  barcode: string;
}

interface BarcodeResponse {
  found: boolean;
  food?: BarcodeFood;
  barcode?: string;
  message?: string;
  error?: string;
}

export const useFatSecretBarcode = (region: string = 'GB') => {
  return useMutation({
    mutationFn: async (barcode: string): Promise<BarcodeResponse> => {
      const { data, error } = await supabase.functions.invoke<BarcodeResponse>('fatsecret-barcode', {
        body: { barcode, region }
      });

      if (error) {
        console.error('FatSecret barcode error:', error);
        throw new Error('Failed to lookup barcode');
      }

      return data || { found: false };
    },
  });
};
