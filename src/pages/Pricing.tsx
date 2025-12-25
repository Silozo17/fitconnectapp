import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { Check, Zap, Star, Crown, Sparkles, Users, MessageSquare, Calendar, TrendingUp, Video, FileText, Shield, Percent } from "lucide-react";
import { SUBSCRIPTION_TIERS, TierKey, BillingInterval } from "@/lib/stripe-config";
import { cn } from "@/lib/utils";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { useCountry } from "@/hooks/useCountry";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  getPricingConfig, 
  getSubscriptionPrice, 
  getSubscriptionSavings,
  formatPrice,
  type SubscriptionTier 
} from "@/lib/pricing-config";

const tierIcons: Record<TierKey, typeof Zap> = {
  free: Sparkles,
  starter: Zap,
  pro: Star,
  enterprise: Crown,
  founder: Sparkles,
};

const Pricing = () => {
  const { t } = useTranslation('pages');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const { countryCode } = useCountry();

  const platformFeatures = [
    {
      icon: MessageSquare,
      title: t('pricing.platformFeatures.unlimitedMessaging.title'),
      description: t('pricing.platformFeatures.unlimitedMessaging.description')
    },
    {
      icon: Calendar,
      title: t('pricing.platformFeatures.easyScheduling.title'),
      description: t('pricing.platformFeatures.easyScheduling.description')
    },
    {
      icon: TrendingUp,
      title: t('pricing.platformFeatures.progressTracking.title'),
      description: t('pricing.platformFeatures.progressTracking.description')
    },
    {
      icon: Video,
      title: t('pricing.platformFeatures.videoSessions.title'),
      description: t('pricing.platformFeatures.videoSessions.description')
    },
    {
      icon: FileText,
      title: t('pricing.platformFeatures.customPlans.title'),
      description: t('pricing.platformFeatures.customPlans.description')
    },
    {
      icon: Shield,
      title: t('pricing.platformFeatures.securePayments.title'),
      description: t('pricing.platformFeatures.securePayments.description')
    }
  ];

  return (
    <PageLayout
      title={t('pricing.meta.title')}
      description={t('pricing.meta.description')}
    >
      {/* Decorative Avatars - placed at PageLayout level */}
      <DecorativeAvatar 
        avatarSlug="bodybuilder-bull" 
        position="top-right" 
        size="xl" 
        opacity={20}
        className="right-4 top-32 z-0"
      />
      <DecorativeAvatar 
        avatarSlug="hiit-fox" 
        position="bottom-left" 
        size="lg" 
        opacity={15}
        className="left-4 bottom-20 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            {t('pricing.hero.badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('pricing.hero.titleStart')}{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('pricing.hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('pricing.hero.description')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                billingInterval === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t('pricing.billing.monthly')}
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
                billingInterval === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t('pricing.billing.yearly')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                {t('pricing.billing.save')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {(Object.entries(SUBSCRIPTION_TIERS) as [TierKey, typeof SUBSCRIPTION_TIERS[TierKey]][])
              .filter(([_, tier]) => !tier.adminOnly)
              .map(([key, tier]) => {
              const Icon = tierIcons[key];
              const isPopular = tier.highlighted;
              const isFree = key === "free";
              
              // Use unified pricing config - no conversion needed
              const tierKeyForPricing = key as SubscriptionTier;
              const isSupportedTier = ['starter', 'pro', 'enterprise'].includes(key);
              const priceAmount = isSupportedTier 
                ? getSubscriptionPrice(countryCode, tierKeyForPricing, billingInterval)
                : 0;
              const savingsAmount = isSupportedTier && billingInterval === "yearly"
                ? getSubscriptionSavings(countryCode, tierKeyForPricing)
                : 0;

              return (
                <Card 
                  key={key} 
                  variant={isPopular ? "glass-elevated" : "glass"}
                  withInnerHighlight
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 flex flex-col",
                    isPopular && "ring-2 ring-primary/40"
                  )}
                >
                  {isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold">
                        {t('pricing.tiers.mostPopular')}
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      isFree 
                        ? "bg-muted" 
                        : "bg-gradient-to-br from-primary to-secondary"
                    )}>
                      <Icon className={cn("w-6 h-6", isFree ? "text-muted-foreground" : "text-white")} />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {isFree ? t('pricing.billing.free') : formatPrice(priceAmount, countryCode)}
                        </span>
                        {!isFree && (
                          <span className="text-muted-foreground">
                            /{billingInterval === "monthly" ? t('pricing.billing.perMonth') : t('pricing.billing.perYear')}
                          </span>
                        )}
                      </div>
                      {billingInterval === "yearly" && !isFree && savingsAmount > 0 && (
                        <p className="text-sm text-primary font-medium mt-1">
                          {t('pricing.billing.saveAmount', { amount: formatPrice(savingsAmount, countryCode) })}
                        </p>
                      )}
                    </div>

                    {/* Commission Rate - Prominent Display */}
                    <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Percent className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">
                        {t('pricing.tiers.platformFee', { percent: tier.commissionPercent })}
                      </span>
                    </div>

                    {/* Client Limit */}
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg glass-item">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-semibold">
                        {tier.clientLimit === null 
                          ? t('pricing.tiers.unlimitedClients')
                          : t('pricing.tiers.upToClients', { count: tier.clientLimit })}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.featureKeys.map((featureKey, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{t(featureKey)}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={isFree ? "/auth" : `/subscribe?tier=${key}&billing=${billingInterval}`} className="block mt-auto">
                      <GradientButton 
                        className="w-full" 
                        variant={isPopular ? "primary" : isFree ? "outline" : "primary"}
                      >
                        {isFree ? t('pricing.tiers.getStartedFree') : t('pricing.tiers.subscribeNow')}
                      </GradientButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('pricing.platformFeatures.title')}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('pricing.platformFeatures.titleHighlight')}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.platformFeatures.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <Card key={index} variant="glass" withInnerHighlight className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('pricing.cta.title')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('pricing.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscribe">
                <GradientButton size="lg">{t('pricing.cta.getStarted')}</GradientButton>
              </Link>
              <Link to="/faq">
                <GradientButton size="lg" variant="outline">{t('pricing.cta.viewFaq')}</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Pricing;