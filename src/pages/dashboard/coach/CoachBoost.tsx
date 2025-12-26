import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BoostToggleCard } from "@/components/boost/BoostToggleCard";
import { BoostStatsCard } from "@/components/boost/BoostStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, CheckCircle2, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FeatureGate } from "@/components/FeatureGate";
import { useBoostSettings } from "@/hooks/useCoachBoost";
import { useNativePricing } from "@/hooks/useNativePricing";
import { useTranslation } from "@/hooks/useTranslation";

const CoachBoost = () => {
  const { t } = useTranslation('coach');
  const { data: settings } = useBoostSettings();
  const pricing = useNativePricing();
  
  // Get boost price from pricing config (uses native pricing on mobile apps)
  const boostPrice = pricing.prices.boost;
  const formattedBoostPrice = pricing.formatPrice(boostPrice);
  
  const commissionPercent = settings ? Math.round(settings.commission_rate * 100) : 30;
  const boostDuration = settings?.boost_duration_days || 30;
  
  // Calculate min/max fees using commission rate
  const minFeeBase = settings?.min_fee || 30;
  const maxFeeBase = settings?.max_fee || 100;
  const minFee = pricing.formatPrice(minFeeBase);
  const maxFee = pricing.formatPrice(maxFeeBase);
  const minCommission = pricing.formatPrice(Math.round(minFeeBase * (settings?.commission_rate || 0.3)));
  const maxCommission = pricing.formatPrice(Math.round(maxFeeBase * (settings?.commission_rate || 0.3)));
  
  return (
    <DashboardLayout>
      <FeatureGate feature="boost_marketing">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              {t('boostPage.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('boostPage.subtitle')}
            </p>
          </div>

          {/* Toggle Card */}
          <BoostToggleCard />

          {/* Stats */}
          <BoostStatsCard />

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {t('boostPage.howItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">{t('boostPage.step1Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('boostPage.step1Desc', { price: formattedBoostPrice, days: boostDuration })}
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">{t('boostPage.step2Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('boostPage.step2Desc', { percent: commissionPercent })}
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-1">{t('boostPage.step3Title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('boostPage.step3Desc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('boostPage.faq.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t('boostPage.faq.howMuchCost')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.howMuchCostAnswer', { 
                      price: formattedBoostPrice, 
                      days: boostDuration, 
                      percent: commissionPercent,
                      minFee,
                      maxFee,
                      minCommission,
                      maxCommission
                    })}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>{t('boostPage.faq.whatHappensAfter')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.whatHappensAfterAnswer', { days: boostDuration })}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>{t('boostPage.faq.clientNoShow')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.clientNoShowAnswer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>{t('boostPage.faq.repeatBookings')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.repeatBookingsAnswer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>{t('boostPage.faq.howToKnow')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.howToKnowAnswer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>{t('boostPage.faq.renewEarly')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.renewEarlyAnswer')}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>{t('boostPage.faq.packagesProducts')}</AccordionTrigger>
                  <AccordionContent>
                    {t('boostPage.faq.packagesProductsAnswer')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachBoost;