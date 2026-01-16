import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Clock, Users, Mail, Bell, Settings, GitBranch, PlayCircle, History } from "lucide-react";

const GymAutomationsAdvanced = () => {
  return (
    <DocsLayout
      title="Advanced Automations"
      description="Create powerful automated workflows to streamline operations, engage members, and reduce manual tasks with conditional logic and multi-step sequences."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Advanced Automations" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Automations let you create "if this, then that" workflows that run automatically. From 
            sending birthday messages to flagging at-risk members, automations handle repetitive tasks 
            so you can focus on what matters most.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Trigger-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Run automations when specific events occur
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Run automations at specific times or intervals
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <GitBranch className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Conditional Logic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Branch workflows based on conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Automation Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Automation Types</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Member Lifecycle</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Engage members throughout their journey:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Welcome sequence:</strong> Onboarding emails over first week</li>
                  <li><strong>Milestone celebrations:</strong> 1 month, 6 months, 1 year anniversaries</li>
                  <li><strong>Birthday wishes:</strong> Automated birthday messages with offers</li>
                  <li><strong>Renewal reminders:</strong> Alerts before membership expires</li>
                  <li><strong>Re-engagement:</strong> Win-back campaigns for lapsed members</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Attendance & Engagement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Monitor and respond to member activity:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>No-show follow-up:</strong> Check in after missed classes</li>
                  <li><strong>Inactivity alerts:</strong> Flag members who haven't visited</li>
                  <li><strong>Engagement scoring:</strong> Calculate and update engagement levels</li>
                  <li><strong>Class feedback:</strong> Request reviews after classes</li>
                  <li><strong>Achievement notifications:</strong> Celebrate fitness milestones</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Automate routine communications:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Booking confirmations:</strong> Auto-send after bookings</li>
                  <li><strong>Class reminders:</strong> Remind members of upcoming classes</li>
                  <li><strong>Payment receipts:</strong> Send after successful payments</li>
                  <li><strong>Payment failures:</strong> Alert members of failed payments</li>
                  <li><strong>Waitlist notifications:</strong> Notify when spots open</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Operations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Streamline backend operations:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Staff notifications:</strong> Alert staff of important events</li>
                  <li><strong>Lead assignment:</strong> Auto-assign leads to sales team</li>
                  <li><strong>Report generation:</strong> Scheduled daily/weekly reports</li>
                  <li><strong>Data cleanup:</strong> Archive old records automatically</li>
                  <li><strong>Inventory alerts:</strong> Notify when stock is low</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Creating Automations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating an Automation</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Automation Builder">
              Navigate to <strong>Settings → Automations</strong> and click <strong>Create Automation</strong>.
            </DocStep>
            
            <DocStep stepNumber={2} title="Choose a Trigger">
              Select what starts the automation:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Event-based:</strong> Member signs up, books class, checks in, etc.</li>
                <li><strong>Time-based:</strong> Specific time, recurring schedule</li>
                <li><strong>Condition-based:</strong> When data matches criteria (e.g., membership expires in 7 days)</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Add Conditions (Optional)">
              Filter which records trigger the automation:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Membership type equals "Premium"</li>
                <li>Member age is greater than 18</li>
                <li>Last visit was more than 14 days ago</li>
                <li>Has email marketing consent</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Define Actions">
              Choose what happens when triggered:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Send email:</strong> Use templates or custom content</li>
                <li><strong>Send SMS:</strong> Text messages to members</li>
                <li><strong>Push notification:</strong> In-app notifications</li>
                <li><strong>Update record:</strong> Change member data</li>
                <li><strong>Add task:</strong> Create follow-up tasks for staff</li>
                <li><strong>Add tag:</strong> Tag members for segmentation</li>
                <li><strong>Webhook:</strong> Send data to external systems</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Add Delays (Optional)">
              Wait between actions:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Wait 1 hour after signup before sending welcome email</li>
                <li>Wait until next morning (9am) to send reminder</li>
                <li>Wait 7 days then check if still inactive</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={6} title="Test & Activate">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Use <strong>Test Mode</strong> to simulate with sample data</li>
                <li>Preview emails and messages before activating</li>
                <li>Toggle automation to <strong>Active</strong> when ready</li>
              </ul>
            </DocStep>
          </div>
        </section>

        {/* Multi-Step Sequences */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Multi-Step Sequences</h2>
          <p className="text-muted-foreground mb-4">
            Create sequences of actions that happen over time.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Example: New Member Welcome Sequence</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium">Immediately</p>
                  <p className="text-sm text-muted-foreground">Send welcome email with getting started guide</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium">After 24 hours</p>
                  <p className="text-sm text-muted-foreground">Send email introducing the member app</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium">After 3 days</p>
                  <p className="text-sm text-muted-foreground">Check if they've visited → If no, send "We miss you" email</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-medium">After 7 days</p>
                  <p className="text-sm text-muted-foreground">Send class recommendation email based on interests</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                <div>
                  <p className="font-medium">After 14 days</p>
                  <p className="text-sm text-muted-foreground">Request feedback survey about first two weeks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conditional Branching */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Conditional Branching</h2>
          <p className="text-muted-foreground mb-4">
            Create different paths based on conditions.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">If/Then Conditions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="p-3 bg-muted rounded">
                  <p className="font-medium">IF membership type = "VIP"</p>
                  <p className="text-muted-foreground">→ Send premium welcome package</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="font-medium">ELSE IF membership type = "Standard"</p>
                  <p className="text-muted-foreground">→ Send standard welcome email</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="font-medium">ELSE</p>
                  <p className="text-muted-foreground">→ Send basic welcome message</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Split Paths</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="p-3 bg-muted rounded">
                  <p className="font-medium">Check: Has member visited in last 7 days?</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded border-l-4 border-green-500">
                  <p className="text-green-400 font-medium">YES →</p>
                  <p className="text-muted-foreground">Tag as "Active", continue engagement</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded border-l-4 border-red-500">
                  <p className="text-red-400 font-medium">NO →</p>
                  <p className="text-muted-foreground">Tag as "At Risk", trigger re-engagement sequence</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Available Triggers */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Available Triggers</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Member Events</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member signs up
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member checks in
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member books class
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member cancels class
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member no-shows
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Membership expires
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Member's birthday
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Payment Events</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Payment successful
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Payment failed
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Subscription renewed
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Subscription cancelled
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Refund processed
                </li>
              </ul>
              
              <h3 className="font-semibold mb-3 mt-6">Time-Based</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Daily at specific time
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  Weekly on specific day
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Trigger</Badge>
                  X days before/after date
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Monitoring & Logs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Monitoring & Logs</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Execution Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Monitor all automations in real-time:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Total runs today/this week/this month</li>
                  <li>Success vs failure rates</li>
                  <li>Currently running automations</li>
                  <li>Queue of pending actions</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Execution History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>View detailed logs for each run:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Which member triggered it</li>
                  <li>What actions were taken</li>
                  <li>Timestamps for each step</li>
                  <li>Any errors that occurred</li>
                  <li>Outputs and results</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocTip className="mt-4">
            Set up Slack or email notifications for failed automations so you can 
            quickly address issues.
          </DocTip>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-3">Do</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Start simple and add complexity gradually</li>
                <li>✓ Test automations thoroughly before activating</li>
                <li>✓ Use meaningful names for easy identification</li>
                <li>✓ Add delays to avoid overwhelming members</li>
                <li>✓ Respect communication preferences</li>
                <li>✓ Monitor execution logs regularly</li>
                <li>✓ Document what each automation does</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-3">Don't</h3>
              <ul className="space-y-2 text-sm">
                <li>✗ Create overlapping automations</li>
                <li>✗ Send too many messages at once</li>
                <li>✗ Forget to handle edge cases</li>
                <li>✗ Leave broken automations running</li>
                <li>✗ Ignore unsubscribe preferences</li>
                <li>✗ Create infinite loops</li>
                <li>✗ Overcomplicate simple tasks</li>
              </ul>
            </div>
          </div>
          
          <DocWarning className="mt-4">
            Always check member consent before sending marketing communications. 
            GDPR and privacy laws apply to automated messages too!
          </DocWarning>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can automations run while I'm asleep?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Automations run 24/7 in the cloud. You can set "quiet hours" to prevent 
                messages from being sent at inconvenient times.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">What happens if an automation fails?</h4>
              <p className="text-sm text-muted-foreground">
                Failed automations are logged and can be set to retry automatically. You'll 
                receive a notification (if configured) so you can investigate and fix the issue.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I stop an automation mid-sequence?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel pending actions for specific members or pause the entire 
                automation. Members can also unsubscribe from sequences.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How many automations can I have?</h4>
              <p className="text-sm text-muted-foreground">
                There's no limit to the number of automations. However, we recommend keeping 
                them organised and avoiding duplicates for better management.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymAutomationsAdvanced;
