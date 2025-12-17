import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Trophy, Star, Users, Shield, Sparkles } from "lucide-react";

export default function ClientAchievements() {
  return (
    <DocsLayout
      title="Achievements & Leaderboards"
      description="Discover how to earn XP, unlock badges and avatars, and compete on location-based leaderboards."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Client Guide", href: "/docs/client" },
        { label: "Achievements & Leaderboards" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          XP & Leveling System
        </h2>
        <p className="text-muted-foreground">
          Earn experience points (XP) for completing activities and level up to unlock rewards.
        </p>

        <DocStep number={1} title="How to Earn XP">
          You earn XP by completing workouts, logging progress, maintaining habit streaks, 
          completing challenges, and earning badges.
        </DocStep>

        <DocStep number={2} title="View Your Level">
          Your current level and XP progress are displayed on your dashboard hero section 
          and achievements page.
        </DocStep>

        <DocStep number={3} title="Level Up Rewards">
          Each level unlocks new avatars and badges. Higher levels may unlock special 
          features and recognition on leaderboards.
        </DocStep>

        <DocTip type="tip">
          Consistency is key! Daily habit streaks give bonus XP and help you level up faster.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          Badges & Avatars
        </h2>
        <p className="text-muted-foreground">
          Earn badges for achievements and unlock unique avatars to personalize your profile.
        </p>

        <DocStep number={1} title="Badge Categories">
          Badges are organized by category: Workout milestones, Streak achievements, 
          Progress tracking, Challenge completions, and Special events.
        </DocStep>

        <DocStep number={2} title="Unlocking Avatars">
          Avatars are unlocked by reaching specific milestones. Some examples include:
          completing 10 workouts, maintaining a 7-day habit streak, or reaching 5,000 XP.
        </DocStep>

        <DocStep number={3} title="Selecting Your Avatar">
          Go to your profile settings to choose from your unlocked avatars. Your selected 
          avatar appears on leaderboards and throughout the platform.
        </DocStep>

        <DocTip type="info">
          Free avatars are available immediately. Challenge-locked avatars have different 
          rarity levels: Common, Uncommon, Rare, Epic, and Legendary.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Leaderboards
        </h2>
        <p className="text-muted-foreground">
          Compete with others in your area or globally on privacy-respecting leaderboards.
        </p>

        <DocStep number={1} title="Location-Based Rankings">
          Leaderboards are available at city, county, country, and global levels. 
          See how you rank against others in your area.
        </DocStep>

        <DocStep number={2} title="Time Periods">
          View rankings for this week, this month, or all-time to track your progress 
          across different timeframes.
        </DocStep>

        <DocStep number={3} title="Opting In/Out">
          Leaderboard participation is opt-in only. Go to Settings to enable or disable 
          your visibility on public leaderboards.
        </DocStep>

        <DocTip type="warning">
          <strong>Privacy Note:</strong> When you opt in, only your first name (or alias) 
          and location are displayed. No profile photos or personal details are shared.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Challenges
        </h2>
        <p className="text-muted-foreground">
          Join challenges to compete with others and earn exclusive rewards.
        </p>

        <DocStep number={1} title="Browse Challenges">
          Go to <strong>Challenges</strong> from your sidebar to see available challenges.
        </DocStep>

        <DocStep number={2} title="Join a Challenge">
          Click <strong>Join</strong> on any challenge to participate. Some challenges 
          have limited spots or time-based entry windows.
        </DocStep>

        <DocStep number={3} title="Track Your Progress">
          Once joined, your progress is automatically tracked. Complete the challenge 
          requirements before the end date to earn rewards.
        </DocStep>

        <DocTip type="tip">
          Completing challenges often awards special badges and bonus XP that can't be 
          earned any other way!
        </DocTip>
      </section>
    </DocsLayout>
  );
}
