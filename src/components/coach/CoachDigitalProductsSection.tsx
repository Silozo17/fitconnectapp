import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import ProductCard from "@/components/marketplace/ProductCard";
import { DigitalProduct } from "@/hooks/useDigitalProducts";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachDigitalProductsSectionProps {
  coachId: string;
}

export function CoachDigitalProductsSection({ coachId }: CoachDigitalProductsSectionProps) {
  const { t } = useTranslation('coaches');
  
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
      <ContentSection colorTheme="purple">
        <ContentSectionHeader
          icon={Package}
          title={t('profile.digitalProducts')}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[16/9] rounded-lg" />
          ))}
        </div>
      </ContentSection>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <ContentSection colorTheme="purple">
      <ContentSectionHeader
        icon={Package}
        title={`${t('profile.digitalProducts')} (${products.length})`}
      />
      
      <div className="pt-4">
        {products.length <= 3 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: products.length > 3,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-3 basis-1/2 md:basis-1/3">
                  <ProductCard product={product} compact />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        )}
      </div>
    </ContentSection>
  );
}
