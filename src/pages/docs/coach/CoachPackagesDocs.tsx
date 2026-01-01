import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Package, RefreshCw, CreditCard, Tag } from "lucide-react";

export default function CoachPackagesDocs() {
  return (
    <DocsLayout
      title="Create Session Packages | FitConnect Coach Guide"
      description="Sell multi-session bundles and subscription plans. Increase client retention with package deals."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Packages & Pricing" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Session Packages
        </h2>
        <p className="text-muted-foreground">
          Create bundled session packages to encourage client commitment.
        </p>

        <DocStep number={1} title="Create a Package">
          Go to <strong>Packages</strong> from your dashboard and click 
          <strong>Create Package</strong>.
        </DocStep>

        <DocStep number={2} title="Define Package Details">
          Set the package name, number of sessions included (e.g., 5, 10, 20), 
          total price, and expiry period.
        </DocStep>

        <DocStep number={3} title="Add Description">
          Write a compelling description explaining what's included and the value 
          clients receive with the package.
        </DocStep>

        <DocStep number={4} title="Publish Package">
          Toggle the package to "Active" to make it visible on your profile for 
          clients to purchase.
        </DocStep>

        <DocTip type="tip">
          Offer a discount for larger packages to incentivize longer commitments. 
          For example, 10 sessions at 10% off single-session rate.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-primary" />
          Subscription Plans
        </h2>
        <p className="text-muted-foreground">
          Set up recurring billing for ongoing coaching relationships.
        </p>

        <DocStep number={1} title="Create a Subscription">
          From the Packages page, click <strong>Create Subscription Plan</strong>.
        </DocStep>

        <DocStep number={2} title="Set Billing Period">
          Choose monthly or annual billing. Annual plans often include a discount 
          to encourage longer commitments.
        </DocStep>

        <DocStep number={3} title="Define What's Included">
          Specify sessions per period, messaging access, plan updates, and any 
          other perks included in the subscription.
        </DocStep>

        <DocStep number={4} title="Set Price">
          Set your recurring price. The platform handles all billing automatically 
          through Stripe.
        </DocStep>

        <DocTip type="info">
          Subscriptions provide predictable income and encourage ongoing client 
          relationships. Consider offering different tiers (Basic, Premium, VIP).
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          Pricing Strategy
        </h2>
        <p className="text-muted-foreground">
          Tips for setting competitive and profitable pricing.
        </p>

        <DocStep number={1} title="Research Market Rates">
          Check what other coaches in your area and specialty charge. Price yourself 
          competitively based on your experience and credentials.
        </DocStep>

        <DocStep number={2} title="Offer Value Tiers">
          Create different pricing options: single sessions for flexibility, 
          packages for commitment, subscriptions for ongoing coaching.
        </DocStep>

        <DocStep number={3} title="Factor in Platform Fees">
          Remember that the platform takes a commission on payments. Your tier 
          determines the commission rate (4% Free, 3% Starter, 2% Pro, 1% Enterprise).
        </DocStep>

        <DocTip type="tip">
          Starting slightly lower can help you build reviews and clientele. 
          You can always raise prices as demand increases.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Tracking Purchases
        </h2>
        <p className="text-muted-foreground">
          Monitor client purchases and session usage.
        </p>

        <DocStep number={1} title="View Purchases">
          The Packages page shows all client purchases including who bought what, 
          when, and how many sessions remain.
        </DocStep>

        <DocStep number={2} title="Session Tracking">
          Package sessions are automatically deducted when you complete sessions 
          with clients.
        </DocStep>

        <DocStep number={3} title="Expiration Alerts">
          You'll be notified when client packages are close to expiring so you can 
          encourage rebooking.
        </DocStep>

        <DocTip type="warning">
          Keep track of clients with expiring packages. A friendly reminder often 
          leads to renewal purchases.
        </DocTip>

        <DocTip type="info" title="📱 iOS App Note">
          Due to Apple App Store policies, clients cannot purchase packages directly 
          through the iOS app. iOS users will be directed to complete purchases via 
          the web or Android app. You can still manage and track all packages from any platform.
        </DocTip>
      </section>

      {/* Changelog */}
      <section className="mt-16 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Changelog:</strong> December 26, 2024 — Added iOS App Store purchase limitation note.
        </p>
      </section>
    </DocsLayout>
  );
}
