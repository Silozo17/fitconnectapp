import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Package, BookOpen, Video, FileText, Headphones, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/layout/PageLayout";
import { useMarketplaceProducts, useMarketplaceBundles, useFeaturedProducts, CONTENT_CATEGORIES, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import ProductCard from "@/components/marketplace/ProductCard";
import BundleCard from "@/components/marketplace/BundleCard";

export default function Marketplace() {
  const navigate = useNavigate();
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
  const paidProducts = products?.filter(p => p.price > 0) || [];

  return (
    <PageLayout title="Marketplace - Digital Content" description="Discover e-books, video courses, workout templates, and more from top fitness professionals.">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Digital Content Marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Level Up Your Training with{" "}
                <span className="text-primary">Expert Resources</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover e-books, video courses, workout templates, and more from top fitness professionals.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-14 text-lg bg-card border-border"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-12 border-y border-border bg-card/50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-primary">⭐</span> Featured Content
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
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

            <Tabs defaultValue="all" className="space-y-8">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="all">All Content</TabsTrigger>
                <TabsTrigger value="free">Free Resources</TabsTrigger>
                <TabsTrigger value="bundles">Bundles</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
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

              <TabsContent value="free" className="space-y-8">
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

              <TabsContent value="bundles" className="space-y-8">
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
        </section>

        {/* Content Type Icons Section */}
        <section className="py-12 bg-card/50 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Browse by Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setContentType(type.value);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex flex-col items-center justify-center gap-1 sm:gap-2 min-h-[90px] sm:min-h-[110px] p-3 sm:p-4 lg:p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl">{type.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-center line-clamp-2">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
