import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, Clock, CreditCard, Download, Settings, AlertCircle, CheckCircle } from "lucide-react";

const GymInvoicing = () => {
  return (
    <DocsLayout
      title="Invoicing & Billing"
      description="Create, send, and manage invoices for memberships, products, and services. Handle corporate billing, custom invoices, and payment tracking."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Invoicing" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The invoicing system helps you create professional invoices, track payments, and manage 
            billing for individual members and corporate accounts. Automate recurring invoices or 
            create custom one-off invoices as needed.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Create Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professional invoices with your branding
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Send className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Auto-Send</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated invoice delivery via email
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Track Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor outstanding and paid invoices
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Invoice Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Invoice Types</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Standard Invoice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">One-time invoice for specific charges:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Product purchases</li>
                  <li>Personal training sessions</li>
                  <li>One-off services</li>
                  <li>Equipment rental</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Recurring Invoice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Automatically generated on schedule:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Monthly membership fees</li>
                  <li>Corporate monthly billing</li>
                  <li>Regular PT packages</li>
                  <li>Locker or storage rentals</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Pro-Forma Invoice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Quote or preview before final invoice:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Corporate quotes</li>
                  <li>Custom package pricing</li>
                  <li>Event bookings</li>
                  <li>Gym hire estimates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creating Invoices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating an Invoice</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Invoicing">
              Navigate to <strong>Finance → Invoices</strong> and click <strong>Create Invoice</strong>.
            </DocStep>
            
            <DocStep stepNumber={2} title="Select Customer">
              Choose who the invoice is for:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Individual member (select from member list)</li>
                <li>Corporate account (select company)</li>
                <li>New customer (enter details manually)</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Add Line Items">
              For each item on the invoice:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Description:</strong> What you're charging for</li>
                <li><strong>Quantity:</strong> Number of units</li>
                <li><strong>Unit price:</strong> Price per item</li>
                <li><strong>Tax rate:</strong> VAT or other applicable taxes</li>
                <li><strong>Discount:</strong> Any discounts applied</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Set Payment Terms">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Due date:</strong> When payment is expected</li>
                <li><strong>Payment methods:</strong> How they can pay</li>
                <li><strong>Late fees:</strong> Penalties for overdue payment</li>
                <li><strong>Notes:</strong> Additional payment instructions</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Review & Send">
              Preview the invoice, then:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Save as draft:</strong> Continue editing later</li>
                <li><strong>Send now:</strong> Email immediately to customer</li>
                <li><strong>Schedule:</strong> Send at a specific date/time</li>
                <li><strong>Download:</strong> Get PDF for manual delivery</li>
              </ul>
            </DocStep>
          </div>
        </section>

        {/* Invoice Status */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Invoice Status Lifecycle</h2>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Draft</Badge>
                <span className="text-sm text-muted-foreground">Not yet sent</span>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Sent</Badge>
                <span className="text-sm text-muted-foreground">Awaiting payment</span>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600">Paid</Badge>
                <span className="text-sm text-muted-foreground">Payment received</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-3">Other statuses:</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="destructive">Overdue</Badge>
                <Badge className="bg-yellow-600">Partially Paid</Badge>
                <Badge variant="secondary">Void</Badge>
                <Badge variant="outline">Refunded</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Billing */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Corporate Billing</h2>
          <p className="text-muted-foreground mb-4">
            Handle billing for corporate accounts with consolidated invoices and flexible payment terms.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Corporate Account Setup</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Company name and billing address</p>
                <p>• VAT/Company registration number</p>
                <p>• Primary billing contact</p>
                <p>• Payment terms (Net 15, 30, 60)</p>
                <p>• Purchase order requirements</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consolidated Invoicing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Monthly summary of all employee usage</p>
                <p>• Breakdown by employee or department</p>
                <p>• Usage reports attached to invoices</p>
                <p>• Custom invoice formats</p>
                <p>• Electronic invoice delivery (e-invoicing)</p>
              </CardContent>
            </Card>
          </div>
          
          <DocTip className="mt-4">
            For large corporate accounts, consider setting up BACS direct debit or 
            standing orders for automatic monthly payments.
          </DocTip>
        </section>

        {/* Payment Tracking */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Payment Tracking</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Recording Payments</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p className="mb-3">When a customer pays an invoice:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Auto-matched:</strong> Online payments are automatically recorded</li>
                  <li><strong>Manual:</strong> Record bank transfers, cheques, or cash payments</li>
                  <li><strong>Partial:</strong> Record partial payments and track balance due</li>
                  <li><strong>Over-payment:</strong> Handle overpayments as credit</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Overdue Invoices</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p className="mb-3">Automated overdue handling:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Automatic reminders at 7, 14, 30 days overdue</li>
                  <li>Customizable reminder email templates</li>
                  <li>Optional late payment fees</li>
                  <li>Escalation to collections workflow</li>
                  <li>Suspend membership access for non-payment</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Invoice Templates */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Invoice Templates & Branding</h2>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Customization Options:</h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Branding</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Your logo (header and footer)</li>
                  <li>Brand colors</li>
                  <li>Custom header/footer text</li>
                  <li>Company details and registration</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Layout</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Choose from multiple templates</li>
                  <li>Column visibility settings</li>
                  <li>Notes and terms placement</li>
                  <li>Tax display preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Default payment terms</li>
                  <li>Thank you message</li>
                  <li>Bank details for transfer</li>
                  <li>Late payment policies</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Automation</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Invoice number format</li>
                  <li>Auto-send rules</li>
                  <li>Reminder schedules</li>
                  <li>CC finance team</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recurring Invoices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recurring Invoices</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Create Recurring Template">
              Set up a recurring invoice by specifying what to charge and when:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Frequency:</strong> Weekly, monthly, quarterly, annually</li>
                <li><strong>Start date:</strong> When to begin generating invoices</li>
                <li><strong>End date:</strong> Optional end date or number of occurrences</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={2} title="Configure Generation">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Auto-generate:</strong> Create invoice X days before due date</li>
                <li><strong>Auto-send:</strong> Email automatically or hold for review</li>
                <li><strong>Variable amounts:</strong> Based on usage or fixed amount</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Monitor & Adjust">
              Review generated invoices and adjust as needed:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Edit before sending</li>
                <li>Skip specific occurrences</li>
                <li>Update template for future invoices</li>
                <li>Cancel recurring series</li>
              </ul>
            </DocStep>
          </div>
        </section>

        {/* Export & Reporting */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Export & Reporting</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Download className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• PDF invoices (individual or batch)</p>
                <p>• CSV export for accounting software</p>
                <p>• Xero/QuickBooks integration</p>
                <p>• BACS payment file generation</p>
                <p>• Aged debtor reports</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Available Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Invoice summary (by period)</p>
                <p>• Outstanding invoices aging</p>
                <p>• Payment history</p>
                <p>• Revenue by customer</p>
                <p>• Tax summary for VAT returns</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do I void an invoice?</h4>
              <p className="text-sm text-muted-foreground">
                Open the invoice and click "Void". This marks the invoice as cancelled without 
                deleting it, maintaining your audit trail. For paid invoices, you'll need to 
                issue a credit note instead.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can customers pay invoices online?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Invoices include a "Pay Now" button that links to your payment portal. 
                Customers can pay by card, and the payment is automatically recorded against 
                the invoice.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do I handle partial payments?</h4>
              <p className="text-sm text-muted-foreground">
                Record the partial payment amount. The invoice status changes to "Partially Paid" 
                and shows the remaining balance. You can send reminders for the outstanding amount.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I issue credit notes?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, create credit notes to offset previous invoices. Credit notes can be applied 
                to future invoices or refunded to the customer's original payment method.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymInvoicing;
