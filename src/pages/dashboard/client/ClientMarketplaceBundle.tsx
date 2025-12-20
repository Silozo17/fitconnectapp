import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Percent, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useDigitalBundle, useHasPurchased, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { formatCurrency } from "@/lib/currency";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useMarketplaceLinkPrefix } from "@/hooks/useMarketplaceLinkPrefix";

export default function ClientMarketplaceBundle() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();
  const coachLinkPrefix = useCoachLinkPrefix();
  const marketplaceLinkPrefix = useMarketplaceLinkPrefix();

  const { data: bundle, isLoading } = useDigitalBundle(bundleId || "");
  const { data: hasPurchased } = useHasPurchased(undefined, bundleId);

  const savings = bundle?.original_price 
    ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100)
    : 0;

  const handlePurchase = () => {
    // Navigate to embedded checkout page with internal return URL
    const params = new URLSearchParams({
      type: "digital-bundle",
      itemId: bundle?.id || "",
      returnUrl: `${marketplaceLinkPrefix}/bundles/${bundleId}`,
    });
    navigate(`/checkout?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </ClientDashboardLayout>
    );
  }

  if (!bundle) {
    return (
      <ClientDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Bundle Not Found</h1>
          <Button onClick={() => navigate(marketplaceLinkPrefix)}>Back to Marketplace</Button>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(marketplaceLinkPrefix)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-card">
              {bundle.cover_image_url ? (
                <img
                  src={bundle.cover_image_url}
                  alt={bundle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
                  <Package className="h-24 w-24 text-primary" />
                </div>
              )}
            </div>

            {/* Bundle Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-accent text-accent-foreground">
                  <Package className="h-3 w-3 mr-1" />
                  Bundle
                </Badge>
                {savings > 0 && (
                  <Badge className="bg-green-500 text-white">
                    <Percent className="h-3 w-3 mr-1" />
                    Save {savings}%
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{bundle.title}</h1>
              
              {bundle.description && (
                <p className="text-muted-foreground text-lg">{bundle.description}</p>
              )}
            </div>

            {/* Included Products */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included ({bundle.products?.length || 0} items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bundle.products?.map((product) => {
                  const contentType = CONTENT_TYPES.find(t => t.value === product.content_type);
                  return (
                    <div 
                      key={product.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                      onClick={() => navigate(`${marketplaceLinkPrefix}/${product.slug || product.id}`)}
                    >
                      <div className="w-20 h-14 rounded-md overflow-hidden flex-shrink-0">
                        {product.cover_image_url ? (
                          <img
                            src={product.cover_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            {contentType ? <contentType.icon className="h-6 w-6 text-muted-foreground" /> : <span className="text-2xl">📦</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {contentType?.label}
                          </Badge>
                        </div>
                        <h3 className="font-medium truncate">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.short_description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Included
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  {bundle.original_price && bundle.original_price > bundle.price && (
                    <p className="text-lg text-muted-foreground line-through">
                      {formatCurrency(bundle.original_price, (bundle.currency || "GBP") as "GBP" | "USD" | "EUR")}
                    </p>
                  )}
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(bundle.price, (bundle.currency || "GBP") as "GBP" | "USD" | "EUR")}
                  </p>
                  {savings > 0 && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      You save {formatCurrency((bundle.original_price || 0) - bundle.price, (bundle.currency || "GBP") as "GBP" | "USD" | "EUR")}
                    </Badge>
                  )}
                </div>

                {hasPurchased ? (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={() => navigate("/dashboard/client/library")}>
                      <Check className="h-4 w-4 mr-2" />
                      Go to Library
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      You already own this bundle
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchase}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Bundle
                  </Button>
                )}

                <Separator />

                {/* Coach Info */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Created by</p>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2"
                    onClick={() => navigate(`${coachLinkPrefix}/${bundle.coach_profiles?.username || bundle.coach_id}`)}
                  >
                    <UserAvatar
                      name={bundle.coach_profiles?.display_name || "Coach"}
                      src={bundle.coach_profiles?.profile_image_url}
                      className="h-10 w-10"
                    />
                    <div>
                      <p className="font-medium">{bundle.coach_profiles?.display_name}</p>
                      <p className="text-xs text-muted-foreground">View Profile</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bundle Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">{bundle.products?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Items</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-green-500">{savings}%</p>
                    <p className="text-xs text-muted-foreground">Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
