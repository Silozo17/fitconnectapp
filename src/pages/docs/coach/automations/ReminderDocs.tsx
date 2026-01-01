import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  Bell, 
  Clock, 
  Dumbbell,
  Utensils,
  Droplet,
  Moon,
  Heart,
  Settings,
  Users,
  Pause,
  Trash2,
  Variable
} from "lucide-react";

export default function ReminderDocs() {
  return (
    <DocsLayout
      title="Reminder Templates | FitConnect Coach Guide"
      description="Create reusable reminder templates for habits, logs and check-ins. Help clients stay consistent."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" }, 
        { label: "Automations", href: "/docs/coach/automations" },
        { label: "Reminders" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Reminder Templates are for coaches who want to help clients build consistent habits 
          through regular prompts. They're especially useful for clients who need external 
          accountability or tend to forget daily tasks like hydration or meal prep.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          Reminder Templates let you create reusable reminder messages that can be assigned 
          to individual clients or groups. Once assigned, reminders are sent automatically 
          at the scheduled time and frequency.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">Reminder Categories</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Dumbbell className="h-5 w-5 text-purple-500 mb-2" />
            <h4 className="font-medium">Workout</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Remind clients to complete their scheduled training session.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Utensils className="h-5 w-5 text-orange-500 mb-2" />
            <h4 className="font-medium">Nutrition</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Meal prep reminders, food logging prompts, or macro targets.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Droplet className="h-5 w-5 text-blue-500 mb-2" />
            <h4 className="font-medium">Hydration</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Daily water intake reminders to help clients stay hydrated.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Moon className="h-5 w-5 text-indigo-500 mb-2" />
            <h4 className="font-medium">Sleep</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Bedtime reminders and sleep tracking prompts.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Heart className="h-5 w-5 text-pink-500 mb-2" />
            <h4 className="font-medium">Mindfulness</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Meditation, breathing exercises, or mental wellness check-ins.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Bell className="h-5 w-5 text-gray-500 mb-2" />
            <h4 className="font-medium">General</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Custom reminders that don't fit other categories.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground mb-4">
          Consistency is the key to results, but many clients struggle with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Forgetting to complete daily tasks (especially new habits)</li>
          <li>Getting distracted and missing workout windows</li>
          <li>Needing external prompts to stay accountable</li>
          <li>Losing motivation without regular coach touchpoints</li>
        </ul>
        <p className="text-muted-foreground">
          Reminder Templates provide consistent nudges that help clients build habits 
          without requiring you to manually message each client every day.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          How the Timing Works
        </h2>
        <p className="text-muted-foreground mb-4">
          Reminders can be scheduled with different frequencies:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Daily</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sent every day at the specified time. Best for habits you want clients 
              to do daily (hydration, morning routines).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Weekly</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sent on selected days of the week. Example: Monday, Wednesday, Friday 
              for a 3x/week training schedule.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Custom</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose specific days using a flexible selector for irregular schedules.
            </p>
          </div>
        </div>
        <DocInfo>
          Reminders are sent at the exact time you specify, converted to the client's 
          local timezone. A 9 AM reminder arrives at 9 AM for each client.
        </DocInfo>
      </section>

      {/* How to Set It Up */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          How to Set It Up
        </h2>
        
        <h3 className="font-medium mb-3 mt-6">Creating a Template</h3>
        <DocStep stepNumber={1} title="Go to Automations → Reminders">
          From your coach dashboard, navigate to Automations and select the Reminders tab.
        </DocStep>
        <DocStep stepNumber={2} title="Create New Template">
          Click the "Create Template" button to open the template editor.
        </DocStep>
        <DocStep stepNumber={3} title="Choose a category">
          Select the reminder category (Workout, Nutrition, Hydration, etc.). This helps 
          with organization and filtering.
        </DocStep>
        <DocStep stepNumber={4} title="Write your message">
          Enter the reminder message. Keep it short and actionable. Use variables for personalization.
        </DocStep>
        <DocStep stepNumber={5} title="Save the template">
          Click Save. The template is now available to assign to clients.
        </DocStep>

        <h3 className="font-medium mb-3 mt-8">Assigning to Clients</h3>
        <DocStep stepNumber={1} title="Select a template">
          From the template list, click "Assign to Clients" or use the quick-assign button.
        </DocStep>
        <DocStep stepNumber={2} title="Choose clients">
          Select which clients should receive this reminder. You can search and multi-select.
        </DocStep>
        <DocStep stepNumber={3} title="Set the schedule">
          Choose the frequency (daily, weekly, specific days) and the time of day.
        </DocStep>
        <DocStep stepNumber={4} title="Activate">
          Toggle the reminder active. It will start sending at the next scheduled time.
        </DocStep>
      </section>

      {/* Message Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Variable className="h-5 w-5 text-primary" />
          Message Variables
        </h2>
        <p className="text-muted-foreground mb-4">
          Use these variables to personalise your reminder messages:
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
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{day}"}</td>
                <td className="py-2">Current day of the week</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-2">Example Reminders</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="italic">
              <strong>Workout:</strong> "Hey {"{client_name}"}! Time for your {"{day}"} workout. 
              Let's crush it! 💪"
            </p>
            <p className="italic">
              <strong>Hydration:</strong> "Quick reminder to drink some water, {"{client_name}"}. 
              Aim for 8 glasses today! 💧"
            </p>
            <p className="italic">
              <strong>Sleep:</strong> "It's almost bedtime! Start winding down for 7-8 hours 
              of quality sleep. Your gains depend on it! 😴"
            </p>
          </div>
        </div>
      </section>

      {/* Managing Reminders */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Managing Active Reminders
        </h2>
        <p className="text-muted-foreground mb-4">
          Once reminders are assigned, you can manage them from the Active Reminders section:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Pause className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Pause/Resume</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Temporarily pause a reminder without deleting it. Useful when a client 
                is on vacation or needs a break.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Delete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently remove a reminder assignment. The template is preserved 
                and can be reassigned later.
              </p>
            </div>
          </div>
        </div>
        <DocTip>
          System templates (marked with a badge) cannot be deleted, only user-created 
          templates can be removed. System templates are designed for common use cases.
        </DocTip>
      </section>

      {/* What Happens After Setup */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Happens After Setup</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Reminders are sent automatically at the scheduled times</li>
          <li>Clients receive a push notification (if enabled) and an in-app message</li>
          <li>You can view delivery status in the Active Reminders list</li>
          <li>Reminders continue until paused, deleted, or the client relationship ends</li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          Reminders are sent regardless of whether the client has completed the task. 
          They're prompts, not conditional messages based on activity.
        </DocWarning>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
          <li>Maximum of 10 active reminders per client to prevent notification fatigue</li>
          <li>Reminders cannot include images or file attachments</li>
          <li>Delivery timing depends on the client having the app installed</li>
          <li>System templates cannot be edited or deleted, only user templates</li>
        </ul>
      </section>

      {/* Common Use Cases */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Morning routine</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set a daily reminder at 7 AM for hydration, stretching, or mindfulness 
              to help clients start their day right.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Workout accountability</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send reminders on training days 30 minutes before their usual workout 
              time to reduce no-shows.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Sunday meal prep</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly reminder on Sunday morning to prep meals for the week ahead. 
              Include a motivating message about setting up for success.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I send different reminders to different clients?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. Each reminder assignment is per-client. You can assign different 
              templates with different schedules to each client.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What timezone are reminders sent in?</h3>
            <p className="text-sm text-muted-foreground">
              Reminders are sent in the client's local timezone based on their device 
              settings. A 9 AM reminder arrives at 9 AM their time.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can clients opt out of reminders?</h3>
            <p className="text-sm text-muted-foreground">
              Clients can disable push notifications from their device settings, but 
              they'll still see reminders in their in-app messages.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">How many templates can I create?</h3>
            <p className="text-sm text-muted-foreground">
              There's no limit on the number of templates you can create. Create as 
              many as you need for different scenarios.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
