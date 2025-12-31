import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Trophy, Users, Target, Clock, Star, Gift, Medal, Zap } from "lucide-react";

export default function ClientChallengesDocs() {
  return (
    <DocsLayout
      title="Challenges"
      description="Join fitness challenges to stay motivated, compete with others, and earn rewards"
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Client", href: "/docs/client" },
        { label: "Challenges" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This feature is for <strong>all clients</strong> who want extra motivation, enjoy 
            friendly competition, or love working toward specific goals with deadlines.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            Challenges are time-limited fitness events you can join to push yourself, 
            compete with other users, and earn exclusive rewards like XP, badges, and avatars.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Target className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Goal-Based Targets</h3>
              <p className="text-sm text-muted-foreground">
                Each challenge has a clear target—steps, workouts, calories, or custom goals
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Time-Limited</h3>
              <p className="text-sm text-muted-foreground">
                Challenges run for specific periods—7 days, 30 days, or custom durations
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Community Competition</h3>
              <p className="text-sm text-muted-foreground">
                See how you stack up against other participants on the challenge leaderboard
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Gift className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Exclusive Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Earn XP, badges, and special avatars only available through challenges
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Staying motivated over the long term is hard. Challenges help by:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Creating short-term goals with clear deadlines</li>
            <li>Adding a social element to your fitness journey</li>
            <li>Providing extra incentive through exclusive rewards</li>
            <li>Breaking the monotony of regular training</li>
            <li>Pushing you slightly outside your comfort zone</li>
          </ul>
        </section>

        {/* Types of Challenges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Types of Challenges</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">🚶 Step Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Hit a target number of steps (e.g., 10,000 steps daily for 7 days). 
                Syncs automatically with your wearable device.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">💪 Workout Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Complete a target number of workouts (e.g., 20 workouts in 30 days). 
                Tracked via your logged training sessions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">🔥 Calorie Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Burn a total number of calories during the challenge period. 
                Syncs with wearable data.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">✅ Habit Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Maintain a streak of completing specific habits (e.g., log meals for 14 days straight).
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">🎯 Custom Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Special challenges created by the platform or your coach with unique goals.
              </p>
            </div>
          </div>
        </section>

        {/* How to Join */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Join a Challenge</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Browse Available Challenges">
              Go to Dashboard → Challenges to see all active and upcoming challenges
            </DocStep>
            <DocStep stepNumber={2} title="Review Details">
              Click on a challenge to see its goal, duration, rewards, and current participants
            </DocStep>
            <DocStep stepNumber={3} title="Click Join">
              If you want to participate, click the "Join Challenge" button
            </DocStep>
            <DocStep stepNumber={4} title="Start Tracking">
              Your progress begins tracking immediately based on the challenge type
            </DocStep>
          </div>
          <DocTip className="mt-4">
            You can join multiple challenges at once! Just make sure you can realistically 
            achieve all the goals without burning out.
          </DocTip>
        </section>

        {/* Progress Tracking */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tracking Your Progress</h2>
          <p className="text-muted-foreground mb-4">
            Once you've joined a challenge, you can track your progress in several ways:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Challenge Card:</strong> Shows your current progress vs the goal</li>
            <li><strong>Progress Bar:</strong> Visual indicator of how close you are to completion</li>
            <li><strong>Leaderboard:</strong> See your rank compared to other participants</li>
            <li><strong>Daily Updates:</strong> Push notifications with progress reminders</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-2">How Progress is Tracked</h3>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>Wearable Data:</strong> Steps, calories, and activity minutes sync automatically from connected devices (Apple Health, Google Fit, Fitbit, Garmin)</p>
            <p><strong>Workout Logs:</strong> Counted when you log a training session</p>
            <p><strong>Habit Completion:</strong> Counted when you mark habits as complete</p>
            <p><strong>Manual Entry:</strong> Some challenges allow manual progress entry if no wearable is connected</p>
          </div>
        </section>

        {/* Rewards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Challenge Rewards</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex items-start gap-4">
              <Zap className="h-6 w-6 text-amber-500 mt-1" />
              <div>
                <h3 className="font-medium">XP (Experience Points)</h3>
                <p className="text-sm text-muted-foreground">
                  Every challenge awards XP upon completion. XP contributes to your overall level 
                  and leaderboard ranking.
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-start gap-4">
              <Medal className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Exclusive Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Some challenges award unique badges that display on your profile. 
                  Challenge-exclusive badges cannot be earned any other way.
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-start gap-4">
              <Star className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Special Avatars</h3>
                <p className="text-sm text-muted-foreground">
                  Complete certain challenges to unlock exclusive avatar options 
                  for your profile picture.
                </p>
              </div>
            </div>
          </div>
          <DocInfo className="mt-4">
            Once earned, badges and avatars are yours forever. They won't be removed 
            even after the challenge ends.
          </DocInfo>
        </section>

        {/* Challenge Status */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Challenge Statuses</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="font-medium text-blue-600 dark:text-blue-400">Upcoming</span>
              <p className="text-sm text-muted-foreground">Challenge hasn't started yet. Join now to be ready when it begins.</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="font-medium text-green-600 dark:text-green-400">Active</span>
              <p className="text-sm text-muted-foreground">Challenge is currently running. Track your progress and work toward the goal.</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="font-medium text-amber-600 dark:text-amber-400">Ending Soon</span>
              <p className="text-sm text-muted-foreground">Less than 24 hours remaining. Final push to complete the goal!</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <span className="font-medium text-purple-600 dark:text-purple-400">Completed</span>
              <p className="text-sm text-muted-foreground">You've hit the target! Claim your rewards.</p>
            </div>
            <div className="p-3 bg-muted/50 border rounded-lg">
              <span className="font-medium text-muted-foreground">Ended</span>
              <p className="text-sm text-muted-foreground">Challenge period has finished.</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Challenge Notifications</h2>
          <p className="text-muted-foreground mb-4">
            Stay on track with automatic notifications:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Challenge Start:</strong> Notified when a challenge you joined begins</li>
            <li><strong>Daily Progress:</strong> Daily reminder of your current progress</li>
            <li><strong>Milestone Reached:</strong> Notified at 25%, 50%, 75% completion</li>
            <li><strong>Almost There:</strong> When you're close to completing the goal</li>
            <li><strong>Challenge Ending:</strong> Reminder when there's 24 hours left</li>
            <li><strong>Challenge Complete:</strong> Celebration when you hit the target</li>
          </ul>
          <DocTip className="mt-4">
            You can manage challenge notifications in Settings → Notifications. 
            Toggle "Challenge Notifications" on or off.
          </DocTip>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Can I leave a challenge after joining?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can leave a challenge at any time. You won't receive rewards, 
                but there's no penalty.
              </p>
            </div>
            <div>
              <h3 className="font-medium">What if I don't have a wearable device?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Some challenges allow manual entry. For others, you'll need a connected 
                device. Check the challenge details before joining.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Do I have to complete 100% to get rewards?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Typically yes—you need to reach the goal to earn rewards. 
                Some challenges may have partial rewards at certain milestones.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I join a challenge that's already started?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can join active challenges. However, you'll be starting from zero 
                while others may have a head start.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Who creates challenges?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Platform-wide challenges are created by the FitConnect team. 
                Some coaches may also create challenges for their clients.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How do I claim my reward after completing a challenge?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                XP is awarded automatically. For badges and avatars, click the "Claim Reward" 
                button on the completed challenge card.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
