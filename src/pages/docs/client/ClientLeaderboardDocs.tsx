import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Trophy, Globe, MapPin, Users, Eye, EyeOff, TrendingUp } from "lucide-react";

export default function ClientLeaderboardDocs() {
  return (
    <DocsLayout
      title="Fitness Leaderboards | FitConnect Client Guide"
      description="Compete on local, county and UK-wide leaderboards. See how you rank against other fitness enthusiasts."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Leaderboard" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This feature is for <strong>clients who enjoy friendly competition</strong> and want 
            to see how their progress compares to others. Participation is completely optional.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            The Leaderboard ranks users based on their XP (experience points) earned through 
            consistent activity on the platform. You can view rankings at different geographical 
            levels to see how you stack up.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Local</h3>
              <p className="text-sm text-muted-foreground">
                Users in your city or county
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">National</h3>
              <p className="text-sm text-muted-foreground">
                Users in your country
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">Global</h3>
              <p className="text-sm text-muted-foreground">
                All users worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            The leaderboard adds a social, competitive element to your fitness journey:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Creates friendly competition to motivate consistent effort</li>
            <li>Provides context for your progress compared to others</li>
            <li>Celebrates top performers in your community</li>
            <li>Adds gamification that makes fitness more engaging</li>
          </ul>
        </section>

        {/* How Rankings Work */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How Rankings Work</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">XP-Based Ranking</h3>
              <p className="text-sm text-muted-foreground">
                Your position is determined by your total XP. The more XP you earn through 
                workouts, logging, habits, and challenges, the higher you climb.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Weekly & All-Time Views</h3>
              <p className="text-sm text-muted-foreground">
                View weekly leaderboards (resets every Monday) to see who's most active 
                this week, or all-time rankings for cumulative achievement.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Tie-Breaking</h3>
              <p className="text-sm text-muted-foreground">
                If two users have the same XP, the one who earned it first ranks higher.
              </p>
            </div>
          </div>
        </section>

        {/* What's Displayed */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What's Displayed on the Leaderboard</h2>
          <p className="text-muted-foreground mb-4">
            For each user on the leaderboard, you'll see:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Rank:</strong> Their position (1st, 2nd, 3rd, etc.)</li>
            <li><strong>Display Name:</strong> Their leaderboard name (can differ from real name)</li>
            <li><strong>Avatar:</strong> Their profile picture or selected avatar</li>
            <li><strong>Level:</strong> Their current level</li>
            <li><strong>XP:</strong> Total experience points</li>
            <li><strong>Featured Badges:</strong> Up to 3 badges they've chosen to display</li>
          </ul>
          <DocInfo className="mt-4">
            You can set a custom "Leaderboard Display Name" in Settings → Profile if you 
            want to appear differently than your real name.
          </DocInfo>
        </section>

        {/* How to View */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to View the Leaderboard</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Navigate to Leaderboard">
              Go to Dashboard → Leaderboard
            </DocStep>
            <DocStep stepNumber={2} title="Select Scope">
              Choose Local, National, or Global using the tabs at the top
            </DocStep>
            <DocStep stepNumber={3} title="Choose Time Period">
              Toggle between Weekly and All-Time views
            </DocStep>
            <DocStep stepNumber={4} title="Find Your Position">
              Your position is highlighted. If not in the top 100, you'll see your rank 
              displayed separately.
            </DocStep>
          </div>
        </section>

        {/* Privacy Controls */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Privacy Controls</h2>
          <p className="text-muted-foreground mb-4">
            You have full control over your leaderboard visibility:
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-green-600 dark:text-green-400">Visible (Default)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile appears on leaderboards. Other users can see your rank, 
                display name, level, and featured badges.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Hidden</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile is hidden from all leaderboards. You can still view the leaderboard 
                but won't appear on it. Your XP and level continue to accumulate privately.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-medium mt-6 mb-2">How to Change Your Visibility</h3>
          <div className="space-y-2">
            <DocStep stepNumber={1} title="Go to Settings">
              Navigate to Settings from your dashboard
            </DocStep>
            <DocStep stepNumber={2} title="Open Privacy Settings">
              Click on the Privacy or Profile tab
            </DocStep>
            <DocStep stepNumber={3} title="Toggle Leaderboard Visibility">
              Find "Show on Leaderboard" and toggle it on or off
            </DocStep>
          </div>
        </section>

        {/* Custom Display Name */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Setting a Custom Display Name</h2>
          <p className="text-muted-foreground mb-4">
            If you want to appear on the leaderboard but prefer not to use your real name, 
            you can set a custom leaderboard display name:
          </p>
          <div className="space-y-2">
            <DocStep stepNumber={1} title="Go to Settings → Profile">
              Open your profile settings
            </DocStep>
            <DocStep stepNumber={2} title="Find Leaderboard Display Name">
              Look for the "Leaderboard Display Name" field
            </DocStep>
            <DocStep stepNumber={3} title="Enter Your Preferred Name">
              Enter a username, nickname, or alias you'd like to use
            </DocStep>
            <DocStep stepNumber={4} title="Save">
              Save your settings. Your new name appears on the leaderboard immediately.
            </DocStep>
          </div>
          <DocWarning className="mt-4">
            Display names must be appropriate and not offensive. Names that violate 
            community guidelines may be reset by administrators.
          </DocWarning>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tips for Climbing the Leaderboard</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Be Consistent</p>
                <p className="text-sm text-muted-foreground">
                  Daily activity earns more XP over time than sporadic intense sessions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Trophy className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Complete Challenges</p>
                <p className="text-sm text-muted-foreground">
                  Challenges offer substantial XP bonuses that can boost your ranking quickly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Maintain Streaks</p>
                <p className="text-sm text-muted-foreground">
                  Streak bonuses multiply your XP earnings significantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How is my location determined?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your location is based on the city and country you've set in your profile. 
                You can update this in Settings → Profile.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I see other users' profiles from the leaderboard?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You can see their public information (display name, level, badges) but 
                cannot access their personal data or detailed progress.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Why isn't my rank updating?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Leaderboard positions update periodically, not instantly. Wait a few minutes 
                after earning XP for your rank to reflect new points.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can coaches see my leaderboard position?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If you're visible on the leaderboard, anyone (including your coach) can see 
                your rank. Hiding your profile hides it from everyone.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Are there prizes for top rankings?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Currently, leaderboard rankings are for recognition and motivation. 
                Special events may occasionally offer prizes for top performers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
