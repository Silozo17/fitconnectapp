import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";

export default function CoachEarnings() {
  return (
    <DocsLayout
      title="Earnings & Stripe Setup"
      description="Set up payments, track earnings, and manage your coaching finances."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Earnings & Stripe" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect uses Stripe to process all payments. When clients purchase sessions, 
          packages, or subscriptions, the payment goes through Stripe and is deposited 
          directly into your connected bank account.
        </p>
        <p className="text-muted-foreground">
          This guide covers setting up Stripe, understanding platform fees, and tracking your earnings.
        </p>
      </section>

      {/* Stripe Setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Setting Up Stripe</h2>
        <p className="text-muted-foreground mb-4">
          Follow these steps to connect your Stripe account:
        </p>

        <DocStep number={1} title="Navigate to Settings">
          Go to your coach dashboard and click Settings in the sidebar.
        </DocStep>
        <DocStep number={2} title="Find Payment Settings">
          Scroll to the "Payments" or "Stripe Connect" section.
        </DocStep>
        <DocStep number={3} title="Click Connect with Stripe">
          Click the button to start the Stripe onboarding process.
        </DocStep>
        <DocStep number={4} title="Create or log in to Stripe">
          You'll be redirected to Stripe's website. Create a new account or log in to an existing one.
        </DocStep>
        <DocStep number={5} title="Provide business information">
          Stripe will ask for:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Your legal name and date of birth</li>
            <li>Business type (individual/sole trader for most coaches)</li>
            <li>Business address</li>
            <li>Bank account details for deposits</li>
          </ul>
        </DocStep>
        <DocStep number={6} title="Complete verification">
          Stripe may require identity verification (photo ID). This is a standard security measure.
        </DocStep>
        <DocStep number={7} title="Return to FitConnect">
          After completing Stripe setup, you'll be redirected back to FitConnect.
        </DocStep>

        <DocScreenshot 
          alt="Stripe Connect button showing connected status"
          caption="Your Stripe connection status in Settings"
        />

        <DocTip type="info">
          Stripe verification typically takes 1-2 business days. You can start accepting 
          payments immediately, but there may be a short delay before funds are released.
        </DocTip>
      </section>

      {/* Platform Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Understanding Platform Fees</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect charges a commission on client payments that varies by your subscription tier:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Plan</th>
                <th className="text-left py-3 px-4 font-semibold">Monthly Cost</th>
                <th className="text-left py-3 px-4 font-semibold">Commission</th>
                <th className="text-left py-3 px-4 font-semibold">You Keep</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4">Free</td>
                <td className="py-3 px-4">£0</td>
                <td className="py-3 px-4">4%</td>
                <td className="py-3 px-4 text-primary">96%</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4">Starter</td>
                <td className="py-3 px-4">£19</td>
                <td className="py-3 px-4">3%</td>
                <td className="py-3 px-4 text-primary">97%</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4">Pro</td>
                <td className="py-3 px-4">£49</td>
                <td className="py-3 px-4">2%</td>
                <td className="py-3 px-4 text-primary">98%</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Enterprise</td>
                <td className="py-3 px-4">£99</td>
                <td className="py-3 px-4">1%</td>
                <td className="py-3 px-4 text-primary">99%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium mt-6 mb-3">Example Calculation</h3>
        <p className="text-muted-foreground mb-4">
          If a client pays £100 for a session and you're on the Pro plan (2% commission):
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
          <li>Client pays: £100</li>
          <li>Platform fee (2%): £2</li>
          <li>Stripe processing fee (~2.9% + 20p): ~£3.10</li>
          <li><strong>You receive: ~£94.90</strong></li>
        </ul>

        <DocTip type="tip">
          If you earn over £3,000/month from client payments, upgrading to Pro or Enterprise 
          can save you more in commission fees than the subscription costs.
        </DocTip>
      </section>

      {/* Earnings Dashboard */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tracking Your Earnings</h2>
        <p className="text-muted-foreground mb-4">
          Monitor your earnings from the Earnings page in your dashboard:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Dashboard Metrics</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Total Revenue:</strong> Gross amount from all client payments</li>
          <li><strong>Net Earnings:</strong> Amount after platform and Stripe fees</li>
          <li><strong>Pending Payouts:</strong> Funds being processed by Stripe</li>
          <li><strong>This Month:</strong> Current month's earnings</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Transaction History</h3>
        <p className="text-muted-foreground mb-4">
          View detailed records of all transactions including:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
          <li>Client name and purchase type</li>
          <li>Date and amount</li>
          <li>Fee breakdown</li>
          <li>Payout status</li>
        </ul>

        <DocScreenshot 
          alt="Earnings dashboard showing revenue metrics and transaction list"
          caption="Your earnings dashboard overview"
        />
      </section>

      {/* Payouts */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Receiving Payouts</h2>
        <p className="text-muted-foreground mb-4">
          Stripe automatically transfers your earnings to your bank account:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Payout Schedule</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Payouts are processed automatically</li>
          <li>Standard timing is 2-7 business days after payment</li>
          <li>Payout frequency depends on your Stripe settings (daily, weekly, monthly)</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Managing Payout Settings</h3>
        <DocStep number={1} title="Access Stripe Dashboard">
          Click "Manage Stripe Account" in your Settings to access your Stripe dashboard.
        </DocStep>
        <DocStep number={2} title="Go to Balance → Payouts">
          Find the payout settings in your Stripe dashboard.
        </DocStep>
        <DocStep number={3} title="Adjust schedule">
          Change payout frequency or update bank details as needed.
        </DocStep>

        <DocTip type="info">
          Stripe holds your first payout for 7-14 days as a standard fraud prevention measure. 
          After that, payouts follow your normal schedule.
        </DocTip>
      </section>

      {/* Taxes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tax Considerations</h2>
        <p className="text-muted-foreground mb-4">
          As a coach receiving payments, you're responsible for managing your own taxes:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Record Keeping</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>FitConnect provides transaction records you can export</li>
          <li>Stripe provides tax-ready reports and 1099 forms (in applicable regions)</li>
          <li>Keep records of all business expenses for deductions</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">VAT/GST</h3>
        <p className="text-muted-foreground mb-4">
          If you're VAT registered, you can configure VAT settings in Stripe. Stripe Tax can 
          automatically calculate and collect VAT where required.
        </p>

        <DocTip type="warning">
          This is general information only. Consult a qualified accountant or tax professional 
          for advice specific to your situation and jurisdiction.
        </DocTip>
      </section>

      {/* Troubleshooting */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Stripe connection failed</h3>
            <p className="text-sm text-muted-foreground">
              If the connection process fails, try again from Settings. Ensure you complete 
              all required fields in Stripe's onboarding flow.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Payout delayed</h3>
            <p className="text-sm text-muted-foreground">
              Check your Stripe dashboard for any verification requirements or holds. 
              New accounts may have longer initial payout delays.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Client payment failed</h3>
            <p className="text-sm text-muted-foreground">
              Payment failures are usually due to insufficient funds or card issues on the 
              client's side. Ask them to try a different payment method.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Need to change bank account</h3>
            <p className="text-sm text-muted-foreground">
              Update your bank details directly in your Stripe dashboard under Settings → 
              Bank accounts and scheduling.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
