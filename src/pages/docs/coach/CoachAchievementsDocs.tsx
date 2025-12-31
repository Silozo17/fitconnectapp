import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Trophy, Star, Award, Sparkles, TrendingUp, Users, Target, Zap } from "lucide-react";

export default function CoachAchievementsDocs() {
  return (
    <DocsLayout
      title="Coach Achievements & Gamification"
      description="Understand how XP, levels, badges, and avatars work for coaches on FitConnect."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach", href: "/docs/coach" },
        { label: "Achievements" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">XP and Levelling System</h2>
        <p>
          As a coach, you earn Experience Points (XP) for activities on the platform. As you 
          accumulate XP, you level up – unlocking new badges, avatars, and recognition for 
          your achievements.
        </p>
        
        <div className="p-4 border rounded-lg bg-primary/5 mt-4">
          <h3 className="font-medium mb-2">How XP Works</h3>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Every action contributes XP towards your total</li>
            <li>Higher levels require more XP to reach</li>
            <li>Your level is displayed on your profile and to clients</li>
            <li>XP cannot be lost – progress is always forward</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Earning XP</h2>
        <p>You earn XP from various activities:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Client Management</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Onboarding new clients</li>
              <li>Completing client sessions</li>
              <li>Responding to messages</li>
              <li>Updating client plans</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Client Success</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Clients reaching goals</li>
              <li>Positive client reviews</li>
              <li>High retention rates</li>
              <li>Client transformations</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Platform Engagement</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Completing your profile</li>
              <li>Uploading certifications</li>
              <li>Creating workout templates</li>
              <li>Using AI tools</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Milestones</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>First client signed</li>
              <li>First 5-star review</li>
              <li>100 sessions completed</li>
              <li>Anniversary on platform</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badge Categories</h2>
        <p>Badges recognise specific achievements and are displayed on your profile:</p>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium">Client Success Badges</h3>
              <p className="text-sm text-muted-foreground">
                Awarded for helping clients achieve their goals – weight loss milestones, 
                strength gains, consistency records.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Award className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Business Badges</h3>
              <p className="text-sm text-muted-foreground">
                Earned for growing your coaching business – client milestones, revenue 
                targets, retention achievements.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Star className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Quality Badges</h3>
              <p className="text-sm text-muted-foreground">
                Recognition for excellent service – high ratings, verified credentials, 
                quick response times.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium">Special Badges</h3>
              <p className="text-sm text-muted-foreground">
                Limited-time badges from challenges, seasonal events, or platform milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatar Unlocks</h2>
        <p>
          As you progress, you unlock exclusive avatars to personalise your profile:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Starter avatars</strong> – Available to all coaches from day one</li>
          <li><strong>Level-gated avatars</strong> – Unlocked at specific levels (5, 10, 25, 50, 100)</li>
          <li><strong>Badge-linked avatars</strong> – Unlocked by earning specific badges</li>
          <li><strong>Challenge avatars</strong> – Exclusive rewards from seasonal challenges</li>
          <li><strong>Premium avatars</strong> – Available to coaches on higher subscription tiers</li>
        </ul>
        
        <DocInfo>
          Once unlocked, avatars are yours permanently. You can switch between any unlocked 
          avatar at any time from your profile settings.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Viewing Achievement Progress</h2>
        <p>Track your achievements from your dashboard:</p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to your <strong>Dashboard</strong></li>
          <li>Click on your <strong>Level/XP indicator</strong> in the header</li>
          <li>View the <strong>Achievements</strong> panel to see:
            <ul className="list-disc pl-4 mt-1">
              <li>Current level and XP progress</li>
              <li>Recently earned badges</li>
              <li>Badges in progress</li>
              <li>Unlocked and locked avatars</li>
            </ul>
          </li>
        </ol>
        
        <DocTip>
          Pin your favourite badges to your profile to showcase your achievements to 
          potential clients browsing the marketplace.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How Achievements Are Earned</h2>
        <p>
          Most achievements are awarded automatically when you meet the criteria. The system 
          checks your activity in real-time and awards badges as soon as you qualify.
        </p>
        
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Example: "Rising Star" Badge</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Criteria:</strong> Complete 10 sessions with 5+ star average rating<br />
            <strong>When checked:</strong> After each session rating is submitted<br />
            <strong>XP reward:</strong> 500 XP
          </p>
        </div>
        
        <p className="text-muted-foreground">
          Some badges require manual verification (e.g., certification uploads) and may take 
          24-48 hours to appear after you qualify.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Benefits of Gamification</h2>
        <p>The achievement system helps coaches in several ways:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium">Visibility Boost</h3>
            <p className="text-sm text-muted-foreground">
              Higher-level coaches appear more prominently in search results.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <Award className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium">Trust Signals</h3>
            <p className="text-sm text-muted-foreground">
              Badges show clients you're active, successful, and verified.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <Target className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium">Goal Setting</h3>
            <p className="text-sm text-muted-foreground">
              Track your coaching journey with clear milestones to aim for.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <Sparkles className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium">Motivation</h3>
            <p className="text-sm text-muted-foreground">
              Celebrate progress and stay engaged with the platform.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
