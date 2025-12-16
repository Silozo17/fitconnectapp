import { useNavigate } from "react-router-dom";
import { Package, Percent } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DigitalBundle } from "@/hooks/useDigitalProducts";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface BundleCardProps {
  bundle: DigitalBundle;
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const navigate = useNavigate();
  const savings = bundle.original_price 
    ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100) : 0;

  return (
    <Card 
      className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
      onClick={() => navigate(`/marketplace/bundles/${bundle.id}`)}
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        {bundle.cover_image_url ? (
          <img src={bundle.cover_image_url} alt={bundle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
            <Package className="h-16 w-16 text-primary" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
          <Package className="h-3 w-3 mr-1" />Bundle
        </Badge>
        {savings > 0 && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            <Percent className="h-3 w-3 mr-1" />Save {savings}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
          {bundle.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{bundle.description}</p>
        {bundle.products && bundle.products.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Includes {bundle.products.length} items:</p>
            <div className="flex flex-wrap gap-1">
              {bundle.products.slice(0, 3).map((product) => (
                <Badge key={product.id} variant="outline" className="text-xs">{product.title}</Badge>
              ))}
              {bundle.products.length > 3 && (
                <Badge variant="outline" className="text-xs">+{bundle.products.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar name={bundle.coach_profiles?.display_name || "Coach"} src={bundle.coach_profiles?.profile_image_url} className="h-6 w-6" />
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">{bundle.coach_profiles?.display_name || "Unknown"}</span>
        </div>
        <div className="text-right">
          {bundle.original_price && bundle.original_price > bundle.price && (
            <span className="text-sm text-muted-foreground line-through mr-2">{formatCurrency(bundle.original_price, bundle.currency as CurrencyCode)}</span>
          )}
          <span className="text-lg font-bold text-primary">{formatCurrency(bundle.price, bundle.currency as CurrencyCode)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
