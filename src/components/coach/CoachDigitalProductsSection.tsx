import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductCard from "@/components/marketplace/ProductCard";
import { DigitalProduct } from "@/hooks/useDigitalProducts";

interface CoachDigitalProductsSectionProps {
  coachId: string;
}

export function CoachDigitalProductsSection({ coachId }: CoachDigitalProductsSectionProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["coach-public-products", coachId],
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
        .eq("coach_id", coachId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DigitalProduct[];
    },
    enabled: !!coachId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Digital Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Digital Products ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
