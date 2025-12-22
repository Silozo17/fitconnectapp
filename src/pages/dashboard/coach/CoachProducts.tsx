import { useState } from "react";
import { Plus, Package, MoreVertical, Pencil, Trash2, Eye, EyeOff, Star, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateProductModal from "@/components/marketplace/CreateProductModal";
import CreateBundleModal from "@/components/marketplace/CreateBundleModal";
import BulkEditPricesModal from "@/components/marketplace/BulkEditPricesModal";
import { useCoachProducts, useCoachBundles, useDeleteProduct, useDeleteBundle, useUpdateProduct, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/hooks/useTranslation";

export default function CoachProducts() {
  const { t } = useTranslation('coach');
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteBundleId, setDeleteBundleId] = useState<string | null>(null);

  const { data: products, isLoading: productsLoading } = useCoachProducts();
  const { data: bundles, isLoading: bundlesLoading } = useCoachBundles();
  const deleteProduct = useDeleteProduct();
  const deleteBundle = useDeleteBundle();
  const updateProduct = useUpdateProduct();

  const publishedProducts = products?.filter(p => p.is_published) || [];
  const draftProducts = products?.filter(p => !p.is_published) || [];
  const publishedBundles = bundles?.filter(b => b.is_published) || [];
  const draftBundles = bundles?.filter(b => !b.is_published) || [];

  const handleTogglePublish = (productId: string, currentStatus: boolean) => {
    updateProduct.mutate({ id: productId, is_published: !currentStatus });
  };

  const handleToggleFeatured = (productId: string, currentStatus: boolean) => {
    updateProduct.mutate({ id: productId, is_featured: !currentStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              {t('productsPage.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('productsPage.subtitle')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {products && products.length > 0 && (
              <Button variant="outline" onClick={() => setShowBulkEdit(true)}>
                <DollarSign className="h-4 w-4 mr-2" />
                {t('productsPage.bulkEditPrices')}
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowCreateBundle(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('productsPage.createBundle')}
            </Button>
            <Button onClick={() => setShowCreateProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('productsPage.createProduct')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{products?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{t('productsPage.totalProducts')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{publishedProducts.length}</p>
              <p className="text-sm text-muted-foreground">{t('productsPage.published')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">{draftProducts.length}</p>
              <p className="text-sm text-muted-foreground">{t('productsPage.drafts')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-accent">{bundles?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{t('productsPage.bundles')}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">{t('productsPage.products')} ({products?.length || 0})</TabsTrigger>
            <TabsTrigger value="bundles">{t('productsPage.bundles')} ({bundles?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-card animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const contentType = CONTENT_TYPES.find(t => t.value === product.content_type);
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        {product.cover_image_url ? (
                          <img
                            src={product.cover_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            {contentType ? <contentType.icon className="h-10 w-10 text-primary/50" /> : <span className="text-4xl">📦</span>}
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="secondary" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleTogglePublish(product.id, product.is_published)}>
                                {product.is_published ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    {t('productsPage.unpublish')}
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t('productsPage.publish')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(product.id, product.is_featured)}>
                                <Star className={`h-4 w-4 mr-2 ${product.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                                {product.is_featured ? t('productsPage.removeFeatured') : t('productsPage.markFeatured')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('productsPage.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="absolute top-2 left-2 flex gap-1">
                          {!product.is_published && (
                            <Badge variant="secondary">{t('productsPage.draft')}</Badge>
                          )}
                          {product.is_featured && (
                            <Badge className="bg-yellow-500 text-black">⭐ {t('productsPage.featured')}</Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {contentType && <contentType.icon className="h-3 w-3" />}
                            {contentType?.label}
                          </Badge>
                          <span className="font-bold text-primary">
                            {product.price === 0 ? t('productsPage.free') : formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                          </span>
                        </div>
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.short_description || product.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {product.download_count} {t('productsPage.downloads')}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('productsPage.noProducts')}</h2>
                  <p className="text-muted-foreground mb-6">
                    {t('productsPage.noProductsDesc')}
                  </p>
                  <Button onClick={() => setShowCreateProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('productsPage.createProduct')}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            {bundlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-card animate-pulse" />
                ))}
              </div>
            ) : bundles && bundles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bundles.map((bundle) => (
                  <Card key={bundle.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      {bundle.cover_image_url ? (
                        <img
                          src={bundle.cover_image_url}
                          alt={bundle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
                          <Package className="h-12 w-12 text-primary" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteBundleId(bundle.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('productsPage.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {!bundle.is_published && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          {t('productsPage.draft')}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-accent text-accent-foreground text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          {t('productsPage.bundle')}
                        </Badge>
                        <span className="font-bold text-primary">
                          {formatCurrency(bundle.price, (bundle.currency || "GBP") as "GBP" | "USD" | "EUR")}
                        </span>
                      </div>
                      <h3 className="font-semibold line-clamp-1">{bundle.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {bundle.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('productsPage.noBundles')}</h2>
                  <p className="text-muted-foreground mb-6">
                    {t('productsPage.noBundlesDesc')}
                  </p>
                  <Button onClick={() => setShowCreateBundle(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('productsPage.createBundle')}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateProductModal 
        open={showCreateProduct} 
        onOpenChange={setShowCreateProduct} 
      />
      
      <CreateBundleModal 
        open={showCreateBundle} 
        onOpenChange={setShowCreateBundle}
        products={products || []}
      />

      <BulkEditPricesModal
        open={showBulkEdit}
        onOpenChange={setShowBulkEdit}
        products={products || []}
      />

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('productsPage.deleteProduct')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('productsPage.deleteProductConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('productsPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteProductId) {
                  deleteProduct.mutate(deleteProductId);
                  setDeleteProductId(null);
                }
              }}
            >
              {t('productsPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bundle Confirmation */}
      <AlertDialog open={!!deleteBundleId} onOpenChange={() => setDeleteBundleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('productsPage.deleteBundle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('productsPage.deleteBundleConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('productsPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteBundleId) {
                  deleteBundle.mutate(deleteBundleId);
                  setDeleteBundleId(null);
                }
              }}
            >
              {t('productsPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}