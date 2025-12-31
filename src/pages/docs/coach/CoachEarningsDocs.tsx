import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { CreditCard, BarChart3, Calendar, DollarSign } from "lucide-react";

export default function CoachEarningsDocs() {
  return (
    <DocsLayout
      title="Earnings & Stripe Connect"
      description="Track your income, understand platform fees, and manage your Stripe Connect account."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Earnings & Stripe" },
      ]}
    >
      {/* Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect uses Stripe Connect to handle all payments securely. When clients pay for sessions,
          packages, or subscriptions, the payment is processed through Stripe and deposited directly
          into your connected bank account after platform fees are deducted.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Direct Deposits</h3>
            <p className="text-sm text-muted-foreground">
              Funds go straight to your bank account.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              All transactions secured by Stripe.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Detailed Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track earnings, trends, and payouts.
            </p>
          </div>
        </div>
      </section>

      {/* Setting Up Stripe Connect */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Setting Up Stripe Connect</h2>
        
        <DocStep number={1} title="Navigate to Earnings">
          Go to your Coach Dashboard and click on "Earnings" in the sidebar.
        </DocStep>

        <DocStep number={2} title="Connect Your Account">
          Click "Connect with Stripe" to begin the onboarding process. You'll be redirected
          to Stripe to complete verification.
        </DocStep>

        <DocStep number={3} title="Provide Business Details">
          Stripe will ask for:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Personal identification</li>
            <li>Business type (individual or company)</li>
            <li>Bank account details for payouts</li>
            <li>Tax information</li>
          </ul>
        </DocStep>

        <DocStep number={4} title="Verification Complete">
          Once verified, you can start accepting payments. Your account status will show
          as "Connected" in the Earnings section.
        </DocStep>

        <DocTip type="info">
          Stripe verification typically takes a few minutes but may require additional
          documentation in some cases. Keep your ID ready.
        </DocTip>
      </section>

      {/* Understanding Fees */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Understanding Fees</h2>
        <p className="text-muted-foreground mb-4">
          Platform fees are automatically deducted from each transaction. Your fee rate depends
          on your subscription tier:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Free Tier</h3>
            <p className="text-sm text-muted-foreground">15% platform fee</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Starter</h3>
            <p className="text-sm text-muted-foreground">12% platform fee</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Pro</h3>
            <p className="text-sm text-muted-foreground">8% platform fee</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Enterprise</h3>
            <p className="text-sm text-muted-foreground">5% platform fee</p>
          </div>
        </div>
        <DocTip type="info">
          Stripe also charges its own processing fees (typically 1.5% + 20p for UK cards).
          These are separate from platform fees.
        </DocTip>
      </section>

      {/* Viewing Earnings */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Viewing Your Earnings</h2>
        <p className="text-muted-foreground mb-4">
          The Earnings dashboard provides comprehensive analytics:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Total Earnings:</strong> All-time and period-specific totals</li>
          <li><strong>Pending Payouts:</strong> Funds being processed by Stripe</li>
          <li><strong>Transaction History:</strong> Detailed list of all payments</li>
          <li><strong>Revenue Trends:</strong> Charts showing earnings over time</li>
          <li><strong>Client Breakdown:</strong> See which clients generate most revenue</li>
        </ul>
      </section>

      {/* Payout Schedule */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payout Schedule</h2>
        <p className="text-muted-foreground mb-4">
          Stripe processes payouts on a rolling basis:
        </p>
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Standard Payout: 2-7 Business Days</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            After a payment is processed, funds typically arrive in your bank account within
            2-7 business days, depending on your country and bank.
          </p>
        </div>
      </section>

      <DocTip type="warning">
        Keep your Stripe account information up to date. If your bank details change,
        update them in Stripe immediately to avoid payout delays.
      </DocTip>

      {/* Changelog */}
      <section className="mt-8 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Last updated:</strong> December 2024
        </p>
      </section>
    </DocsLayout>
  );
}