import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Library, Package, BookOpen, Video, FileText, Headphones, Download, Play, ExternalLink, Lock, RefreshCcw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useMyLibrary, CONTENT_TYPES, ContentPurchase } from "@/hooks/useDigitalProducts";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";

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

const isExpired = (purchase: ContentPurchase) => {
  if (!purchase.access_expires_at) return false;
  return new Date(purchase.access_expires_at) < new Date();
};

export default function ClientLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: purchases, isLoading } = useMyLibrary();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // Show success toast if redirected after purchase
  useEffect(() => {
    const purchased = searchParams.get("purchased");
    if (purchased) {
      toast({
        title: "Purchase successful!",
        description: "Your content is now available in your library.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/client/library");
    }
  }, [searchParams, toast]);

  const products = purchases?.filter(p => p.digital_products) || [];
  const bundles = purchases?.filter(p => p.digital_bundles) || [];

  const handleBuyAgain = async (purchase: ContentPurchase) => {
    const product = purchase.digital_products;
    if (!product) return;

    setCheckingOut(purchase.id);
    try {
      const { data, error } = await supabase.functions.invoke("content-checkout", {
        body: {
          productId: product.id,
          successUrl: `${window.location.origin}/dashboard/client/library?purchased=${product.id}`,
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
      setCheckingOut(null);
    }
  };

  const renderPurchaseCard = (purchase: ContentPurchase, isBundle: boolean = false) => {
    const item = purchase.digital_products || purchase.digital_bundles;
    if (!item) return null;

    const product = purchase.digital_products;
    const contentType = product ? CONTENT_TYPES.find(t => t.value === product.content_type) : null;
    const expired = isExpired(purchase);
    const hasAccess = !expired;

    return (
      <Card key={purchase.id} className={`overflow-hidden group ${expired ? 'opacity-75' : ''}`}>
        <div className="aspect-[4/3] relative overflow-hidden">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt={item.title}
              className={`w-full h-full object-cover ${hasAccess ? 'group-hover:scale-105' : 'grayscale'} transition-transform duration-300`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {isBundle ? (
                <Package className="h-12 w-12 text-primary" />
              ) : (
                <span className="text-5xl">{contentType?.icon || "📦"}</span>
              )}
            </div>
          )}
          
          {/* Lock overlay for expired content */}
          {expired && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Access Expired</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <Badge className="bg-background/80 backdrop-blur-sm">
              {isBundle ? (
                <>
                  <Package className="h-3 w-3 mr-1" />
                  Bundle
                </>
              ) : (
                <>
                  {getContentIcon(product?.content_type || "")}
                  <span className="ml-1">{contentType?.label}</span>
                </>
              )}
            </Badge>
            {expired && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Expired
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2">{item.title}</h3>
          <p className="text-xs text-muted-foreground mt-2">
            Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
          </p>
          {purchase.access_expires_at && (
            <p className={`text-xs mt-1 ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
              {expired ? 'Expired' : 'Expires'}: {new Date(purchase.access_expires_at).toLocaleDateString()}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          {expired ? (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleBuyAgain(purchase)}
              disabled={checkingOut === purchase.id}
            >
              {checkingOut === purchase.id ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-1" />
              )}
              Buy Again {product && product.price > 0 && `(${formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")})`}
            </Button>
          ) : (
            <>
              {product?.is_streamable && product?.video_url && (
                <Button size="sm" className="flex-1" asChild>
                  <a href={product.video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-1" />
                    Watch
                  </a>
                </Button>
              )}
              {product?.is_downloadable && product?.content_url && (
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={product.content_url} download>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              )}
              {isBundle && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/marketplace/bundles/${purchase.bundle_id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Bundle
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Library className="h-8 w-8 text-primary" />
              My Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Access your purchased content
            </p>
          </div>
          <Button onClick={() => navigate("/marketplace")}>
            Browse Marketplace
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        ) : purchases && purchases.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({purchases.length})</TabsTrigger>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="bundles">Bundles ({bundles.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {purchases.map((purchase) => renderPurchaseCard(purchase, !!purchase.digital_bundles))}
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((purchase) => renderPurchaseCard(purchase, false))}
              </div>
            </TabsContent>

            <TabsContent value="bundles">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bundles.map((purchase) => renderPurchaseCard(purchase, true))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your library is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse our marketplace to discover e-books, video courses, templates, and more from top coaches.
              </p>
              <Button onClick={() => navigate("/marketplace")} size="lg">
                Explore Marketplace
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ClientDashboardLayout>
  );
}