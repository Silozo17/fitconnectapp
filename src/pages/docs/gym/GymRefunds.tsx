import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymRefunds() {
  return (
    <DocsLayout
      title="Refunds & Credits"
      description="Process refund requests, issue account credits, handle payment disputes, and manage financial adjustments for your gym members."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Refunds & Credits" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Handle member refund requests and account credits professionally. FitConnect provides 
          tools to process refunds quickly while maintaining clear financial records.
        </p>
      </section>

      {/* Refund Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Types of Refunds</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-green-500">Full Refund</h4>
            <p className="text-sm text-muted-foreground">
              Complete reversal of a payment. The full amount is returned to the member's 
              original payment method. Use for: cancelled memberships within cooling-off period, 
              duplicate charges, or service not provided.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-blue-500">Partial Refund</h4>
            <p className="text-sm text-muted-foreground">
              Return a portion of the payment. Use for: pro-rated cancellations, 
              partial service issues, or goodwill gestures.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-purple-500">Account Credit</h4>
            <p className="text-sm text-muted-foreground">
              Add credit to the member's account instead of returning to their bank. 
              Credit can be used against future payments. Use for: service issues, 
              loyalty rewards, or when member prefers credit.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-orange-500">Class Credit</h4>
            <p className="text-sm text-muted-foreground">
              Add free class credits to compensate for missed or cancelled classes. 
              Doesn't affect financial records.
            </p>
          </div>
        </div>
      </section>

      {/* Processing a Refund */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Processing a Refund</h2>

        <DocStep stepNumber={1} title="Find the Transaction">
          <p>Go to the member's profile → Payments tab, or search in Reports → Transactions.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Refund">
          <p>Select the transaction to refund and click the "Refund" button.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Choose Refund Type">
          <p className="mb-4">Select the refund method:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Return to Card</strong> - Refund to original payment method (3-5 business days)</li>
            <li><strong>Account Credit</strong> - Add to member's account balance</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Enter Amount and Reason">
          <p>For partial refunds, enter the amount. Always provide a reason for audit purposes.</p>
        </DocStep>

        <DocStep stepNumber={5} title="Confirm and Process">
          <p>Review the details and click "Process Refund". The member will receive email confirmation.</p>
        </DocStep>

        <DocWarning>
          Refunds to card cannot be reversed once processed. Always verify the amount before confirming.
        </DocWarning>
      </section>

      {/* Account Credits */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Issuing Account Credits</h2>

        <DocStep stepNumber={1} title="Open Member Profile">
          <p>Navigate to the member's profile and go to the "Balance" or "Credits" section.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Add Credit">
          <p>Click "Add Credit" to open the credit form.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Enter Credit Details">
          <p className="mb-4">Fill in the credit information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Amount</strong> - The credit value to add</li>
            <li><strong>Reason</strong> - Why the credit is being issued</li>
            <li><strong>Expiry</strong> - Optional expiration date for the credit</li>
            <li><strong>Notify Member</strong> - Send email notification</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Confirm">
          <p>Click "Add Credit" to apply the balance to the member's account.</p>
        </DocStep>

        <DocTip>
          Account credits automatically apply to the next payment. You can also allow members 
          to use credits for point-of-sale purchases.
        </DocTip>
      </section>

      {/* Refund Policies */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Configuring Refund Policies</h2>

        <p className="text-muted-foreground mb-4">
          Set up policies that guide staff on refund decisions:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Cooling-Off Period</h4>
            <p className="text-sm text-muted-foreground">
              Set the number of days within which new members can cancel for a full refund. 
              UK regulations typically require 14 days.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Pro-Rata Cancellations</h4>
            <p className="text-sm text-muted-foreground">
              Define how refunds are calculated when members cancel mid-billing cycle. 
              Options: full month, pro-rata daily, no refund after usage.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Class Cancellation Refunds</h4>
            <p className="text-sm text-muted-foreground">
              Set rules for refunds when you cancel a class. Options: automatic credit, 
              refund to card, or allow member to choose.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Staff Authority Levels</h4>
            <p className="text-sm text-muted-foreground">
              Define refund limits by staff role. E.g., front desk can process up to £50, 
              managers up to £200, owners unlimited.
            </p>
          </div>
        </div>

        <DocInfo>
          Configure refund policies in Settings → Payments → Refund Policies. 
          These settings help maintain consistency and reduce disputes.
        </DocInfo>
      </section>

      {/* Handling Disputes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Handling Payment Disputes</h2>

        <p className="text-muted-foreground mb-4">
          When a member disputes a charge with their bank (chargeback), you'll be notified:
        </p>

        <DocStep stepNumber={1} title="Review the Dispute">
          <p>Check the disputed transaction and member history. Gather evidence: contracts, 
          check-in records, communications.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Contact the Member">
          <p>Often disputes are misunderstandings. Contact the member to resolve directly 
          before responding to the bank.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Submit Evidence">
          <p>If the member won't resolve directly, submit your evidence through the dispute 
          response form within the deadline (usually 7-14 days).</p>
        </DocStep>

        <DocStep stepNumber={4} title="Await Decision">
          <p>The bank reviews both sides and makes a decision. This can take 30-90 days.</p>
        </DocStep>

        <DocWarning>
          Chargebacks come with fees regardless of outcome. Document all member interactions 
          and keep signed contracts to protect against fraudulent disputes.
        </DocWarning>
      </section>

      {/* Refund Reports */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Refund Reports</h2>
        
        <p className="text-muted-foreground mb-4">
          Monitor refund activity to identify patterns and issues:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Refund Summary</strong> - Total refunds by period and category</li>
          <li><strong>Refund by Staff</strong> - Track who is processing refunds</li>
          <li><strong>Refund Reasons</strong> - Identify common refund causes</li>
          <li><strong>Outstanding Credits</strong> - Total account credits on member accounts</li>
          <li><strong>Dispute Status</strong> - Active chargebacks and their status</li>
        </ul>

        <DocTip>
          High refund rates for specific services or staff may indicate training needs 
          or service quality issues. Review regularly.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
