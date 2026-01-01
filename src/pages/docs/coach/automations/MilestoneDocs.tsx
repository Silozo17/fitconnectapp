import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  Trophy, 
  Award,
  Flame,
  Target,
  Dumbbell,
  CheckCircle2,
  Settings,
  Variable,
  Sparkles
} from "lucide-react";

export default function MilestoneDocs() {
  return (
    <DocsLayout
      title="Milestone Celebrations | FitConnect Coach Guide"
      description="Automatically celebrate client milestones with custom messages. Award badges for achievements."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" }, 
        { label: "Automations", href: "/docs/coach/automations" },
        { label: "Milestones" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Milestone Celebrations are for coaches who want to recognise client achievements 
          instantly without having to manually track every accomplishment. It's especially 
          valuable for maintaining motivation and showing clients their progress is noticed.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          Milestone Celebrations automatically detects when clients hit important achievements 
          and sends them a congratulatory message. You can also award badges as part of the 
          celebration.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">Milestone Types</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Flame className="h-5 w-5 text-orange-500 mb-2" />
            <h4 className="font-medium">Session Streaks</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Celebrate when clients complete consecutive days or weeks of training. 
              Example: 7-day streak, 30-day streak.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
            <h4 className="font-medium">Program Completion</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Congratulate clients when they complete an entire assigned program or plan.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Target className="h-5 w-5 text-blue-500 mb-2" />
            <h4 className="font-medium">Adherence Targets</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Recognize when clients hit adherence goals. Example: 90% workout completion 
              this month.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Dumbbell className="h-5 w-5 text-purple-500 mb-2" />
            <h4 className="font-medium">Personal Records</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Celebrate when clients log a new personal best (PR) for tracked exercises.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground mb-4">
          Recognition is one of the most powerful motivators in fitness. Studies show that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Clients who receive timely recognition are more likely to stay consistent</li>
          <li>Celebrating small wins builds momentum toward bigger goals</li>
          <li>Feeling seen and acknowledged strengthens the coach-client relationship</li>
          <li>External recognition can be more motivating than internal satisfaction alone</li>
        </ul>
        <p className="text-muted-foreground">
          Manual tracking of every client achievement is time-consuming. Milestone Celebrations 
          ensures no achievement goes unnoticed while freeing you to focus on coaching.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <p className="text-muted-foreground mb-4">
          The system continuously monitors client activity. When a milestone threshold is reached:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-medium">Detection</h3>
              <p className="text-sm text-muted-foreground">
                The system detects the achievement (e.g., client just logged their 7th consecutive day).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-medium">Message Sent</h3>
              <p className="text-sm text-muted-foreground">
                Your personalised celebration message is sent to the client via push notification 
                and in-app message.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-medium">Badge Awarded (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                If you've configured a badge for this milestone, it's automatically added to 
                the client's profile.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-medium">Prevention of Duplicates</h3>
              <p className="text-sm text-muted-foreground">
                The same milestone is only celebrated once. A client won't receive multiple 
                messages for the same 7-day streak.
              </p>
            </div>
          </div>
        </div>
        <DocInfo>
          Milestones are detected in near real-time. Within minutes of a client hitting a 
          threshold, the celebration message is sent.
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
        <DocStep stepNumber={2} title="Select Milestones">
          Click on the <strong>Milestones</strong> tab to view available milestone types.
        </DocStep>
        <DocStep stepNumber={3} title="Enable milestone types">
          Toggle on the milestones you want to track. Each type can be enabled/disabled independently.
        </DocStep>
        <DocStep stepNumber={4} title="Set thresholds">
          For each milestone, set the threshold that triggers it. Example: "7" for a 7-day streak.
        </DocStep>
        <DocStep stepNumber={5} title="Customise messages">
          Write the celebration message for each milestone type. Use variables to personalise.
        </DocStep>
        <DocStep stepNumber={6} title="Optional: Assign badges">
          Select a badge to automatically award when this milestone is achieved.
        </DocStep>
        <DocStep stepNumber={7} title="Save">
          Click Save. The system will start monitoring client activity immediately.
        </DocStep>
      </section>

      {/* Message Variables */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Variable className="h-5 w-5 text-primary" />
          Message Variables
        </h2>
        <p className="text-muted-foreground mb-4">
          Use these variables in your celebration messages:
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
                <td className="py-2 pr-4 font-mono text-primary">{"{value}"}</td>
                <td className="py-2">The achieved value (e.g., "7" for 7-day streak)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{milestone_type}"}</td>
                <td className="py-2">Type of achievement (streak, completion, etc.)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-primary">{"{coach_name}"}</td>
                <td className="py-2">Your name</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-medium mb-2">Example Messages</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="italic">
              <strong>7-Day Streak:</strong> "🔥 {"{client_name}"}, you just hit {"{value}"} days 
              in a row! That's incredible consistency. Keep this momentum going!"
            </p>
            <p className="italic">
              <strong>Program Completion:</strong> "🎉 Congratulations {"{client_name}"}! You've 
              officially completed your program. Take a moment to appreciate how far you've come!"
            </p>
            <p className="italic">
              <strong>Personal Record:</strong> "💪 NEW PR! {"{client_name}"}, you just crushed 
              your previous record. Your hard work is paying off!"
            </p>
          </div>
        </div>
      </section>

      {/* Badge Awards */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Badge Awards
        </h2>
        <p className="text-muted-foreground mb-4">
          You can optionally award badges when milestones are achieved. Badges appear on 
          the client's profile and contribute to their overall achievements.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Select from available system badges or badges you've created</li>
          <li>Each milestone can have a different badge or no badge</li>
          <li>Badges are awarded automatically when the milestone is triggered</li>
          <li>Clients receive XP along with the badge if XP rewards are configured</li>
        </ul>
        <DocTip>
          Consider using progressively better badges for higher thresholds. For example, 
          a bronze badge for 7-day streak, silver for 14-day, gold for 30-day.
        </DocTip>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          Each milestone is only celebrated ONCE per client. If a client breaks their 
          streak and rebuilds it, they will receive another celebration when they hit 
          the threshold again.
        </DocWarning>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
          <li>Personal Records only work for exercises that clients log with weights/reps</li>
          <li>Adherence calculations are based on the current week or month</li>
          <li>Thresholds apply to all clients equally (no per-client customisation)</li>
          <li>Celebration messages cannot include images or attachments</li>
        </ul>
      </section>

      {/* Common Use Cases */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">New client onboarding</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set a low threshold (3-day streak) to give new clients early wins and 
              build momentum during the critical first weeks.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Consistency rewards</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use streak milestones (7, 14, 30 days) to reward the habit of showing up, 
              not just hitting performance goals.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Program graduation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically celebrate when clients complete a full training program. 
              This is a natural moment to discuss their next phase.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I set multiple streak thresholds?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. You can enable celebrations for 7-day, 14-day, and 30-day streaks 
              independently, each with their own message and optional badge.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What counts as a "day" for streaks?</h3>
            <p className="text-sm text-muted-foreground">
              A day counts if the client logs any workout or training activity before 
              midnight in their local timezone.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Will I be notified when clients hit milestones?</h3>
            <p className="text-sm text-muted-foreground">
              Not by default. The celebration message is sent directly to the client. 
              You can check the automation logs to see what milestones have been triggered.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can clients see all available milestones?</h3>
            <p className="text-sm text-muted-foreground">
              No. Clients only see celebrations when they achieve a milestone. The thresholds 
              and upcoming milestones are not visible to them.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
