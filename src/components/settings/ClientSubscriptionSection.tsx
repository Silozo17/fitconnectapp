import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Info, Check, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_TIERS, TierKey } from "@/lib/stripe-config";
import { useNativePricing } from "@/hooks/useNativePricing";
import { SubscriptionTier } from "@/lib/pricing-config";
import BecomeCoachModal from "@/components/shared/BecomeCoachModal";
import { LegalDisclosure } from "@/components/shared/LegalLinks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/**
 * Client Subscription Section - shows available plans in read-only mode
 * Required for iOS App Store compliance (Guideline 2.1 - discoverable subscriptions)
 * 
 * Clients can view subscription tiers but cannot purchase them.
 * Includes a CTA to become a coach to unlock subscriptions.
 */
export const ClientSubscriptionSection = () => {
  const { t } = useTranslation('settings');
  const [showBecomeCoachModal, setShowBecomeCoachModal] = useState(false);
  const pricing = useNativePricing();
  const isMobile = useIsMobile();

  // Display only the paid tiers (starter, pro, enterprise)
  const displayTiers: TierKey[] = ['starter', 'pro', 'enterprise'];

  const renderTierCard = (tierKey: TierKey) => {
    const tier = SUBSCRIPTION_TIERS[tierKey];
    return (
      <div
        key={tierKey}
        className={cn(
          "border rounded-lg p-4 opacity-60 pointer-events-none h-full",
          tier.highlighted && "ring-2 ring-primary/30"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{tier.name}</h3>
              {tier.highlighted && (
                <Badge variant="secondary" className="text-xs">
                  {t('subscription.popular', 'Popular')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">
              {pricing.formatPrice(pricing.getSubscriptionPrice(tierKey as SubscriptionTier, 'monthly'))}
            </div>
            <div className="text-xs text-muted-foreground">/month</div>
          </div>
        </div>

        <ul className="space-y-1 mb-4">
          {tier.features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button variant="outline" className="w-full" disabled>
          {t('subscription.forCoaches', 'For Coach Accounts')}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">
                {t('subscription.clientInfo.title', 'Subscriptions are for Coach accounts')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('subscription.clientInfo.description', 'Client accounts are always free. Premium subscriptions unlock advanced features for coaches to grow their business.')}
              </p>
              <Button 
                onClick={() => setShowBecomeCoachModal(true)}
                className="mt-2"
                variant="default"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {t('subscription.clientInfo.becomeCoach', 'Switch to Coach Account')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Tiers (Disabled/Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('subscription.availablePlans', 'Available Plans')}
          </CardTitle>
          <CardDescription>
            {t('subscription.availablePlansDesc', 'Premium features available when you become a coach')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile: Carousel, Desktop: Stack */}
          {isMobile ? (
            <Carousel className="w-full" opts={{ align: "start" }}>
              <CarouselContent className="-ml-2">
                {displayTiers.map((tierKey) => (
                  <CarouselItem key={tierKey} className="pl-2 basis-[85%]">
                    {renderTierCard(tierKey)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-1 mt-4">
                {displayTiers.map((_, idx) => (
                  <div key={idx} className="w-2 h-2 rounded-full bg-muted" />
                ))}
              </div>
            </Carousel>
          ) : (
            <div className="space-y-4">
              {displayTiers.map(renderTierCard)}
            </div>
          )}
          
          {/* Legal disclosure - always visible below carousel */}
          <LegalDisclosure className="mt-6 pt-4 border-t" />
        </CardContent>
      </Card>

      <BecomeCoachModal 
        open={showBecomeCoachModal} 
        onOpenChange={setShowBecomeCoachModal} 
      />
    </div>
  );
};

export default ClientSubscriptionSection;