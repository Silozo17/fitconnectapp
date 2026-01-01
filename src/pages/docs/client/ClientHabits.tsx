import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { CheckCircle2, Flame, Calendar, Target, Zap, Gift } from "lucide-react";

export default function ClientHabits() {
  return (
    <DocsLayout
      title="Build Healthy Habits & Streaks | FitConnect Client Guide"
      description="Complete daily habits, build streaks and earn XP rewards. Track consistency with visual heatmaps and unlock badges."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Habits & Streaks" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          How Habits Work
        </h2>
        <p className="text-muted-foreground mb-4">
          Your coach can assign daily or weekly habits for you to complete. These might include 
          drinking enough water, hitting a step goal, logging meals, or completing stretching routines.
        </p>
        <p className="text-muted-foreground">
          Each time you complete a habit, you build a streak. Maintaining streaks earns you XP 
          and can unlock special badges and achievements.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Completing Habits
        </h2>
        <DocStep stepNumber={1} title="View your daily habits">
          Navigate to <strong>Habits</strong> in your dashboard to see today's assigned habits.
        </DocStep>
        <DocStep stepNumber={2} title="Mark as complete">
          Tap the checkbox or &quot;Complete&quot; button when you've finished a habit.
        </DocStep>
        <DocStep stepNumber={3} title="Track your streak">
          The calendar heatmap shows your consistency over time - darker colours mean more completions.
        </DocStep>
        <DocTip>
          Some habits connect to your wearable device and complete automatically when you hit your 
          target (e.g., 10,000 steps).
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Habit Calendar
        </h2>
        <p className="text-muted-foreground mb-4">
          The habit calendar shows your completion history as a heatmap. Each day is colour-coded 
          based on how many habits you completed:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <div className="w-8 h-8 rounded bg-muted mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">No habits</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <div className="w-8 h-8 rounded bg-green-500/30 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Some done</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <div className="w-8 h-8 rounded bg-green-500/60 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Most done</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <div className="w-8 h-8 rounded bg-green-500 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">All complete!</span>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Habit Types
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Daily Habits</h3>
            <p className="text-sm text-muted-foreground">
              Must be completed every day (e.g., drink 8 glasses of water, 10-minute meditation).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Weekly Habits</h3>
            <p className="text-sm text-muted-foreground">
              Target a certain number of completions per week (e.g., 3 gym sessions, 5 protein targets).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Wearable-Linked Habits</h3>
            <p className="text-sm text-muted-foreground">
              Automatically tracked via your connected device (e.g., steps, active minutes, sleep hours).
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Building Streaks
        </h2>
        <p className="text-muted-foreground mb-4">
          Streaks represent consecutive days of completing a habit. Longer streaks earn bonus XP:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Flame className="h-6 w-6 text-orange-400 mx-auto mb-1" />
            <span className="font-medium">7 days</span>
            <span className="block text-xs text-muted-foreground">+10 XP bonus</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <span className="font-medium">30 days</span>
            <span className="block text-xs text-muted-foreground">+50 XP bonus</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Flame className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <span className="font-medium">100 days</span>
            <span className="block text-xs text-muted-foreground">+200 XP bonus</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Flame className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <span className="font-medium">365 days</span>
            <span className="block text-xs text-muted-foreground">+1000 XP bonus</span>
          </div>
        </div>
        <DocWarning>
          Missing a day resets your streak! Set reminders to help you stay consistent.
        </DocWarning>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" />
          Habit Rewards
        </h2>
        <p className="text-muted-foreground mb-4">
          Consistently completing habits unlocks:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>XP</strong> - Gain experience points for each completion</li>
          <li><strong>Streak badges</strong> - Special badges for 7, 30, 100, and 365-day streaks</li>
          <li><strong>Habit-specific badges</strong> - Unlock badges for specific achievements</li>
          <li><strong>Leaderboard points</strong> - Climb the rankings in your area</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
