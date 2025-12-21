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
import { useActivePricing } from "@/hooks/useActivePricing";

const CoachBoost = () => {
  const { data: settings } = useBoostSettings();
  const pricing = useActivePricing();
  
  // Get boost price from pricing config (no conversion)
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
              Boost
            </h1>
            <p className="text-muted-foreground">
              Get more visibility and attract new clients
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
                How Boost Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">Purchase Boost</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay {formattedBoostPrice} for {boostDuration} days of priority visibility in search results.
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">Get New Clients</h3>
                  <p className="text-sm text-muted-foreground">
                    When new clients find you via Boost and book their first session, you pay a {commissionPercent}% commission.
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-1">Keep 100% Forever</h3>
                  <p className="text-sm text-muted-foreground">
                    All future bookings from that client are 100% yours. No more Boost fees for repeat clients.
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
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How much does Boost cost?</AccordionTrigger>
                  <AccordionContent>
                    Boost costs {formattedBoostPrice} for {boostDuration} days. This is a one-time payment with no auto-renewal. Additionally, when Boost brings you a NEW client, you pay {commissionPercent}% of their first session booking. Bookings under {minFee} are calculated at {minFee} (minimum fee: {minCommission}). Bookings over {maxFee} are capped at {maxFee} (maximum fee: {maxCommission}).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What happens after 30 days?</AccordionTrigger>
                  <AccordionContent>
                    After {boostDuration} days, your Boost expires and you'll return to normal search ranking. There's no auto-renewal - you'll need to purchase Boost again if you want to continue appearing first in results.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What if a client doesn't show up?</AccordionTrigger>
                  <AccordionContent>
                    If a client acquired via Boost doesn't show up for their first appointment, you can mark them as a no-show and the commission fee will be waived. We want you to only pay for real results.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Do I pay commission for repeat bookings?</AccordionTrigger>
                  <AccordionContent>
                    No! You only pay the Boost commission on a client's FIRST session booking with you. All subsequent bookings from that client are 100% yours with no additional fees.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I know which clients came from Boost?</AccordionTrigger>
                  <AccordionContent>
                    All clients acquired through Boost are tracked in your "Recent Acquisitions" list above. You can see exactly when they found you, their first booking amount, and the commission charged.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I renew before my Boost expires?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can purchase a new Boost period when your current one is about to expire. The new period will start when your current one ends, giving you continuous visibility.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Does Boost apply to package purchases or digital products?</AccordionTrigger>
                  <AccordionContent>
                    Boost commission only applies to individual session bookings. If a new client purchases a session package or digital product (e.g., training plans, e-books), no commission is charged. Boost is designed to help you acquire clients through 1-on-1 session bookings.
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
