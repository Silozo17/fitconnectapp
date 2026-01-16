import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gift, TrendingUp, Share2, Award, Settings, BarChart3, Mail } from "lucide-react";

const GymReferrals = () => {
  return (
    <DocsLayout
      title="Member Referral Programme"
      description="Set up and manage your referral programme to incentivise existing members to bring in new customers through word-of-mouth marketing."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Referrals" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Word-of-mouth referrals are one of the most effective ways to grow your gym. Members who 
            join through referrals typically have higher retention rates and lifetime value. Our referral 
            system makes it easy to reward both referrers and new members.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Referrer Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reward existing members for successful referrals
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Gift className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">New Member Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Welcome offers for referred new signups
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Growth Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor referral performance and ROI
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                <div>
                  <p className="font-medium">Member Shares</p>
                  <p className="text-sm text-muted-foreground">Unique referral link or code</p>
                </div>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                <div>
                  <p className="font-medium">Friend Signs Up</p>
                  <p className="text-sm text-muted-foreground">Using the referral link</p>
                </div>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                <div>
                  <p className="font-medium">Both Get Rewarded</p>
                  <p className="text-sm text-muted-foreground">After qualifying action</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Setting Up Referrals */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Setting Up Your Programme</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Referral Settings">
              Go to <strong>Marketing → Referral Programme</strong> in your dashboard. 
              Toggle the programme on to activate referrals.
            </DocStep>
            
            <DocStep stepNumber={2} title="Configure Referrer Rewards">
              Choose what existing members receive for successful referrals:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Credit:</strong> Add credit to their account (e.g., £10)</li>
                <li><strong>Free month:</strong> Extend membership for free</li>
                <li><strong>Discount:</strong> Percentage off next payment</li>
                <li><strong>Free classes:</strong> Complimentary class passes</li>
                <li><strong>Gift:</strong> Physical merchandise or products</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Set New Member Benefits">
              Configure what referred new members receive:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Joining discount:</strong> % or fixed amount off first payment</li>
                <li><strong>Free trial:</strong> Extended trial period</li>
                <li><strong>Welcome pack:</strong> Free products or merch</li>
                <li><strong>Waived fees:</strong> No joining fee</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Define Qualifying Actions">
              Set when rewards are triggered:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>On signup:</strong> Immediately when friend joins</li>
                <li><strong>First payment:</strong> After first successful payment</li>
                <li><strong>Retention period:</strong> After X days/weeks of membership</li>
                <li><strong>First visit:</strong> When they check in for the first time</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Set Limits">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Max referrals:</strong> Limit how many people each member can refer</li>
                <li><strong>Time limit:</strong> How long referral links are valid</li>
                <li><strong>Max rewards:</strong> Cap total rewards per referrer</li>
              </ul>
            </DocStep>
          </div>
          
          <DocTip className="mt-6">
            Requiring a qualifying action like "first payment" or "30-day retention" prevents 
            abuse and ensures you're rewarding genuine referrals.
          </DocTip>
        </section>

        {/* Referral Methods */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Referral Sharing Methods</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Unique Referral Links</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Each member gets a unique URL they can share via:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Social media (one-click share buttons)</li>
                  <li>WhatsApp / SMS</li>
                  <li>Email</li>
                  <li>Copy & paste anywhere</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Referral Codes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Personal codes that friends enter at signup:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Auto-generated or custom codes</li>
                  <li>Easy to remember (e.g., JOHN2024)</li>
                  <li>Works for in-person referrals</li>
                  <li>Trackable in your dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Member Experience */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Member Experience</h2>
          
          <div className="space-y-4">
            <h3 className="font-semibold">For Referring Members:</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <p>1. Find referral link in their member app/portal under "Refer a Friend"</p>
              <p>2. Share via their preferred method (social, message, email)</p>
              <p>3. Track referral status in their account</p>
              <p>4. Receive notification when reward is credited</p>
              <p>5. View referral history and total rewards earned</p>
            </div>
            
            <h3 className="font-semibold mt-6">For New Members:</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <p>1. Click referral link or enter code during signup</p>
              <p>2. See their welcome discount/benefit applied</p>
              <p>3. Complete signup with benefit clearly shown</p>
              <p>4. Both parties notified of successful referral</p>
            </div>
          </div>
        </section>

        {/* Promoting Your Programme */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Promoting Your Programme</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Email Campaigns</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Send targeted emails to engaged members:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>New programme announcement</li>
                  <li>Monthly referral reminders</li>
                  <li>Success stories from top referrers</li>
                  <li>Limited-time bonus rewards</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Additional Promotion Ideas:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Display in member app dashboard prominently</li>
                  <li>• Posters in gym with QR codes</li>
                  <li>• Mention at check-in for engaged members</li>
                  <li>• Social media posts showcasing rewards</li>
                  <li>• Staff training to mention referrals</li>
                  <li>• Referral leaderboard with prizes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocInfo className="mt-4">
            The best time to ask for referrals is when members are most satisfied - after a great 
            class, achieving a goal, or completing their first month successfully.
          </DocInfo>
        </section>

        {/* Tracking & Analytics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tracking & Analytics</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <BarChart3 className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• <strong>Total referrals:</strong> All-time successful referrals</p>
                <p>• <strong>Conversion rate:</strong> Link clicks to signups</p>
                <p>• <strong>Top referrers:</strong> Your best advocates</p>
                <p>• <strong>Average value:</strong> Revenue per referred member</p>
                <p>• <strong>Retention:</strong> How long referred members stay</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Settings className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Reports Available</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Monthly referral summary</p>
                <p>• Referrer leaderboard</p>
                <p>• Referral source breakdown</p>
                <p>• Reward costs vs revenue generated</p>
                <p>• Export to CSV for detailed analysis</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tiered Referral Rewards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tiered Referral Rewards</h2>
          <p className="text-muted-foreground mb-4">
            Motivate members to refer more by increasing rewards at higher tiers.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-600">Bronze</Badge>
                <span>1-2 referrals</span>
              </div>
              <span className="font-medium">£10 credit each</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-slate-400">Silver</Badge>
                <span>3-5 referrals</span>
              </div>
              <span className="font-medium">£15 credit each</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500">Gold</Badge>
                <span>6-10 referrals</span>
              </div>
              <span className="font-medium">£20 credit + free month</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-primary/50 rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">VIP</Badge>
                <span>10+ referrals</span>
              </div>
              <span className="font-medium">Free membership for life!</span>
            </div>
          </div>
          
          <DocTip className="mt-4">
            Tiered rewards create excitement and friendly competition. Consider adding a public 
            leaderboard to gamify the experience.
          </DocTip>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">What if someone tries to refer themselves?</h4>
              <p className="text-sm text-muted-foreground">
                The system automatically detects and prevents self-referrals by checking email 
                addresses, payment methods, and device fingerprints.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I run limited-time referral bonuses?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Create special campaigns with enhanced rewards for specific periods (e.g., 
                "Double rewards in January"). These overlay your standard programme.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How are rewards delivered?</h4>
              <p className="text-sm text-muted-foreground">
                Credit is automatically added to member accounts. Free months extend their billing 
                date. Physical rewards need manual fulfillment (you'll receive a notification).
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I exclude certain memberships from the programme?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can configure which membership types are eligible for referral rewards. 
                For example, exclude trial memberships or heavily discounted corporate plans.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymReferrals;
