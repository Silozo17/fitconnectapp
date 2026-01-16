import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Percent, Calendar, Users, Gift, TrendingUp, Clock, AlertCircle } from "lucide-react";

const GymPromotions = () => {
  return (
    <DocsLayout
      title="Promotions & Discount Codes"
      description="Create and manage promotional offers, discount codes, and special deals to attract new members and reward existing ones."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Promotions" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Promotions help you attract new members, reward loyalty, and boost revenue during slow periods. 
            Create discount codes, flash sales, seasonal offers, and member-exclusive deals all from one place.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Tag className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Discount Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create unique codes for percentage or fixed discounts
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Seasonal Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Time-limited promotions for holidays and special events
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Gift className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Member Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Exclusive offers for loyal and long-term members
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Promotion Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Types of Promotions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Percent className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Percentage Discount</CardTitle>
                  <Badge>Most Popular</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Apply a percentage off the total price. Works for memberships, classes, and products.
                </p>
                <p className="text-sm"><strong>Example:</strong> 20% off first month, 15% off annual membership</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Fixed Amount Discount</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Subtract a fixed amount from the price. Good for specific savings amounts.
                </p>
                <p className="text-sm"><strong>Example:</strong> £10 off any purchase over £50</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Free Trial / Add-on</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Offer free trials, extra sessions, or complimentary add-ons.
                </p>
                <p className="text-sm"><strong>Example:</strong> Free personal training session with signup</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Bundle Discount</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Discount when purchasing multiple items or services together.
                </p>
                <p className="text-sm"><strong>Example:</strong> Buy 10 classes, get 2 free</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creating a Promotion */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating a Promotion</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Promotions">
              Navigate to <strong>Marketing → Promotions</strong> in your gym dashboard. Click 
              <strong> Create Promotion</strong> to start a new offer.
            </DocStep>
            
            <DocStep stepNumber={2} title="Configure Basic Details">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Name:</strong> Internal name for easy identification</li>
                <li><strong>Code:</strong> The code members will enter (e.g., SUMMER2024)</li>
                <li><strong>Description:</strong> What the promotion offers (shown to members)</li>
                <li><strong>Type:</strong> Percentage, fixed amount, or free item</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Set Discount Value">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Percentage:</strong> Enter 1-100 for percent off</li>
                <li><strong>Fixed:</strong> Enter the exact amount to discount</li>
                <li><strong>Minimum purchase:</strong> Optional minimum spend requirement</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Define Validity Period">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Start date:</strong> When the promotion becomes active</li>
                <li><strong>End date:</strong> When it expires (optional for ongoing promotions)</li>
                <li><strong>Time restrictions:</strong> Limit to certain days or hours</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Set Usage Limits">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Total uses:</strong> Maximum times the code can be used overall</li>
                <li><strong>Per member:</strong> How many times each member can use it</li>
                <li><strong>New members only:</strong> Restrict to first-time signups</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={6} title="Choose Applicable Items">
              Select which products, memberships, or services the promotion applies to:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>All items</li>
                <li>Specific memberships only</li>
                <li>Certain class types</li>
                <li>Products from the shop</li>
              </ul>
            </DocStep>
          </div>
          
          <DocTip className="mt-6">
            Use memorable, easy-to-type codes like SUMMER20, NEWYEAR, or FRIEND10. 
            Avoid confusing characters like O/0 or l/1.
          </DocTip>
        </section>

        {/* Auto-Apply Promotions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Auto-Apply Promotions</h2>
          <p className="text-muted-foreground mb-4">
            Some promotions can be applied automatically without requiring a code.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Auto-Apply Options:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Time-Based:</strong> Automatically apply during specific hours (e.g., off-peak discounts)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Member-Based:</strong> Auto-apply for certain member types (students, seniors, corporate)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Cart-Based:</strong> Apply when cart value exceeds a threshold
                </div>
              </li>
            </ul>
          </div>
          
          <DocWarning className="mt-4">
            Auto-apply promotions stack with manual codes by default. Configure stacking rules to prevent 
            excessive discounts.
          </DocWarning>
        </section>

        {/* Tracking Performance */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tracking Performance</h2>
          <p className="text-muted-foreground mb-4">
            Monitor how your promotions are performing to optimise future campaigns.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• <strong>Redemptions:</strong> How many times the code was used</p>
                <p>• <strong>Revenue Impact:</strong> Total discounts given vs. revenue generated</p>
                <p>• <strong>Conversion Rate:</strong> Views to redemptions ratio</p>
                <p>• <strong>New vs Returning:</strong> Who's using the promotion</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analytics Access</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  View detailed promotion analytics in <strong>Marketing → Promotions → Analytics</strong>. 
                  Export data for deeper analysis or reporting.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-3">Do</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Set clear expiration dates to create urgency</li>
                <li>✓ Limit usage to prevent abuse</li>
                <li>✓ Test codes before launching campaigns</li>
                <li>✓ Track and analyse performance</li>
                <li>✓ Segment offers by member type</li>
                <li>✓ Promote via email, social, and in-app</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-3">Don't</h3>
              <ul className="space-y-2 text-sm">
                <li>✗ Create overly complex codes</li>
                <li>✗ Stack multiple deep discounts</li>
                <li>✗ Run promotions without budget limits</li>
                <li>✗ Forget to disable expired promotions</li>
                <li>✗ Offer discounts that undercut costs</li>
                <li>✗ Use the same code repeatedly</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seasonal Campaign Ideas */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Seasonal Campaign Ideas</h2>
          
          <div className="space-y-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">New Year Resolution</h4>
                    <p className="text-sm text-muted-foreground">January - 20% off annual memberships</p>
                  </div>
                  <Badge variant="outline">January</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Summer Body</h4>
                    <p className="text-sm text-muted-foreground">April-May - Free PT session with 3-month signup</p>
                  </div>
                  <Badge variant="outline">Spring</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Back to Routine</h4>
                    <p className="text-sm text-muted-foreground">September - Family discounts, student offers</p>
                  </div>
                  <Badge variant="outline">Autumn</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Holiday Gift</h4>
                    <p className="text-sm text-muted-foreground">December - Gift memberships, bring a friend free</p>
                  </div>
                  <Badge variant="outline">Winter</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can members combine multiple discount codes?</h4>
              <p className="text-sm text-muted-foreground">
                By default, only one code can be used per transaction. You can enable stacking in 
                promotion settings, but we recommend limiting this to avoid excessive discounts.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do I share promotion codes with members?</h4>
              <p className="text-sm text-muted-foreground">
                Use the built-in email marketing tools, push notifications, or share via social media. 
                You can also display codes on your member portal and public website.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I create member-specific codes?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Generate unique codes for individual members using the bulk code generator. 
                Each code is tied to a specific member and can only be used by them.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymPromotions;
