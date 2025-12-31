import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  ArrowRight,
  UserMinus,
  Trophy,
  Bell,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const automationGuides = [
  {
    title: "Drop-off Rescue",
    description: "Automatically detect and re-engage clients who become inactive.",
    href: "/docs/coach/automations/dropoff-rescue",
    icon: UserMinus,
    color: "text-red-500",
  },
  {
    title: "Milestone Celebrations",
    description: "Celebrate client achievements with automatic congratulations.",
    href: "/docs/coach/automations/milestones",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    title: "Reminder Templates",
    description: "Send recurring reminders for workouts, habits, and nutrition.",
    href: "/docs/coach/automations/reminders",
    icon: Bell,
    color: "text-blue-500",
  },
  {
    title: "Scheduled Check-ins",
    description: "Set up automated check-in messages on a schedule you define.",
    href: "/docs/coach/automations/checkins",
    icon: CalendarCheck,
    color: "text-green-500",
  },
];

export default function CoachAutomationsOverview() {
  return (
    <DocsLayout
      title="Automations"
      description="Save time and improve client retention with automated workflows that run in the background."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "Automations" }]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Automations are designed for coaches who want to maintain consistent client engagement 
          without spending hours on repetitive tasks. Whether you have 5 clients or 50, automations 
          help you deliver a premium coaching experience at scale.
        </p>
      </section>

      {/* What Automations Do */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Automations Do</h2>
        <p className="text-muted-foreground mb-4">
          Automations work in the background to handle routine communication and engagement tasks. 
          They monitor client activity, trigger messages at the right time, and alert you when 
          personal attention is needed.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
            <h3 className="font-medium">What they do</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Send messages automatically based on triggers</li>
              <li>• Detect when clients need attention</li>
              <li>• Celebrate achievements without you lifting a finger</li>
              <li>• Keep clients engaged between sessions</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <AlertCircle className="h-5 w-5 text-amber-500 mb-2" />
            <h3 className="font-medium">What they don't do</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Replace personal coaching conversations</li>
              <li>• Create custom training plans</li>
              <li>• Make decisions about client programs</li>
              <li>• Override your direct communication</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Automation Types */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Automation Types</h2>
        <div className="grid gap-4">
          {automationGuides.map((guide) => (
            <Link key={guide.href} to={guide.href} className="no-underline">
              <Card className="hover:border-primary/50 transition-colors bg-card">
                <CardHeader className="pb-2 flex-row items-start gap-4">
                  <guide.icon className={`h-8 w-8 ${guide.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription className="mt-1">{guide.description}</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Plan Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Plan Requirements</h2>
        <p className="text-muted-foreground mb-4">
          Automations are available on the <strong>Pro plan</strong> and above. 
          Coaches on the Free or Starter plans can preview the automation settings 
          but cannot enable them until they upgrade.
        </p>
        <DocInfo>
          You can configure your automations before upgrading. Once you upgrade to Pro, 
          they'll start running automatically based on your settings.
        </DocInfo>
      </section>

      {/* How Messages Are Delivered */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          How Messages Are Delivered
        </h2>
        <p className="text-muted-foreground mb-4">
          All automated messages are delivered through two channels:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              If the client has push notifications enabled, they'll receive an instant notification 
              on their phone or browser. This is the most visible delivery method.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">In-App Messages</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All automated messages appear in the client's message inbox within the app. 
              Even if push notifications are disabled, clients will see messages when they open the app.
            </p>
          </div>
        </div>
        <DocTip>
          Automated messages appear to come from you, the coach. Clients won't know the message 
          was automated unless you tell them. This maintains a personal touch.
        </DocTip>
      </section>

      {/* Best Practices */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-medium">Start with Drop-off Rescue</h3>
              <p className="text-sm text-muted-foreground">
                This is the highest-impact automation. It helps you catch and re-engage clients 
                before they lose motivation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-medium">Personalise your messages</h3>
              <p className="text-sm text-muted-foreground">
                Use variables like {"{client_name}"} to make automated messages feel personal. 
                Generic messages are less effective.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-medium">Don't over-automate</h3>
              <p className="text-sm text-muted-foreground">
                Choose 2-3 automations that fit your coaching style. Too many automated messages 
                can feel impersonal and overwhelming for clients.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-medium">Monitor and adjust</h3>
              <p className="text-sm text-muted-foreground">
                Check your automation logs regularly. If clients aren't responding well, 
                adjust your messages or timing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Will clients know messages are automated?</h3>
            <p className="text-sm text-muted-foreground">
              No. Automated messages appear as regular messages from you. There's no "automated" 
              label visible to clients.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I pause all automations at once?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. Each automation type has its own toggle. You can disable them individually 
              or all at once from the Automations dashboard.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What happens if I downgrade from Pro?</h3>
            <p className="text-sm text-muted-foreground">
              Your automation settings are preserved, but automations stop running. 
              When you upgrade again, they'll resume with your saved settings.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I exclude specific clients from automations?</h3>
            <p className="text-sm text-muted-foreground">
              Some automations allow you to select which clients they apply to. 
              For example, Scheduled Check-ins let you choose specific clients to receive messages.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
