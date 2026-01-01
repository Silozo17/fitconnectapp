import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Receipt, Download, CreditCard, Calendar, FileText, Search } from "lucide-react";

export default function ClientReceiptsDocs() {
  return (
    <DocsLayout
      title="View Your Receipts | FitConnect Client Guide"
      description="Access payment history, download invoices and manage your coaching subscriptions."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Receipts" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Keep track of all your payments on FitConnect. The Receipts section provides a complete 
          history of your transactions including coaching sessions, subscription payments, 
          package purchases, and digital product orders.
        </p>
        <DocTip>
          Download receipts for your records or for expense reimbursement from your employer.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Finding Your Receipts
        </h2>
        <p className="text-muted-foreground mb-4">
          Access your complete payment history in one place.
        </p>

        <DocStep stepNumber={1} title="Access Receipts">
          Navigate to <strong>Settings → Payments</strong> or <strong>Receipts</strong> from your dashboard.
        </DocStep>

        <DocStep stepNumber={2} title="Browse Transactions">
          View your payment history sorted by date (newest first).
        </DocStep>

        <DocStep stepNumber={3} title="Filter & Search">
          Use filters to find specific transactions:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li>Date range</li>
          <li>Payment type (sessions, subscriptions, products)</li>
          <li>Coach name</li>
          <li>Transaction amount</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          Receipt Details
        </h2>
        <p className="text-muted-foreground mb-4">
          Each receipt includes comprehensive transaction information:
        </p>
        <div className="space-y-3 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Transaction Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Receipt/Invoice number</li>
              <li>• Date and time of payment</li>
              <li>• Payment method (last 4 digits of card)</li>
              <li>• Transaction status (Paid, Refunded, Pending)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Service Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Description of service/product</li>
              <li>• Coach or seller name</li>
              <li>• Session date (for session bookings)</li>
              <li>• Duration and type</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Financial Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Amount paid</li>
              <li>• Currency</li>
              <li>• VAT/Tax breakdown (if applicable)</li>
              <li>• Any discounts applied</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-amber-500" />
          Downloading Invoices
        </h2>
        <p className="text-muted-foreground mb-4">
          Get official PDF invoices for your records.
        </p>

        <DocStep stepNumber={1} title="Select Transaction">
          Find the transaction you need an invoice for.
        </DocStep>

        <DocStep stepNumber={2} title="Download PDF">
          Click the <strong>Download Invoice</strong> button (or PDF icon).
        </DocStep>

        <DocStep stepNumber={3} title="Save or Print">
          The PDF will download to your device. You can save it, email it, or print it.
        </DocStep>

        <DocTip>
          Invoices include the coach's business details if they've set up their invoice settings. 
          This is useful for tax purposes or expense claims.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          Payment Types
        </h2>
        <p className="text-muted-foreground mb-4">
          Different types of transactions you might see:
        </p>
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">Session Bookings</span>
            <p className="text-xs text-muted-foreground">Individual training sessions booked with coaches</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">Package Purchases</span>
            <p className="text-xs text-muted-foreground">Multi-session packages bought from coaches</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">Subscription Payments</span>
            <p className="text-xs text-muted-foreground">Recurring monthly or annual coach subscriptions</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">Digital Products</span>
            <p className="text-xs text-muted-foreground">E-books, videos, and other marketplace purchases</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">Refunds</span>
            <p className="text-xs text-muted-foreground">Returned amounts for cancelled sessions or products</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-red-500" />
          Understanding Invoice Items
        </h2>
        <p className="text-muted-foreground mb-4">
          Some invoices may contain multiple line items:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Base Service:</strong> The main item purchased (session, product, etc.)</li>
          <li><strong>Add-ons:</strong> Any additional services included</li>
          <li><strong>Discounts:</strong> Promotional codes or package discounts applied</li>
          <li><strong>Tax/VAT:</strong> Applicable taxes based on coach's location</li>
          <li><strong>Total:</strong> Final amount charged to your payment method</li>
        </ul>
        <DocTip>
          If you believe there's an error on your receipt, contact the coach directly or 
          reach out to FitConnect support for assistance.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
