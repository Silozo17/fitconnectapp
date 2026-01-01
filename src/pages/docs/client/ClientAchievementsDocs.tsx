import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Trophy, Star, Zap, TrendingUp, Target, Medal, Award, Flame } from "lucide-react";

export default function ClientAchievementsDocs() {
  return (
    <DocsLayout
      title="Badges & Rewards | FitConnect Client Guide"
      description="Unlock achievement badges for milestones, streaks and challenge completions. Level up your profile."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Achievements" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This feature is for <strong>all clients</strong> who enjoy tracking their progress, 
            earning rewards, and having visible milestones to work toward.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            The Achievements system rewards your consistency and progress with experience points (XP), 
            levels, and collectible badges. It turns your fitness journey into a game-like experience 
            with clear milestones and rewards.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Zap className="h-6 w-6 text-amber-500 mb-2" />
              <h3 className="font-medium mb-1">Experience Points (XP)</h3>
              <p className="text-sm text-muted-foreground">
                Earn XP for completing workouts, logging meals, maintaining streaks, and more
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium mb-1">Levels</h3>
              <p className="text-sm text-muted-foreground">
                Accumulate XP to level up and earn new titles that display on your profile
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Medal className="h-6 w-6 text-purple-500 mb-2" />
              <h3 className="font-medium mb-1">Badges</h3>
              <p className="text-sm text-muted-foreground">
                Collect unique badges for specific achievements and milestones
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 mb-2" />
              <h3 className="font-medium mb-1">Streaks</h3>
              <p className="text-sm text-muted-foreground">
                Maintain daily activity streaks for bonus XP and special badges
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Fitness is a long-term journey, and it's easy to lose motivation when results feel slow. 
            The achievement system provides:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Immediate rewards for consistent effort</li>
            <li>Visible progress even when physical changes are gradual</li>
            <li>Fun milestones to work toward</li>
            <li>A sense of accomplishment and progress</li>
            <li>Social proof on your profile showing your dedication</li>
          </ul>
        </section>

        {/* How to Earn XP */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Earn XP</h2>
          <p className="text-muted-foreground mb-4">
            XP is awarded for various activities throughout the platform:
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Complete a workout</span>
              <span className="text-amber-500 font-medium">+50 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Log all meals for the day</span>
              <span className="text-amber-500 font-medium">+25 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Complete a daily habit</span>
              <span className="text-amber-500 font-medium">+10 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Maintain a 7-day streak</span>
              <span className="text-amber-500 font-medium">+100 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Complete a challenge</span>
              <span className="text-amber-500 font-medium">+200-500 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Log progress photos</span>
              <span className="text-amber-500 font-medium">+30 XP</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span>Earn a new badge</span>
              <span className="text-amber-500 font-medium">Varies</span>
            </div>
          </div>
          <DocTip className="mt-4">
            Consistency is key! Daily activities compound over time—logging a workout 
            every day adds up to 1,500+ XP per month.
          </DocTip>
        </section>

        {/* Levels */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Level Progression</h2>
          <p className="text-muted-foreground mb-4">
            As you accumulate XP, you'll progress through levels. Each level comes with a title 
            that displays on your profile:
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 1: Beginner</span>
              <span className="text-sm text-muted-foreground">0 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 2: Rising Star</span>
              <span className="text-sm text-muted-foreground">500 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 3: Dedicated</span>
              <span className="text-sm text-muted-foreground">1,500 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 4: Committed</span>
              <span className="text-sm text-muted-foreground">3,500 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 5: Warrior</span>
              <span className="text-sm text-muted-foreground">7,000 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 6: Champion</span>
              <span className="text-sm text-muted-foreground">12,000 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 7: Elite</span>
              <span className="text-sm text-muted-foreground">20,000 XP</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-medium">Level 8: Master</span>
              <span className="text-sm text-muted-foreground">30,000 XP</span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="font-medium">Level 9+: Legend</span>
              <span className="text-sm text-muted-foreground">50,000+ XP</span>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Badge Categories</h2>
          <p className="text-muted-foreground mb-4">
            Badges are earned for specific accomplishments. They come in different rarities:
          </p>
          
          <div className="grid gap-4 mb-6">
            <div className="p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg">
              <span className="font-medium">Common</span> - Easy to earn, basic milestones
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="font-medium text-green-600 dark:text-green-400">Uncommon</span> - Moderate effort required
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="font-medium text-blue-600 dark:text-blue-400">Rare</span> - Significant achievement
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <span className="font-medium text-purple-600 dark:text-purple-400">Epic</span> - Major milestone
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="font-medium text-amber-600 dark:text-amber-400">Legendary</span> - Exceptional achievement
            </div>
          </div>

          <h3 className="text-lg font-medium mb-3">Example Badges</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="font-medium">First Workout</span>
                <span className="text-xs bg-slate-500/20 px-2 py-0.5 rounded">Common</span>
              </div>
              <p className="text-sm text-muted-foreground">Complete your first workout</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Week Warrior</span>
                <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">Uncommon</span>
              </div>
              <p className="text-sm text-muted-foreground">7-day activity streak</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Century Club</span>
                <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Rare</span>
              </div>
              <p className="text-sm text-muted-foreground">Complete 100 workouts</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Iron Will</span>
                <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">Epic</span>
              </div>
              <p className="text-sm text-muted-foreground">30-day workout streak</p>
            </div>
          </div>
        </section>

        {/* Viewing Achievements */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Viewing Your Achievements</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Go to Achievements">
              Navigate to Dashboard → Achievements
            </DocStep>
            <DocStep stepNumber={2} title="View Your Stats">
              See your current level, total XP, and progress to the next level
            </DocStep>
            <DocStep stepNumber={3} title="Browse Badges">
              View earned badges and see which ones you can still unlock
            </DocStep>
            <DocStep stepNumber={4} title="Feature Badges">
              Select up to 3 badges to feature prominently on your profile
            </DocStep>
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
          <p className="text-muted-foreground mb-4">
            Your XP contributes to your ranking on the leaderboard. You can view rankings at 
            different scopes:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Local:</strong> Users in your city or region</li>
            <li><strong>National:</strong> Users in your country</li>
            <li><strong>Global:</strong> All users on the platform</li>
          </ul>
          <DocInfo className="mt-4">
            You can choose to hide your profile from the leaderboard in Settings → Privacy 
            if you prefer not to be ranked publicly.
          </DocInfo>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Achievement Notifications</h2>
          <p className="text-muted-foreground mb-4">
            You'll receive notifications for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Earning a new badge</li>
            <li>Levelling up</li>
            <li>Reaching streak milestones</li>
            <li>Being close to earning a badge</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Manage these in Settings → Notifications → Achievement Notifications.
          </p>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Can I lose XP or levels?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No, XP and levels are permanent. Once earned, they're yours forever.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I earn badges more than once?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Most badges can only be earned once. Some recurring badges (like monthly 
                streaks) may have multiple tiers or versions.
              </p>
            </div>
            <div>
              <h3 className="font-medium">What happens if I break a streak?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your current streak resets to zero, but any XP or badges you earned from 
                previous streak milestones remain.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How do I feature badges on my profile?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to Achievements, click on a badge you've earned, and toggle "Feature on Profile."
              </p>
            </div>
            <div>
              <h3 className="font-medium">Do challenge rewards count toward my level?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes! XP earned from completing challenges counts toward your total XP and level progression.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
