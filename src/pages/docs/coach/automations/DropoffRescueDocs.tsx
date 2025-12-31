import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  UserMinus, 
  Clock, 
  MessageSquare, 
  Bell, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  Variable
} from "lucide-react";

export default function DropoffRescueDocs() {
  return (
    <DocsLayout
      title="Drop-off Rescue"
      description="Automatically detect and re-engage clients who become inactive before they churn."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" }, 
        { label: "Automations", href: "/docs/coach/automations" },
        { label: "Drop-off Rescue" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-red-500" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Drop-off Rescue is for coaches who want to catch and re-engage clients before they 
          lose motivation and disappear. It's especially valuable if you have multiple clients 
          and can't manually track everyone's activity daily.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          Drop-off Rescue monitors your clients' activity and automatically takes action when 
          someone becomes inactive. It works in three stages:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">1</span>
              </div>
              <h3 className="font-medium">Stage 1: Soft Check-in</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              After a client is inactive for your configured number of days (default: 3 days), 
              an automatic check-in message is sent to the client. This is a gentle nudge to 
              get them back on track.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-500 font-bold">2</span>
              </div>
              <h3 className="font-medium">Stage 2: Coach Alert</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              If the client remains inactive for longer (default: 7 days), you receive a 
              notification alerting you that this client needs personal attention. The system 
              flags them as "at risk."
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 font-bold">3</span>
              </div>
              <h3 className="font-medium">Stage 3: Critical Escalation</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              After extended inactivity (default: 14 days), the client is marked as critical. 
              You receive an urgent notification. This is your last chance to intervene before 
              they potentially cancel their subscription.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground mb-4">
          Client drop-off is one of the biggest challenges coaches face. Research shows that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Most clients who become inactive don't tell their coach they're struggling</li>
          <li>The longer a client stays inactive, the harder it is to re-engage them</li>
          <li>Early intervention (within the first week) has the highest success rate</li>
          <li>A simple check-in message can be enough to get clients back on track</li>
        </ul>
        <p className="text-muted-foreground">
          Drop-off Rescue automates the detection and initial outreach, giving you more time 
          to focus on clients who need deeper support.
        </p>
      </section>

      {/* How It Works - Timing Logic */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          How the Timing Works
        </h2>
        <p className="text-muted-foreground mb-4">
          The system measures inactivity from the client's <strong>last activity date</strong>. 
          Activity includes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
          <li>Logging a workout</li>
          <li>Sending or receiving a message</li>
          <li>Attending a session</li>
          <li>Logging meals or habits</li>
          <li>Updating progress measurements</li>
        </ul>
        
        <div className="p-4 rounded-lg border border-border bg-card/50 mb-4">
          <h3 className="font-medium mb-2">Example Timeline</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Day 0:</strong> Client completes their last workout</p>
            <p><strong>Day 3:</strong> No activity → Stage 1 message sent automatically</p>
            <p><strong>Day 4:</strong> Client logs a workout → Rescue flow resets, countdown starts fresh</p>
            <p><strong>— OR —</strong></p>
            <p><strong>Day 7:</strong> Still no activity → You receive Stage 2 alert</p>
            <p><strong>Day 14:</strong> Still no activity → Critical Stage 3 alert</p>
          </div>
        </div>

        <DocInfo>
          The countdown resets whenever the client records any activity. This means the 
          automation only triggers for genuinely inactive clients.
        </DocInfo>
      </section>

      {/* How to Set It Up */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          How to Set It Up
        </h2>
        <DocStep stepNumber={1} title="Go to Automations">
          From your coach dashboard, navigate to <strong>Automations</strong> in the sidebar.
        </DocStep>
        <DocStep stepNumber={2} title="Select Drop-off Rescue">
          Click on the <strong>Drop-off Rescue</strong> tab to view the settings.
        </DocStep>
        <DocStep stepNumber={3} title="Enable the automation">
          Toggle the switch to enable Drop-off Rescue. You can configure it before enabling.
        </DocStep>
        <DocStep stepNumber={4} title="Set your timing">
          Adjust the number of days for each stage:
          • Stage 1 (Soft Check-in): Recommended 2-4 days
          • Stage 2 (Coach Alert): Recommended 5-7 days  
          • Stage 3 (Critical): Recommended 10-14 days
        </DocStep>
        <DocStep stepNumber={5} title="Customise your message">
          Write the automatic message that gets sent at Stage 1. Use variables to personalise it.
        </DocStep>
        <DocStep stepNumber={6} title="Save your settings">
          Click Save. The automation will start monitoring all your active clients immediately.
        </DocStep>
      </section>

      {/* Message Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Variable className="h-5 w-5 text-primary" />
          Message Variables
        </h2>
        <p className="text-muted-foreground mb-4">
          Use these variables in your Stage 1 message to personalise it:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Variable</th>
                <th className="text-left py-2 font-medium">What it shows</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{client_name}"}</td>
                <td className="py-2">Client's first name</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{days_inactive}"}</td>
                <td className="py-2">Number of days since last activity</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{coach_name}"}</td>
                <td className="py-2">Your name</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{last_activity_date}"}</td>
                <td className="py-2">Date of their last recorded activity</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-2">Example Message</h3>
          <p className="text-sm text-muted-foreground italic">
            "Hey {"{client_name}"}! I noticed it's been {"{days_inactive}"} days since your last 
            workout. Everything okay? Remember, consistency beats perfection - even a quick 
            10-minute session counts. I'm here if you need to adjust your plan. 💪"
          </p>
        </div>
      </section>

      {/* What Happens When */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Happens When...</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-400">Client becomes active again</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The rescue flow stops immediately. All pending stages are cancelled. 
                  The countdown resets and starts fresh from the new activity date.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-400">You pause the automation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All current rescue flows stop. No more messages will be sent. 
                  When you re-enable it, the system recalculates who needs attention based on current inactivity.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-400">Client doesn't respond after Stage 3</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The automation doesn't send additional messages beyond Stage 1. 
                  Stages 2 and 3 are alerts for YOU to take personal action. The system won't spam clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practice Setup */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Practice Setup</h2>
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-3">Recommended Settings</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Stage 1 (Soft Check-in)</span>
              <span className="font-medium">3 days</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Stage 2 (Coach Alert)</span>
              <span className="font-medium">7 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Stage 3 (Critical)</span>
              <span className="font-medium">14 days</span>
            </div>
          </div>
        </div>
        <DocTip>
          If your clients train 3+ times per week, consider shorter Stage 1 timing (2 days). 
          For clients on less frequent programs, 4-5 days may be more appropriate.
        </DocTip>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          Drop-off Rescue only sends ONE automated message (at Stage 1). Stages 2 and 3 
          are notifications to you, not additional messages to clients. This prevents 
          clients from feeling harassed by automated follow-ups.
        </DocWarning>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
          <li>The automation runs once per day at midnight UTC to check client activity</li>
          <li>New clients have a 7-day grace period before the automation starts tracking them</li>
          <li>Clients on vacation mode or paused subscriptions are excluded</li>
          <li>You cannot configure different timing for different clients (applies to all)</li>
        </ul>
      </section>

      {/* Common Use Cases */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Busy professionals</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Clients with demanding jobs often have weeks where work takes over. 
              A timely check-in reminds them their coach is watching and helps prevent 
              a one-week break from becoming a month.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Motivation slumps</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Clients who were doing well but suddenly stop often just need a small nudge. 
              The Stage 1 message gives them a non-judgmental reason to re-engage.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Early warning system</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When you receive Stage 2 or 3 alerts, it's your cue to reach out personally 
              with a phone call or voice note. These high-touch moments often save clients 
              who would otherwise churn.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Does this work for clients on monthly programs?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. The activity tracking works regardless of their subscription type or 
              program structure. It's based on their actual activity, not scheduled sessions.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I see who's currently in the rescue flow?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. The Automations dashboard shows clients currently at risk, which stage 
              they're in, and when the last automated action was taken.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What if I message a client manually before Stage 1?</h3>
            <p className="text-sm text-muted-foreground">
              Your manual message counts as activity and resets their inactivity timer. 
              The Stage 1 automated message won't be sent.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can clients mute or opt out of these messages?</h3>
            <p className="text-sm text-muted-foreground">
              Clients cannot specifically opt out of rescue messages. However, if they 
              disable push notifications, they'll only see messages when they open the app.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
