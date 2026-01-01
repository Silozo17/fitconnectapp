import { useTranslation } from "react-i18next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Zap, TrendingUp, Star, Flame, Target, PartyPopper } from "lucide-react";

const breadcrumbs = [
  { label: "Client Guide", href: "/docs/client" },
  { label: "Micro Wins" },
];

export default function ClientMicroWinsDocs() {
  const { t } = useTranslation("docs");

  return (
    <DocsLayout
      title="Celebrate Micro Wins | FitConnect Client Guide"
      description="Track small daily victories that add up to big results. Stay motivated with automatic achievement detection."
      breadcrumbs={breadcrumbs}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">What are Micro Wins?</h2>
        <p className="text-muted-foreground">
          Micro wins are small, daily achievements that the platform automatically detects 
          and celebrates. These moments of progress—no matter how small—compound over time 
          to create lasting habits and significant results.
        </p>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Why Micro Wins Matter</h3>
                <p className="text-muted-foreground mt-1">
                  Research shows that celebrating small wins triggers dopamine release, 
                  reinforcing positive behaviours. This creates a motivation loop that 
                  makes it easier to stay consistent with your fitness routine.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Types of Micro Wins</h2>
        <p className="text-muted-foreground">
          The platform detects various types of achievements automatically based on your 
          activity and progress data.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-orange-500" />
                Streak Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Workout streak milestones (3, 7, 14, 30 days)</li>
                <li>• Habit completion streaks</li>
                <li>• Consecutive days logging meals</li>
                <li>• Daily step goal streaks</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Progress Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personal records in exercises</li>
                <li>• Body measurement improvements</li>
                <li>• Weight goal checkpoints</li>
                <li>• Strength or endurance gains</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-blue-500" />
                Activity Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Exceeded daily step goal</li>
                <li>• Hit active minutes target</li>
                <li>• Completed all scheduled workouts</li>
                <li>• Improved week-over-week metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-purple-500" />
                Consistency Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Logged in multiple days in a row</li>
                <li>• Completed weekly check-in</li>
                <li>• Responded to coach messages</li>
                <li>• Updated progress photos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">How Micro Wins Work</h2>

        <DocStep stepNumber={1} title="Automatic Detection">
          The platform continuously monitors your activity, workouts, habits, and progress 
          data to detect achievements as they happen.
        </DocStep>

        <DocStep stepNumber={2} title="Instant Celebration">
          When a micro win is detected, you'll see a celebration notification with confetti 
          and details about your achievement.
        </DocStep>

        <DocStep stepNumber={3} title="XP & Badge Rewards">
          Many micro wins come with XP rewards that contribute to your level progression. 
          Some unlock special badges you can display on your profile.
        </DocStep>

        <DocStep stepNumber={4} title="Share Your Success">
          Choose to share wins with your coach or on the community leaderboard. Your coach 
          can see your achievements and send encouragement.
        </DocStep>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Viewing Your Wins</h2>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PartyPopper className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Dashboard Widget</div>
                  <p className="text-sm text-muted-foreground">
                    Your most recent micro wins appear on your dashboard for quick celebration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Achievement History</div>
                  <p className="text-sm text-muted-foreground">
                    View your complete history of wins in the Achievements section.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Progress Reports</div>
                  <p className="text-sm text-muted-foreground">
                    Weekly summaries include a recap of all micro wins earned.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocTip>
          Enable notifications to get instant alerts when you achieve a micro win. These 
          timely celebrations help reinforce positive habits!
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Maximising Your Wins</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Stay Consistent</h3>
              <p className="text-sm text-muted-foreground">
                Many micro wins are streak-based. Even small daily actions add up to 
                impressive achievements over time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Log Everything</h3>
              <p className="text-sm text-muted-foreground">
                The more data you provide (workouts, meals, habits), the more wins the 
                platform can detect and celebrate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Connect Your Wearable</h3>
              <p className="text-sm text-muted-foreground">
                Automatic data sync means more opportunities for the platform to recognise 
                your daily achievements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Set Achievable Habits</h3>
              <p className="text-sm text-muted-foreground">
                Work with your coach to set habits you can complete daily. Small, 
                achievable habits lead to more wins.
              </p>
            </CardContent>
          </Card>
        </div>

        <DocInfo>
          Micro wins are designed to motivate, not pressure. If you miss a day, that's okay! 
          Every new day is an opportunity to start a fresh streak.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
