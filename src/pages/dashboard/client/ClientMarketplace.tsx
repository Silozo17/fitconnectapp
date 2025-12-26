import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Package, Grid, List, BookOpen, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useMarketplaceProducts, useMarketplaceBundles, useFeaturedProducts, CONTENT_CATEGORIES, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import ProductCard from "@/components/marketplace/ProductCard";
import BundleCard from "@/components/marketplace/BundleCard";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

export default function ClientMarketplace() {
  const { t } = useTranslation("client");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products, isLoading: productsLoading } = useMarketplaceProducts({
    category: category !== "all" ? category : undefined,
    contentType: contentType !== "all" ? contentType : undefined,
    search: search || undefined,
  });

  const { data: bundles, isLoading: bundlesLoading } = useMarketplaceBundles();
  const { data: featuredProducts } = useFeaturedProducts();

  const freeProducts = products?.filter(p => p.price === 0) || [];

  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_marketplace"
        title="Digital Fitness Content"
        description="Browse and purchase guides, programs, and resources from coaches"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8 text-primary" />
              {t('marketplace.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('marketplace.subtitle')}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('marketplace.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Featured Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-4 px-4 -mx-4 border-y border-border bg-card/50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-primary">⭐</span> Featured Content
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CONTENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONTENT_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="free">Free Resources</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 rounded-lg bg-card animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No content found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="free" className="space-y-6">
            {freeProducts.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {freeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No free content available</h3>
                <p className="text-muted-foreground">
                  Check back later for free resources
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bundles" className="space-y-6">
            {bundlesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-96 rounded-lg bg-card animate-pulse" />
                ))}
              </div>
            ) : bundles && bundles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bundles available</h3>
                <p className="text-muted-foreground">
                  Bundles offer great value with multiple products
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
