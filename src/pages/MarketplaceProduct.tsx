import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Video, FileText, Headphones, Package, Star, 
  Clock, FileDown, Play, ShoppingCart, Check, User, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageLayout from "@/components/layout/PageLayout";
import { useDigitalProduct, useProductReviews, useHasPurchased, CONTENT_TYPES, CONTENT_CATEGORIES } from "@/hooks/useDigitalProducts";
import { formatCurrency } from "@/lib/currency";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/reviews/StarRating";

const getContentIcon = (type: string) => {
  switch (type) {
    case "ebook": return <BookOpen className="h-5 w-5" />;
    case "video_course":
    case "single_video": return <Video className="h-5 w-5" />;
    case "template": return <FileText className="h-5 w-5" />;
    case "audio": return <Headphones className="h-5 w-5" />;
    default: return <Package className="h-5 w-5" />;
  }
};

export default function MarketplaceProduct() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: product, isLoading } = useDigitalProduct(productId || "");
  const { data: reviews } = useProductReviews(productId || "");
  const { data: hasPurchased } = useHasPurchased(productId);

  const contentType = CONTENT_TYPES.find(t => t.value === product?.content_type);
  const category = CONTENT_CATEGORIES.find(c => c.value === product?.category);

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handlePurchase = async () => {
    if (!user) {
      navigate("/auth?redirect=/marketplace/" + productId);
      return;
    }

    if (product?.price === 0) {
      // Free content - create purchase record directly
      const { error } = await supabase
        .from("content_purchases")
        .insert({
          user_id: user.id,
          product_id: product.id,
          coach_id: product.coach_id,
          amount_paid: 0,
          currency: product.currency,
        });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Content added to your library!" });
        navigate("/dashboard/client/library");
      }
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-checkout", {
        body: {
          productId: product?.id,
          successUrl: `${window.location.origin}/dashboard/client/library?purchased=${product?.id}`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading..." description="Loading product details">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout title="Product Not Found" description="The product you're looking for doesn't exist">
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <Button onClick={() => navigate("/marketplace")}>Back to Marketplace</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={product.title} description={product.short_description || product.description || "Digital content from FitConnect"}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mb-6 mt-4 md:mt-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover Image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-card">
                {product.cover_image_url ? (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {contentType ? <contentType.icon className="h-20 w-20 text-primary/50" /> : <span className="text-8xl">📦</span>}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary">
                    {getContentIcon(product.content_type)}
                    <span className="ml-1">{contentType?.label}</span>
                  </Badge>
                  {category && (
                    <Badge variant="outline">
                      {category.icon} {category.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {product.difficulty_level}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

                {/* Rating */}
                {reviews && reviews.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={averageRating} reviewCount={reviews.length} />
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  {product.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {product.duration_minutes} minutes
                    </span>
                  )}
                  {product.page_count && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {product.page_count} pages
                    </span>
                  )}
                  {product.is_downloadable && (
                    <span className="flex items-center gap-1">
                      <FileDown className="h-4 w-4" />
                      Downloadable
                    </span>
                  )}
                  {product.is_streamable && (
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      Streamable
                    </span>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-wrap">{product.description}</p>
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  {product.preview_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {product.content_type.includes("video") ? (
                          <video
                            src={product.preview_url}
                            controls
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <a
                            href={product.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Preview
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-8 w-8 p-1 rounded-full bg-muted" />
                              <div>
                                <p className="font-medium">User</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} showCount={false} />
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          )}
                          {review.is_verified_purchase && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No reviews yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    {product.price === 0 ? (
                      <Badge className="text-lg px-4 py-2 bg-green-500 text-white">
                        FREE
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <p className="text-lg text-muted-foreground line-through">
                            {formatCurrency(product.compare_at_price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                          </p>
                        )}
                        <p className="text-4xl font-bold text-primary">
                          {formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                        </p>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <Badge variant="destructive" className="mt-2">
                            Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preview Button */}
                  {product.preview_url && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Watch Free Preview
                    </Button>
                  )}

                  {hasPurchased ? (
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={() => navigate("/dashboard/client/library")}>
                        <Check className="h-4 w-4 mr-2" />
                        Go to Library
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        You already own this content
                      </p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      )}
                      {product.price === 0 ? "Get for Free" : "Purchase Now"}
                    </Button>
                  )}

                  <Separator />

                  {/* Coach Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Created by</p>
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2"
                      onClick={() => navigate(`/coaches/${product.coach_profiles?.username || product.coach_id}`)}
                    >
                      <UserAvatar
                        name={product.coach_profiles?.display_name || "Coach"}
                        src={product.coach_profiles?.profile_image_url}
                        className="h-10 w-10"
                      />
                      <div>
                        <p className="font-medium">{product.coach_profiles?.display_name}</p>
                        <p className="text-xs text-muted-foreground">View Profile</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview: {product.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              {product.preview_url && (
                product.preview_url.includes("youtube") || product.preview_url.includes("youtu.be") ? (
                  <iframe
                    src={product.preview_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : product.preview_url.includes("vimeo") ? (
                  <iframe
                    src={product.preview_url.replace("vimeo.com/", "player.vimeo.com/video/")}
                    className="w-full h-full rounded-lg"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={product.preview_url}
                    controls
                    className="w-full h-full rounded-lg"
                  />
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
