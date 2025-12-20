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
import { formatCurrency } from "@/lib/currency";

const CoachBoost = () => {
  const { data: settings } = useBoostSettings();
  
  const commissionPercent = settings ? Math.round(settings.commission_rate * 100) : 30;
  const minFee = settings ? formatCurrency(settings.min_fee, "GBP") : "£30";
  const maxFee = settings ? formatCurrency(settings.max_fee, "GBP") : "£100";
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
                  <h3 className="font-semibold mb-1">Enable Boost</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle Boost on to start appearing at the top of search results with a "Sponsored" badge.
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">Get New Clients</h3>
                  <p className="text-sm text-muted-foreground">
                    When new clients find you via Boost and book their first session, you pay a one-time fee.
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
                    There's no monthly fee. You only pay when Boost brings you a NEW client. The fee is {commissionPercent}% of their first session booking. Bookings under {minFee} are calculated at {minFee} (minimum fee: {settings ? formatCurrency(settings.min_fee * settings.commission_rate, "GBP") : "£9"}). Bookings over {maxFee} are capped at {maxFee} (maximum fee: {settings ? formatCurrency(settings.max_fee * settings.commission_rate, "GBP") : "£30"}).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What if a client doesn't show up?</AccordionTrigger>
                  <AccordionContent>
                    If a client acquired via Boost doesn't show up for their first appointment, you can mark them as a no-show and the fee will be waived. We want you to only pay for real results.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Do I pay for repeat bookings?</AccordionTrigger>
                  <AccordionContent>
                    No! You only pay the Boost fee on a client's FIRST session booking with you. All subsequent bookings from that client are 100% yours with no additional Boost fees.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I know which clients came from Boost?</AccordionTrigger>
                  <AccordionContent>
                    All clients acquired through Boost are tracked in your "Recent Acquisitions" list above. You can see exactly when they found you, their first booking amount, and the fee charged.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I turn Boost off anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can enable or disable Boost at any time with no penalty. When Boost is off, you'll still appear in search results, just not at the top with the sponsored badge.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How are boosted coaches ordered?</AccordionTrigger>
                  <AccordionContent>
                    All boosted coaches appear above non-boosted coaches in search results. Among boosted coaches, the order is randomized to give everyone fair exposure.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Does Boost apply to package purchases or digital products?</AccordionTrigger>
                  <AccordionContent>
                    Boost fees only apply to individual session bookings. If a new client purchases a session package or digital product (e.g., training plans, e-books), no Boost fee is charged. Boost is designed to help you acquire clients through 1-on-1 session bookings.
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
