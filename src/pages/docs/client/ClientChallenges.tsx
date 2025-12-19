import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Trophy, Target, Users, Medal, Calendar, Zap } from "lucide-react";

export default function ClientChallenges() {
  return (
    <DocsLayout
      title="Challenges"
      description="Compete in fitness challenges to earn exclusive rewards and XP."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Challenges" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          What Are Challenges?
        </h2>
        <p className="text-muted-foreground mb-4">
          Challenges are time-limited fitness goals you can join to push yourself further. 
          They range from step challenges to workout completions, and are created by coaches, 
          the FitConnect team, or your own coach specifically for their clients.
        </p>
        <p className="text-muted-foreground">
          Completing challenges earns you XP, badges, and sometimes exclusive avatars that 
          aren't available any other way.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Types of Challenges
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Platform Challenges
            </h3>
            <p className="text-sm text-muted-foreground">
              Open to all FitConnect members. These are large-scale challenges like monthly 
              step goals or workout challenges with thousands of participants.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Medal className="h-4 w-4 text-amber-500" />
              Coach Challenges
            </h3>
            <p className="text-sm text-muted-foreground">
              Created by coaches for their clients. These might be specific to a training program 
              or designed to motivate a group of clients working towards similar goals.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              Exclusive Challenges
            </h3>
            <p className="text-sm text-muted-foreground">
              Limited-time events with exclusive badge or avatar rewards that can only be 
              earned during the challenge period.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Joining a Challenge
        </h2>
        <DocStep stepNumber={1} title="Browse challenges">
          Go to <strong>Challenges</strong> in your dashboard to see available challenges.
        </DocStep>
        <DocStep stepNumber={2} title="Check requirements">
          Review the challenge details: goal, duration, and any eligibility requirements.
        </DocStep>
        <DocStep stepNumber={3} title="Join">
          Click &quot;Join Challenge&quot; to participate. Some challenges have limited spots!
        </DocStep>
        <DocStep stepNumber={4} title="Track progress">
          Your progress updates automatically if using wearables, or you can log manually.
        </DocStep>
        <DocTip>
          Challenges show start and end dates. Join early to maximise your time to complete the goal!
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Tracking Progress
        </h2>
        <p className="text-muted-foreground mb-4">
          Challenge progress is tracked based on the challenge type:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Step challenges</strong> - Synced from your connected wearable device</li>
          <li><strong>Workout challenges</strong> - Logged when you complete assigned workouts</li>
          <li><strong>Nutrition challenges</strong> - Based on meal logging and macro targets</li>
          <li><strong>Habit challenges</strong> - Linked to your daily habit completions</li>
        </ul>
        <DocWarning>
          Some challenges require wearable data for verification. Connect your device before 
          joining to ensure your progress counts!
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Rewards
        </h2>
        <p className="text-muted-foreground mb-4">
          Completing challenges earns you:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">XP Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Earn bonus XP for challenge completion, helping you level up faster.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Challenge Badges</h3>
            <p className="text-sm text-muted-foreground">
              Display special badges on your profile showing challenges you've completed.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Exclusive Avatars</h3>
            <p className="text-sm text-muted-foreground">
              Some challenges unlock avatars that can only be earned during that event.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Leaderboard Position</h3>
            <p className="text-sm text-muted-foreground">
              Top performers may be featured on challenge-specific leaderboards.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Challenge Tips</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Start strong</h3>
            <p className="text-sm text-muted-foreground">
              Don't wait until the last minute - build momentum early in the challenge.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Connect your wearable</h3>
            <p className="text-sm text-muted-foreground">
              Automatic tracking ensures your efforts are counted accurately.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Check the leaderboard</h3>
            <p className="text-sm text-muted-foreground">
              See how you compare to other participants and stay motivated.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
