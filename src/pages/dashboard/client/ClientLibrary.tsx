import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Library, Package, BookOpen, Video, FileText, Headphones, Download, Play, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useMyLibrary, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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

export default function ClientLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: purchases, isLoading } = useMyLibrary();

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
                {purchases.map((purchase) => {
                  const item = purchase.digital_products || purchase.digital_bundles;
                  if (!item) return null;

                  const isBundle = !!purchase.digital_bundles;
                  const product = purchase.digital_products;
                  const contentType = product ? CONTENT_TYPES.find(t => t.value === product.content_type) : null;

                  return (
                    <Card key={purchase.id} className="overflow-hidden group">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {item.cover_image_url ? (
                          <img
                            src={item.cover_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        
                        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
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
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex gap-2">
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
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((purchase) => {
                  const product = purchase.digital_products;
                  if (!product) return null;
                  const contentType = CONTENT_TYPES.find(t => t.value === product.content_type);

                  return (
                    <Card key={purchase.id} className="overflow-hidden group">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {product.cover_image_url ? (
                          <img
                            src={product.cover_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-5xl">{contentType?.icon || "📦"}</span>
                          </div>
                        )}
                        
                        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
                          {getContentIcon(product.content_type)}
                          <span className="ml-1">{contentType?.label}</span>
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex gap-2">
                        {product.is_streamable && product.video_url && (
                          <Button size="sm" className="flex-1" asChild>
                            <a href={product.video_url} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </a>
                          </Button>
                        )}
                        {product.is_downloadable && product.content_url && (
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <a href={product.content_url} download>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="bundles">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bundles.map((purchase) => {
                  const bundle = purchase.digital_bundles;
                  if (!bundle) return null;

                  return (
                    <Card key={purchase.id} className="overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden">
                        {bundle.cover_image_url ? (
                          <img
                            src={bundle.cover_image_url}
                            alt={bundle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
                            <Package className="h-16 w-16 text-primary" />
                          </div>
                        )}
                        
                        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                          <Package className="h-3 w-3 mr-1" />
                          Bundle
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2">{bundle.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate(`/marketplace/bundles/${purchase.bundle_id}`)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Bundle Contents
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
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
