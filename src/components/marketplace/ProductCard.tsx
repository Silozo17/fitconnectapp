import { useNavigate } from "react-router-dom";
import { BookOpen, Video, FileText, Headphones, Package, Clock, FileDown, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DigitalProduct, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface ProductCardProps {
  product: DigitalProduct;
  viewMode?: "grid" | "list";
}

const getContentIcon = (type: string) => {
  switch (type) {
    case "ebook": return <BookOpen className="h-4 w-4" />;
    case "video_course":
    case "single_video": return <Video className="h-4 w-4" />;
    case "template": return <FileText className="h-4 w-4" />;
    case "audio": return <Headphones className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const navigate = useNavigate();
  const contentType = CONTENT_TYPES.find(t => t.value === product.content_type);

  if (viewMode === "list") {
    return (
      <Card 
        className="flex flex-row overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
        onClick={() => navigate(`/marketplace/${product.id}`)}
      >
        <div className="w-48 h-32 flex-shrink-0">
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {getContentIcon(product.content_type)}
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {contentType?.icon} {contentType?.label}
              </Badge>
              {product.price === 0 && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">FREE</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.short_description || product.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 pt-2">
              <UserAvatar
                name={product.coach_profiles?.display_name || "Coach"}
                src={product.coach_profiles?.profile_image_url}
                variant="squircle"
                size="2xs"
              />
              <span className="text-sm text-muted-foreground">
                {product.coach_profiles?.display_name || "Unknown Coach"}
              </span>
            </div>
            <span className="text-lg font-bold text-primary">
              {product.price === 0 ? "Free" : formatCurrency(product.price, product.currency as CurrencyCode)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
      onClick={() => navigate(`/marketplace/${product.id}`)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Package className="w-12 h-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {getContentIcon(product.content_type)}
            <span className="ml-1">{contentType?.label}</span>
          </Badge>
        </div>
        {product.price === 0 && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">FREE</Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute bottom-3 left-3 bg-yellow-500/90 text-black flex items-center gap-1">
            <Star className="w-3 h-3" /> Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {product.short_description || product.description}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {product.duration_minutes && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{product.duration_minutes} min</span>
          )}
          {product.page_count && (
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{product.page_count} pages</span>
          )}
          {product.is_downloadable && (
            <span className="flex items-center gap-1"><FileDown className="h-3 w-3" />Download</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 pt-2">
          <UserAvatar
            name={product.coach_profiles?.display_name || "Coach"}
            src={product.coach_profiles?.profile_image_url}
            variant="squircle"
            size="2xs"
          />
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {product.coach_profiles?.display_name || "Unknown"}
          </span>
        </div>
        <span className="text-lg font-bold text-primary">
          {product.price === 0 ? "Free" : formatCurrency(product.price, product.currency as CurrencyCode)}
        </span>
      </CardFooter>
    </Card>
  );
}
