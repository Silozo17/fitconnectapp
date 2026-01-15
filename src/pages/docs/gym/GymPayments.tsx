import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymPayments() {
  return (
    <DocsLayout
      title="Payments & Billing"
      description="Connect Stripe, process payments, manage invoices, configure VAT, and handle refunds for your gym."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Payments & Billing" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Accept payments seamlessly with our Stripe integration. Process recurring memberships, one-time purchases, and handle all billing from one place.</p>
        <DocInfo>You'll need to connect a Stripe account to accept online payments. This can be done during onboarding or in Settings.</DocInfo>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Stripe Connect</h2>
        <p className="text-muted-foreground mb-4">Navigate to Settings → Payments and click "Connect with Stripe" to link your account. You can create a new Stripe account or connect an existing one.</p>
        <DocWarning>Stripe verification may take a few days for new accounts. You cannot accept payments until verification is complete.</DocWarning>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Credit and debit cards (Visa, Mastercard, Amex)</li>
          <li>Apple Pay and Google Pay</li>
          <li>Direct Debit for recurring payments</li>
          <li>Cash (recorded manually at POS)</li>
        </ul>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Invoicing</h2>
        <p className="text-muted-foreground mb-4">Invoices are generated automatically for all transactions. Members can view and download invoices from their portal. Configure your invoice details in Settings including your VAT number and business address.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
        <p className="text-muted-foreground mb-4">Process refunds directly from the payment record. Full or partial refunds are supported. Refunds typically appear in member accounts within 5-10 business days.</p>
        <DocTip>Set refund permission levels so only managers can process refunds above certain amounts.</DocTip>
      </section>
    </DocsLayout>
  );
}
