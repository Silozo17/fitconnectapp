import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CreditCard, Calendar, Download, Settings, Clock } from "lucide-react";

const GymReportingAdvanced = () => {
  return (
    <DocsLayout
      title="Advanced Reporting"
      description="Generate detailed reports, create custom dashboards, schedule automated reports, and export data for in-depth business analysis."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Advanced Reporting" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            The reporting system provides comprehensive insights into every aspect of your gym 
            operations. From financial performance to member behavior, create the reports you 
            need to make data-driven decisions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Pre-Built Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ready-to-use reports for common metrics
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Custom Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build your own reports with any metrics
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated reports delivered to your inbox
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Report Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Report Categories</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Financial Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Revenue summary (by period)</li>
                    <li>Revenue by membership type</li>
                    <li>Revenue by payment method</li>
                    <li>Daily/weekly cash-up report</li>
                    <li>Deferred revenue tracking</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Outstanding payments</li>
                    <li>Failed payment analysis</li>
                    <li>Refund report</li>
                    <li>Tax summary (VAT)</li>
                    <li>Profit & loss by service</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Membership Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Active member count</li>
                    <li>New signups (by period)</li>
                    <li>Cancellations & reasons</li>
                    <li>Churn rate analysis</li>
                    <li>Member lifetime value</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Membership type breakdown</li>
                    <li>Contract expirations</li>
                    <li>Upgrade/downgrade trends</li>
                    <li>Member demographics</li>
                    <li>Referral source analysis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Attendance & Engagement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Daily attendance trends</li>
                    <li>Peak hours analysis</li>
                    <li>Class attendance rates</li>
                    <li>No-show tracking</li>
                    <li>Member visit frequency</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Inactive member alerts</li>
                    <li>At-risk member list</li>
                    <li>App engagement metrics</li>
                    <li>Class popularity ranking</li>
                    <li>Instructor performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Operational Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Staff hours & payroll</li>
                    <li>Class utilization</li>
                    <li>Room/resource usage</li>
                    <li>Equipment maintenance log</li>
                    <li>Inventory levels</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Lead conversion funnel</li>
                    <li>Marketing campaign ROI</li>
                    <li>Referral program performance</li>
                    <li>Staff activity log</li>
                    <li>Support ticket summary</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Building Custom Reports */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Building Custom Reports</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Start Report Builder">
              Navigate to <strong>Reports → Create Report</strong> and select "Custom Report" 
              or start from a template.
            </DocStep>
            
            <DocStep stepNumber={2} title="Choose Data Source">
              Select the primary data you want to report on:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Members</li>
                <li>Payments/Transactions</li>
                <li>Classes/Bookings</li>
                <li>Check-ins</li>
                <li>Products/Sales</li>
                <li>Staff</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Select Columns">
              Choose which fields to include in your report:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Drag and drop fields from the available list</li>
                <li>Rename columns for clarity</li>
                <li>Add calculated fields (formulas)</li>
                <li>Set column order</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Apply Filters">
              Narrow down the data:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Date range (fixed or relative, e.g., "Last 30 days")</li>
                <li>Membership type</li>
                <li>Location</li>
                <li>Status (active, cancelled, etc.)</li>
                <li>Custom field values</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Configure Grouping & Sorting">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Group by:</strong> Location, membership type, month, etc.</li>
                <li><strong>Sort by:</strong> Any column, ascending or descending</li>
                <li><strong>Subtotals:</strong> Add summary rows for groups</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={6} title="Add Visualizations">
              Optionally add charts:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Bar charts</li>
                <li>Line graphs (trends)</li>
                <li>Pie charts</li>
                <li>Tables with conditional formatting</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={7} title="Save & Share">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Save as personal or shared report</li>
                <li>Set permissions (who can view/edit)</li>
                <li>Add to dashboard</li>
                <li>Schedule for automatic delivery</li>
              </ul>
            </DocStep>
          </div>
        </section>

        {/* Scheduled Reports */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Scheduled Reports</h2>
          <p className="text-muted-foreground mb-4">
            Automate report generation and delivery to keep stakeholders informed.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Daily:</strong> Morning summary, previous day stats</p>
                <p>• <strong>Weekly:</strong> Monday morning with week recap</p>
                <p>• <strong>Monthly:</strong> End of month summary</p>
                <p>• <strong>Custom:</strong> Any day/time combination</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Email (PDF or Excel attachment)</p>
                <p>• Slack channel</p>
                <p>• Google Drive / Dropbox</p>
                <p>• SFTP for external systems</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Example: Daily Owner Report</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Schedule:</strong> Daily at 8:00 AM</p>
              <p><strong>Recipients:</strong> owner@gym.com, gm@gym.com</p>
              <p><strong>Content:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Yesterday's revenue vs same day last week</li>
                <li>New signups and cancellations</li>
                <li>Class attendance summary</li>
                <li>Outstanding payments due today</li>
                <li>Staff scheduled for today</li>
              </ul>
            </div>
          </div>
        </section>

        {/* KPI Dashboards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">KPI Dashboards</h2>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create visual dashboards to monitor key performance indicators at a glance.
            </p>
            
            <div className="grid md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold text-primary">847</p>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-xs text-green-400">+12 vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold text-primary">£42.5k</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xs text-green-400">+8% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold text-primary">4.2%</p>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-xs text-red-400">+0.3% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-3xl font-bold text-primary">68%</p>
                  <p className="text-sm text-muted-foreground">Class Utilization</p>
                  <p className="text-xs text-green-400">+5% vs last month</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <DocTip className="mt-4">
            Pin your most important KPIs to the dashboard home screen for quick daily review. 
            Each user can customize their own dashboard view.
          </DocTip>
        </section>

        {/* Data Export */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Export</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Download className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Export Formats</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Excel (.xlsx):</strong> Full formatting and formulas</p>
                <p>• <strong>CSV:</strong> Simple format for any system</p>
                <p>• <strong>PDF:</strong> Formatted for printing/sharing</p>
                <p>• <strong>JSON:</strong> For developers/integrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Settings className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Bulk Data Export</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Export complete datasets for:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Member database</li>
                  <li>Transaction history</li>
                  <li>Booking records</li>
                  <li>Class schedules</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocWarning className="mt-4">
            Bulk exports may contain personal data. Ensure you handle exports according to 
            GDPR requirements and your privacy policy.
          </DocWarning>
        </section>

        {/* Integrations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reporting Integrations</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Accounting Software</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Sync financial data with your accounting system:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Xero</Badge>
                  <Badge variant="outline">QuickBooks</Badge>
                  <Badge variant="outline">Sage</Badge>
                  <Badge variant="outline">FreeAgent</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Business Intelligence</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect to BI tools for advanced analytics:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Google Data Studio</Badge>
                  <Badge variant="outline">Power BI</Badge>
                  <Badge variant="outline">Tableau</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">API Access</h4>
                <p className="text-sm text-muted-foreground">
                  Build custom integrations with our reporting API. Access any data 
                  programmatically with proper authentication and rate limits.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reporting Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-3">Do</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Review key metrics daily</li>
                <li>✓ Compare to previous periods</li>
                <li>✓ Set up alerts for anomalies</li>
                <li>✓ Share reports with stakeholders</li>
                <li>✓ Act on insights quickly</li>
                <li>✓ Keep reports simple and focused</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-3">Don't</h3>
              <ul className="space-y-2 text-sm">
                <li>✗ Create too many reports (focus on key ones)</li>
                <li>✗ Ignore negative trends</li>
                <li>✗ Share sensitive data without purpose</li>
                <li>✗ Rely on outdated reports</li>
                <li>✗ Overlook data quality issues</li>
                <li>✗ Make decisions on incomplete data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How far back does historical data go?</h4>
              <p className="text-sm text-muted-foreground">
                Data is retained indefinitely. You can run reports for any time period since 
                your account was created.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I share reports with non-users?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, create shareable links for specific reports. Set expiry dates and password 
                protection for security. Links can be revoked at any time.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Why do my numbers differ from my accountant's?</h4>
              <p className="text-sm text-muted-foreground">
                Check date ranges, timezone settings, and whether you're comparing cash vs 
                accrual accounting. Our reports show when payments are recorded, which may 
                differ from when they clear in your bank.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I get real-time data?</h4>
              <p className="text-sm text-muted-foreground">
                Dashboard KPIs update in near real-time. Full reports may have a slight delay 
                (up to 15 minutes) for complex queries to ensure performance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymReportingAdvanced;
