import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  CalendarCheck, 
  Clock, 
  MessageSquare, 
  Users,
  Repeat,
  Settings,
  Variable,
  Play,
  Pause,
  Trash2,
  Send
} from "lucide-react";

export default function ScheduledCheckinsDocs() {
  return (
    <DocsLayout
      title="Scheduled Check-ins"
      description="Schedule automated check-in messages to specific clients on a recurring basis."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" }, 
        { label: "Automations", href: "/docs/coach/automations" },
        { label: "Scheduled Check-ins" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-green-500" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Scheduled Check-ins are for coaches who want to maintain regular touchpoints with 
          clients without manually sending individual messages. They're ideal for weekly 
          progress check-ins, monthly reviews, or any recurring client communication.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          Scheduled Check-ins let you create custom messages that are automatically sent 
          to selected clients at times you define. Unlike Reminder Templates which use 
          pre-defined templates, Check-ins are fully custom messages for specific purposes.
        </p>
        
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-3">Key Differences from Reminders</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-1">Scheduled Check-ins</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Fully custom messages</li>
                <li>• Select specific clients</li>
                <li>• One-time or recurring</li>
                <li>• For progress updates, questions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-1">Reminder Templates</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Reusable templates</li>
                <li>• Assign to any client</li>
                <li>• Daily or weekly patterns</li>
                <li>• For habits, prompts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground mb-4">
          Regular check-ins are crucial for client success, but:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Manually messaging each client weekly is time-consuming</li>
          <li>It's easy to forget clients when you have a busy roster</li>
          <li>Consistent communication improves retention and outcomes</li>
          <li>Clients feel supported when they hear from you regularly</li>
        </ul>
        <p className="text-muted-foreground">
          Scheduled Check-ins ensure every client gets personal touchpoints without 
          requiring you to remember and send each message manually.
        </p>
      </section>

      {/* Frequency Options */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          Frequency Options
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Once</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send the message a single time at a specific date and time. Perfect for 
              scheduled follow-ups or one-off check-ins.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Daily</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send the message every day at the specified time. Useful for intense 
              programs requiring daily coach contact.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Weekly</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send on a specific day each week (e.g., every Sunday at 6 PM). 
              Most popular option for progress check-ins.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Monthly</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send on a specific day each month (e.g., 1st of every month). 
              Great for monthly reviews or subscription reminders.
            </p>
          </div>
        </div>
      </section>

      {/* How to Set It Up */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          How to Set It Up
        </h2>
        <DocStep stepNumber={1} title="Go to Automations → Check-ins">
          From your coach dashboard, navigate to Automations and select the Scheduled Check-ins tab.
        </DocStep>
        <DocStep stepNumber={2} title="Create New Check-in">
          Click the "New Check-in" button to open the creation form.
        </DocStep>
        <DocStep stepNumber={3} title="Select clients">
          Choose which clients should receive this check-in. You can select multiple clients 
          who will all receive the same message.
        </DocStep>
        <DocStep stepNumber={4} title="Write your message">
          Compose the check-in message. Use variables for personalization. Keep it conversational 
          and open-ended to encourage responses.
        </DocStep>
        <DocStep stepNumber={5} title="Set the schedule">
          Choose the frequency (once, daily, weekly, monthly), the day, and the time.
        </DocStep>
        <DocStep stepNumber={6} title="Save and activate">
          Save the check-in. It will be active immediately and send at the next scheduled time.
        </DocStep>

        <DocTip>
          Use the "Test" button to send the message to yourself first. This helps you 
          verify the message looks right before it goes to clients.
        </DocTip>
      </section>

      {/* Message Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Variable className="h-5 w-5 text-primary" />
          Message Variables
        </h2>
        <p className="text-muted-foreground mb-4">
          Use these variables to personalise your check-in messages:
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
                <td className="py-2 pr-4 font-mono text-primary">{"{coach_name}"}</td>
                <td className="py-2">Your name</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-2">Example Check-in Messages</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="italic">
              <strong>Weekly Progress:</strong> "Hey {"{client_name}"}! How's the week been? 
              Any wins to celebrate? Any struggles I can help with? Drop me a quick update 
              when you get a chance."
            </p>
            <p className="italic">
              <strong>Monthly Review:</strong> "Hi {"{client_name}"}! It's the start of a new 
              month – perfect time to reflect. How do you feel about your progress last month? 
              Let's chat about goals for the month ahead."
            </p>
            <p className="italic">
              <strong>Mid-week Motivation:</strong> "Happy Wednesday {"{client_name}"}! You're 
              halfway through the week. How are you feeling about your training? Keep pushing!"
            </p>
          </div>
        </div>
      </section>

      {/* Managing Check-ins */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Managing Your Check-ins
        </h2>
        <p className="text-muted-foreground mb-4">
          The Scheduled Check-ins dashboard shows all your active and upcoming check-ins:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Play className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Active</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Check-ins that are running and will send at their scheduled times.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Pause className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Pause/Resume</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Temporarily pause a check-in. The schedule is preserved and resumes 
                from where it left off when reactivated.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Send className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Send Now</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Immediately send the check-in outside its normal schedule. Useful for 
                testing or when you want to reach out early.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Delete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently remove the check-in. This cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Messages Are Delivered */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          How Messages Are Delivered
        </h2>
        <p className="text-muted-foreground mb-4">
          Scheduled check-in messages are delivered through:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Push Notification</h3>
            <p className="text-sm text-muted-foreground mt-1">
              If the client has push notifications enabled, they receive an instant 
              notification on their device when the check-in is sent.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">In-App Message</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The message appears in the client's message inbox within the app. 
              They can view and reply just like any other message from you.
            </p>
          </div>
        </div>
        <DocInfo>
          Check-in messages appear to come directly from you. Clients won't see any 
          indication that the message was automated, maintaining a personal feel.
        </DocInfo>
      </section>

      {/* What Happens When */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Happens When...</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">You pause a check-in</h3>
            <p className="text-sm text-muted-foreground">
              The check-in stops sending immediately. When you resume it, the system 
              recalculates the next send time based on the original schedule.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">A "once" check-in is sent</h3>
            <p className="text-sm text-muted-foreground">
              One-time check-ins are automatically marked as completed after sending. 
              They remain in your history but won't send again.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">The client relationship ends</h3>
            <p className="text-sm text-muted-foreground">
              If a client's subscription ends or you remove them, their check-ins 
              are automatically paused. They won't receive further messages.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Delivery fails</h3>
            <p className="text-sm text-muted-foreground">
              If a message fails to deliver (rare), it's logged as "failed" in the 
              check-in status. You can retry or send manually.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-medium">Keep it conversational</h3>
              <p className="text-sm text-muted-foreground">
                Write messages as if you're personally reaching out. Avoid robotic 
                or templated language.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-medium">Ask open-ended questions</h3>
              <p className="text-sm text-muted-foreground">
                Questions like "How's the week going?" encourage clients to respond 
                and share what's on their mind.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-medium">Time it right</h3>
              <p className="text-sm text-muted-foreground">
                Schedule check-ins for times when clients are likely to be available 
                to read and respond. Evenings often work well.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-medium">Don't overdo it</h3>
              <p className="text-sm text-muted-foreground">
                Weekly check-ins are usually enough. Daily automated messages can 
                feel overwhelming and impersonal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          Check-ins are sent regardless of whether the client replied to the previous one. 
          Consider pausing check-ins for clients who consistently don't respond.
        </DocWarning>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
          <li>Messages cannot include images or file attachments</li>
          <li>You cannot schedule check-ins for past dates/times</li>
          <li>Monthly check-ins on the 29th-31st may skip months without those dates</li>
          <li>Timezone is based on your settings, not the client's</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I edit a check-in after creating it?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. You can edit the message, schedule, and client selection at any time. 
              Changes apply from the next scheduled send.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can clients reply to check-in messages?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. Check-in messages appear in the normal message thread. Clients can 
              reply as they would to any message from you.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">How do I know if check-ins were delivered?</h3>
            <p className="text-sm text-muted-foreground">
              The check-in list shows delivery status (sent, failed, scheduled). 
              You can also see the last sent time and next scheduled time.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What's the difference between this and Drop-off Rescue?</h3>
            <p className="text-sm text-muted-foreground">
              Drop-off Rescue triggers based on client INACTIVITY. Scheduled Check-ins 
              are time-based and send regardless of what the client is doing.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
