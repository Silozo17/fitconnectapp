import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymMemberships() {
  return (
    <DocsLayout
      title="Memberships & Plans"
      description="Create and manage membership plans including recurring subscriptions, class packs, drop-ins, and trial offers for your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Memberships & Plans" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Flexible membership options help you attract and retain members. Create plans that 
          suit different needs - from casual drop-ins to committed monthly subscribers.
        </p>
      </section>

      {/* Membership Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Membership Types</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Recurring Subscriptions</h3>
            <p className="text-muted-foreground mb-3">
              Automatic monthly or annual billing for unlimited access:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Monthly unlimited access</li>
              <li>Annual memberships (with discount incentive)</li>
              <li>Automatic renewal and billing</li>
              <li>Option for limited visits per week/month</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Class Packs</h3>
            <p className="text-muted-foreground mb-3">
              Pre-purchased class credits that don't expire (or have long expiry):
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>10-class, 20-class, 50-class packs</li>
              <li>One credit per class attendance</li>
              <li>Configurable expiry period</li>
              <li>Great for irregular attendees</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Drop-In / Day Pass</h3>
            <p className="text-muted-foreground mb-3">
              Single-use access for visitors or occasional users:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Single class drop-in</li>
              <li>Full day access pass</li>
              <li>Week pass for visitors</li>
              <li>No commitment required</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Trial Memberships</h3>
            <p className="text-muted-foreground mb-3">
              Introductory offers for new members:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Free trial period (7 days, 14 days)</li>
              <li>Discounted first month</li>
              <li>Unlimited or limited class access</li>
              <li>Auto-convert to full membership option</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Family Plans</h3>
            <p className="text-muted-foreground mb-3">
              Discounted rates for household members:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Primary member + additional family members</li>
              <li>Percentage or fixed discount per additional member</li>
              <li>Shared or individual class credits</li>
              <li>Single billing for the household</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Creating a Membership */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Creating a Membership Plan</h2>

        <DocStep stepNumber={1} title="Basic Information">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Name</strong> - e.g., "Monthly Unlimited", "10-Class Pack"</li>
            <li><strong>Description</strong> - What's included in this plan</li>
            <li><strong>Type</strong> - Recurring, class pack, or one-time</li>
            <li><strong>Visibility</strong> - Public (shown on signup) or private (staff-only)</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={2} title="Pricing">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Price</strong> - The amount to charge</li>
            <li><strong>Billing Interval</strong> - Weekly, monthly, annually</li>
            <li><strong>Setup Fee</strong> - Optional one-time joining fee</li>
            <li><strong>Promo Code Support</strong> - Allow discounts to be applied</li>
          </ul>
          <DocTip>
            Offering annual plans at a discount (e.g., 2 months free) encourages longer 
            commitments and improves cash flow.
          </DocTip>
        </DocStep>

        <DocStep stepNumber={3} title="Access Rules">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Locations</strong> - Which gym locations can be accessed</li>
            <li><strong>Classes Included</strong> - All classes or specific types only</li>
            <li><strong>Visit Limits</strong> - Unlimited or capped per week/month</li>
            <li><strong>Booking Ahead</strong> - How far in advance members can book</li>
            <li><strong>Guest Passes</strong> - Include complimentary guest visits</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Terms">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Minimum Term</strong> - Required commitment period</li>
            <li><strong>Notice Period</strong> - Days required to cancel</li>
            <li><strong>Freeze Policy</strong> - Allow pausing and maximum duration</li>
            <li><strong>Auto-Renewal</strong> - Continue after minimum term</li>
          </ul>
          <DocWarning>
            Ensure your terms comply with consumer protection regulations. Members must 
            be clearly informed of commitment periods and cancellation policies.
          </DocWarning>
        </DocStep>
      </section>

      {/* Managing Subscriptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Managing Active Subscriptions</h2>

        <h3 className="text-lg font-medium mb-3">Viewing Subscriptions</h3>
        <p className="text-muted-foreground mb-4">
          Navigate to Memberships → Active to see all current subscriptions. Filter by 
          plan type, status, or renewal date.
        </p>

        <h3 className="text-lg font-medium mb-3 mt-6">Plan Changes</h3>
        <p className="text-muted-foreground mb-4">
          When a member wants to change plans:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Upgrade</strong> - Prorate the difference immediately or wait for next billing</li>
          <li><strong>Downgrade</strong> - Apply at end of current billing period</li>
          <li><strong>Add-ons</strong> - Include additional services or perks</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Freezing Memberships</h3>
        <p className="text-muted-foreground mb-4">
          Members may need to pause their membership temporarily:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Set a freeze start and end date</li>
          <li>Choose billing during freeze (full pause, reduced rate, or full charge)</li>
          <li>Access is suspended during freeze period</li>
          <li>Membership end date extends by freeze duration</li>
        </ul>
        <DocInfo>
          You can set limits on how often and how long members can freeze, and charge a 
          freeze administration fee if desired.
        </DocInfo>

        <h3 className="text-lg font-medium mb-3 mt-6">Cancellations</h3>
        <p className="text-muted-foreground mb-4">
          When processing a cancellation:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Check if member is within minimum term</li>
          <li>Apply notice period - access continues until end</li>
          <li>Record cancellation reason for reporting</li>
          <li>Optionally offer a retention discount</li>
        </ul>
      </section>

      {/* Billing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Billing & Payments</h2>
        
        <h3 className="text-lg font-medium mb-3">Automatic Billing</h3>
        <p className="text-muted-foreground mb-4">
          Recurring memberships are billed automatically through Stripe:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Charges attempt on the billing date</li>
          <li>Failed payments retry automatically</li>
          <li>Members receive email receipts</li>
          <li>Failed payment notifications sent to staff</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Failed Payments</h3>
        <p className="text-muted-foreground mb-4">
          Configure how to handle payment failures:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Retry Schedule</strong> - Automatically retry after 3, 5, 7 days</li>
          <li><strong>Grace Period</strong> - Allow access during payment recovery</li>
          <li><strong>Suspension</strong> - Restrict access after X failed attempts</li>
          <li><strong>Notifications</strong> - Automated emails to update payment method</li>
        </ul>
        <DocTip>
          Enable payment reminder emails before billing date to reduce failed payments. 
          A 3-day reminder has high success rates.
        </DocTip>
      </section>

      {/* Promo Codes */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Promo Codes</h2>
        <p className="text-muted-foreground mb-4">
          Create promotional codes to offer discounts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Percentage Off</strong> - e.g., 20% off first month</li>
          <li><strong>Fixed Amount</strong> - e.g., £10 off</li>
          <li><strong>Free Period</strong> - e.g., first month free</li>
          <li><strong>Waived Setup Fee</strong> - Remove joining fee</li>
        </ul>
        <p className="text-muted-foreground mb-4">
          Set restrictions on promo codes:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Valid date range</li>
          <li>Maximum uses total or per member</li>
          <li>Applicable plans</li>
          <li>New members only</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
