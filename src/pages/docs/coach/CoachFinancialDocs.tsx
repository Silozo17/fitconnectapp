import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, PoundSterling, TrendingUp, FileText, Download, Calendar, PieChart, CreditCard } from "lucide-react";

export default function CoachFinancialDocs() {
  return (
    <DocsLayout
      title="Financial Reports & Management"
      description="Track your revenue, manage invoices, log expenses, and generate financial reports for your coaching business."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Financial Reports" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to track their business finances, generate invoices, 
            log expenses, and understand their revenue trends. Whether you're managing a few clients 
            or a full coaching business, financial tracking helps you stay organised.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Invoice Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create, send, and track invoices for your coaching services with automatic payment tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PoundSterling className="h-4 w-4 text-primary" />
                  Expense Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log business expenses like equipment, certifications, and software to track profitability.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View revenue trends, compare periods, and understand your business growth over time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Download financial reports in CSV or PDF format for accounting and tax purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Running a coaching business means managing finances. This feature helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Keep all financial records in one place alongside your clients</li>
            <li>Generate professional invoices without third-party tools</li>
            <li>Track profitability by monitoring income vs expenses</li>
            <li>Prepare for tax season with exportable reports</li>
            <li>Make informed business decisions based on financial data</li>
          </ul>
        </section>

        {/* Dashboard Overview */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Financial Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            Your financial dashboard provides an at-a-glance view of your business health:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Summary Cards</h3>
              <p className="text-sm text-muted-foreground">
                See total revenue, expenses, net income, and outstanding invoices for the current 
                period at a glance.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Revenue Chart</h3>
              <p className="text-sm text-muted-foreground">
                Visual graph showing revenue trends over time. Toggle between weekly, monthly, 
                or yearly views.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">
                Latest invoices sent, payments received, and expenses logged in a quick-view list.
              </p>
            </div>
          </div>
        </section>

        {/* Creating Invoices */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Creating Invoices
          </h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Navigate to Invoices">
              Go to your financial dashboard and click on the "Invoices" tab or section.
            </DocStep>

            <DocStep stepNumber={2} title="Create New Invoice">
              Click "New Invoice" and select the client. Their details will auto-populate.
            </DocStep>

            <DocStep stepNumber={3} title="Add Line Items">
              Add items for your services (e.g., "Monthly Coaching Package", "1:1 Session"). 
              Set quantities and prices for each.
            </DocStep>

            <DocStep stepNumber={4} title="Set Payment Terms">
              Choose a due date and any notes or terms. You can set reminders for overdue invoices.
            </DocStep>

            <DocStep stepNumber={5} title="Send Invoice">
              Preview and send the invoice to your client via email. They'll receive a link to 
              view and pay (if payment is connected).
            </DocStep>
          </div>

          <DocTip className="mt-4">
            Create invoice templates for recurring services to save time. Templates remember 
            your common line items and pricing.
          </DocTip>
        </section>

        {/* Invoice Status */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Invoice Status Tracking</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                Draft
              </h3>
              <p className="text-sm text-muted-foreground">
                Invoice created but not yet sent. You can still edit all details.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Sent
              </h3>
              <p className="text-sm text-muted-foreground">
                Invoice delivered to client. Awaiting payment.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Paid
              </h3>
              <p className="text-sm text-muted-foreground">
                Payment received and recorded. Invoice is complete.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Overdue
              </h3>
              <p className="text-sm text-muted-foreground">
                Payment not received by due date. Consider sending a reminder.
              </p>
            </div>
          </div>
        </section>

        {/* Expense Tracking */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <PoundSterling className="h-5 w-5 text-primary" />
            Tracking Expenses
          </h2>
          <p className="text-muted-foreground mb-4">
            Log business expenses to understand your true profitability:
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Add New Expense">
              Go to the Expenses section and click "Add Expense".
            </DocStep>

            <DocStep stepNumber={2} title="Enter Details">
              Select a category (Equipment, Software, Certification, Travel, Marketing, Other), 
              enter the amount, date, and a description.
            </DocStep>

            <DocStep stepNumber={3} title="Attach Receipt (Optional)">
              Upload a photo or PDF of the receipt for your records.
            </DocStep>

            <DocStep stepNumber={4} title="Save">
              The expense is logged and will appear in your financial reports.
            </DocStep>
          </div>

          <DocInfo className="mt-4">
            Common expense categories include gym rent, equipment purchases, software subscriptions, 
            professional development courses, and insurance.
          </DocInfo>
        </section>

        {/* Reports */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Generating Reports
          </h2>
          <p className="text-muted-foreground mb-4">
            Generate financial reports for any date range:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Income Report</h3>
              <p className="text-sm text-muted-foreground">
                Lists all payments received, broken down by client and service type. Great for 
                tracking which services generate the most revenue.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Expense Report</h3>
              <p className="text-sm text-muted-foreground">
                All logged expenses by category and date. Useful for tax deductions and 
                understanding where money goes.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Profit & Loss</h3>
              <p className="text-sm text-muted-foreground">
                Net income calculation showing total revenue minus total expenses for the period.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Outstanding Invoices</h3>
              <p className="text-sm text-muted-foreground">
                List of unpaid invoices with ageing information (days overdue).
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Export your financial data regularly for backup and to share with your accountant 
            at tax time. CSV format works well with most accounting software.
          </DocTip>
        </section>

        {/* Stripe Connection */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Integration
          </h2>
          <p className="text-muted-foreground mb-4">
            If you've connected Stripe, payments through the platform are automatically recorded:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Session bookings and package purchases are tracked automatically</li>
            <li>Subscription renewals appear as recurring revenue</li>
            <li>Refunds are logged and deducted from totals</li>
            <li>Platform fees are separated from your net revenue</li>
          </ul>
          <DocInfo className="mt-4">
            Manual invoices and off-platform payments can still be logged manually for complete 
            financial tracking.
          </DocInfo>
        </section>

        {/* Tax Considerations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Tax Considerations</h2>
          <DocWarning>
            FitConnect is not accounting software and does not provide tax advice. Always consult 
            a qualified accountant for tax matters.
          </DocWarning>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>The financial tools help you:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Keep organised records for tax submissions</li>
              <li>Track deductible business expenses</li>
              <li>Export data for your accountant to review</li>
              <li>Understand income for tax planning purposes</li>
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can clients pay invoices directly through FitConnect?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, if you have Stripe connected, clients receive a payment link with the invoice. 
                Otherwise, you can mark invoices as paid manually when you receive payment.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How far back can I generate reports?</h3>
              <p className="text-sm text-muted-foreground">
                You can generate reports for any period since you started using the platform. 
                Historical data is retained for your records.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I customise invoice appearance?</h3>
              <p className="text-sm text-muted-foreground">
                Invoices include your profile photo and business name. Additional customisation 
                options may be available based on your subscription tier.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Does this replace accounting software?</h3>
              <p className="text-sm text-muted-foreground">
                It's a complement, not a replacement. For comprehensive accounting, continue using 
                dedicated software and export data from FitConnect to import there.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
