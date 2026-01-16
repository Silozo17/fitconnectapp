import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Package, CreditCard, Gift, RefreshCw, BarChart3, Settings, Clock } from "lucide-react";

const GymCreditsAdvanced = () => {
  return (
    <DocsLayout
      title="Credit System Deep Dive"
      description="Master the credit and package system to offer flexible payment options, track usage, and create compelling membership offerings."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Credits Advanced" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Credits provide a flexible alternative to traditional memberships. Members buy credit 
            packages upfront and use them to book classes, sessions, or services. This model works 
            well for casual users, drop-in visitors, and supplementary services.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Coins className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Credit Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bundles of credits members can purchase
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Class Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Assign credit costs to different classes
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <RefreshCw className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Auto-Renewal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic credit top-ups when balance is low
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Credit vs Membership */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Credits vs Memberships</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Credit System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Occasional/casual visitors</li>
                  <li>Premium add-on services</li>
                  <li>Pay-per-class model</li>
                  <li>Corporate packages</li>
                  <li>Trial periods</li>
                </ul>
                <p className="mt-3"><strong>Pros:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Flexibility for members</li>
                  <li>Upfront revenue</li>
                  <li>No recurring commitment</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Best for:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Regular, committed members</li>
                  <li>All-inclusive access</li>
                  <li>Predictable revenue</li>
                  <li>Community building</li>
                  <li>Long-term retention</li>
                </ul>
                <p className="mt-3"><strong>Pros:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Predictable recurring revenue</li>
                  <li>Member commitment</li>
                  <li>Simpler to manage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocTip className="mt-4">
            Many gyms use both: memberships for core access and credits for premium services 
            like personal training, specialty classes, or spa treatments.
          </DocTip>
        </section>

        {/* Creating Credit Packages */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating Credit Packages</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Credit Settings">
              Navigate to <strong>Settings → Credits → Packages</strong> and click 
              <strong> Create Package</strong>.
            </DocStep>
            
            <DocStep stepNumber={2} title="Configure Package Details">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Name:</strong> e.g., "10 Class Pack", "Starter Bundle"</li>
                <li><strong>Credits:</strong> Number of credits in the package</li>
                <li><strong>Price:</strong> Total package price</li>
                <li><strong>Description:</strong> What's included</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Set Validity Rules">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Expiry:</strong> How long credits are valid (e.g., 3 months, 1 year, never)</li>
                <li><strong>Roll-over:</strong> Allow unused credits to carry forward</li>
                <li><strong>Freeze:</strong> Allow members to pause credit expiry</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Configure Restrictions">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Class types:</strong> Which classes these credits can book</li>
                <li><strong>Locations:</strong> Valid at specific locations only</li>
                <li><strong>Times:</strong> Peak vs off-peak restrictions</li>
                <li><strong>Member types:</strong> Who can purchase this package</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Set Up Auto-Renewal (Optional)">
              Configure automatic repurchase when credits run low:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Trigger threshold (e.g., when below 2 credits)</li>
                <li>Which package to auto-purchase</li>
                <li>Payment method to charge</li>
              </ul>
            </DocStep>
          </div>
        </section>

        {/* Credit Pricing Strategies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Credit Pricing Strategies</h2>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Volume Discounts:</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-lg font-semibold mt-2">£50</p>
                  <p className="text-xs text-muted-foreground">£10/credit</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-lg font-semibold mt-2">£90</p>
                  <p className="text-xs text-green-400">£9/credit (10% off)</p>
                </CardContent>
              </Card>
              
              <Card className="border-primary">
                <CardContent className="pt-4 text-center">
                  <Badge className="mb-2">Most Popular</Badge>
                  <p className="text-2xl font-bold">20</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-lg font-semibold mt-2">£160</p>
                  <p className="text-xs text-green-400">£8/credit (20% off)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">50</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-lg font-semibold mt-2">£350</p>
                  <p className="text-xs text-green-400">£7/credit (30% off)</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Variable Credit Costs:</h3>
            <p className="text-muted-foreground text-sm">
              Assign different credit values to different classes based on demand, instructor, or time:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium">Standard Class</p>
                <p className="text-2xl font-bold text-primary">1 credit</p>
                <p className="text-xs text-muted-foreground">Yoga, Spin, HIIT</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium">Premium Class</p>
                <p className="text-2xl font-bold text-primary">2 credits</p>
                <p className="text-xs text-muted-foreground">Small group PT, Boxing</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium">Specialty Class</p>
                <p className="text-2xl font-bold text-primary">3 credits</p>
                <p className="text-xs text-muted-foreground">1:1 Training, Workshops</p>
              </div>
            </div>
          </div>
        </section>

        {/* Assigning Credits to Classes */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Assigning Credits to Classes</h2>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Methods:</h3>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">1. Per Class Type</h4>
                  <p className="text-sm text-muted-foreground">
                    Set a default credit cost for each class type. All instances of that class 
                    use this value unless overridden.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">2. Per Individual Class</h4>
                  <p className="text-sm text-muted-foreground">
                    Override the default for specific instances (e.g., a holiday special class 
                    might cost more or less).
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">3. Time-Based Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Different credit costs for peak vs off-peak times. Encourage members to 
                    book during quieter periods with lower credit costs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Member Credit Management */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Member Credit Management</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Member View</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Members can see in their app/portal:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Current credit balance</li>
                  <li>Credit expiry dates</li>
                  <li>Transaction history</li>
                  <li>Purchase more credits</li>
                  <li>Set up auto-renewal</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff Actions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Staff can manage member credits:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Add credits manually (gift, compensation)</li>
                  <li>Remove/adjust credits</li>
                  <li>Extend expiry dates</li>
                  <li>Transfer credits between members</li>
                  <li>View complete credit history</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocInfo className="mt-4">
            All manual credit adjustments are logged in the activity log with staff ID, 
            reason, and timestamp for full auditability.
          </DocInfo>
        </section>

        {/* Bonus & Promotional Credits */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Bonus & Promotional Credits</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Types of Bonus Credits</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Welcome bonus:</strong> Free credits when member joins</li>
                  <li><strong>Referral bonus:</strong> Credits for successful referrals</li>
                  <li><strong>Birthday bonus:</strong> Credits on member's birthday</li>
                  <li><strong>Loyalty bonus:</strong> Extra credits with package purchases</li>
                  <li><strong>Compensation:</strong> Credits for service issues</li>
                  <li><strong>Promotional:</strong> Time-limited offers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-2">Example: "Buy 10, Get 2 Free"</h4>
            <p className="text-sm text-muted-foreground">
              Member purchases 10-credit package → System automatically adds 2 bonus credits. 
              You can configure bonus credits to have different expiry rules (e.g., use within 30 days).
            </p>
          </div>
        </section>

        {/* Expiry & Roll-Over */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Expiry & Roll-Over Rules</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Clock className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Expiry Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Fixed period:</strong> 30, 60, 90 days from purchase</p>
                <p>• <strong>Calendar-based:</strong> End of month/quarter/year</p>
                <p>• <strong>Never expire:</strong> Credits valid indefinitely</p>
                <p>• <strong>Rolling:</strong> Each credit expires X days after earning</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <RefreshCw className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Roll-Over Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>No roll-over:</strong> Credits expire strictly</p>
                <p>• <strong>Partial:</strong> Up to X% of unused credits carry over</p>
                <p>• <strong>Full:</strong> All unused credits extend to next period</p>
                <p>• <strong>One-time:</strong> Roll over once, then expire</p>
              </CardContent>
            </Card>
          </div>
          
          <DocWarning className="mt-4">
            Be clear about expiry policies at purchase time. Consider sending reminders 
            before credits expire to encourage usage and member satisfaction.
          </DocWarning>
        </section>

        {/* Reporting & Analytics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Reporting & Analytics</h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Credit Analytics Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Sales Metrics</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Packages sold by type</li>
                    <li>Revenue from credit sales</li>
                    <li>Average package value</li>
                    <li>Conversion rates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Usage Metrics</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Credits used vs purchased</li>
                    <li>Usage rate by member segment</li>
                    <li>Popular redemption times</li>
                    <li>Credits expiring soon</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Liability Tracking</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Outstanding credit balance (liability)</li>
                    <li>Expiring credits value</li>
                    <li>Deferred revenue calculation</li>
                    <li>Member credit aging</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Member Insights</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Members with low balance</li>
                    <li>High-value credit members</li>
                    <li>Inactive credit holders</li>
                    <li>Repurchase patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can credits be refunded?</h4>
              <p className="text-sm text-muted-foreground">
                You control refund policies. Options include full refund of unused credits, 
                pro-rata refund, or store credit only. Bonus credits typically aren't refundable.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">What happens to credits if someone cancels their membership?</h4>
              <p className="text-sm text-muted-foreground">
                Credits remain usable until they expire, regardless of membership status 
                (configurable). You can also choose to void credits on cancellation.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can members share credits with family?</h4>
              <p className="text-sm text-muted-foreground">
                For family accounts, credits can be configured as shared (family pool) or 
                individual (each member has their own balance).
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do I handle expired credits complaints?</h4>
              <p className="text-sm text-muted-foreground">
                Staff with appropriate permissions can extend expiry dates or restore credits 
                as a goodwill gesture. Log all restorations with reasons.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymCreditsAdvanced;
