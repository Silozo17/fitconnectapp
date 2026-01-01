import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  Search, 
  Calendar, 
  ClipboardList, 
  TrendingUp, 
  Trophy, 
  Settings,
  ArrowRight,
  Target,
  ShoppingCart,
  Calculator,
  Library,
  Users,
  MessageSquare,
  Star,
  Battery,
  Sparkles,
  Zap,
  Activity
} from "lucide-react";

const clientGuides = [
  {
    title: "Creating Your Profile",
    description: "Set up your client profile with your fitness goals, health information, and preferences.",
    href: "/docs/client/profile",
    icon: UserPlus,
  },
  {
    title: "Finding Coaches",
    description: "Learn how to search, filter, and discover the perfect coach for your fitness journey.",
    href: "/docs/client/coaches",
    icon: Search,
  },
  {
    title: "Booking Sessions",
    description: "Book consultations, single sessions, or packages with your chosen coach.",
    href: "/docs/client/sessions",
    icon: Calendar,
  },
  {
    title: "Messages",
    description: "Communicate with your coach through our messaging system.",
    href: "/docs/client/messages",
    icon: MessageSquare,
  },
  {
    title: "Workout & Nutrition Plans",
    description: "Access and follow the personalised plans your coach creates for you.",
    href: "/docs/client/plans",
    icon: ClipboardList,
  },
  {
    title: "Tracking Progress",
    description: "Log your workouts, measurements, and progress photos to see your transformation.",
    href: "/docs/client/progress",
    icon: TrendingUp,
  },
  {
    title: "Readiness Score",
    description: "Understand your daily readiness based on sleep, recovery, and activity data.",
    href: "/docs/client/readiness",
    icon: Battery,
  },
  {
    title: "Wearable Trends",
    description: "Track week-over-week changes in your health metrics from connected devices.",
    href: "/docs/client/trends",
    icon: Activity,
  },
  {
    title: "Micro Wins",
    description: "Celebrate small victories that keep you motivated on your fitness journey.",
    href: "/docs/client/micro-wins",
    icon: Zap,
  },
  {
    title: "Goal Suggestions",
    description: "Get AI-powered goal recommendations that evolve with your progress.",
    href: "/docs/client/goal-suggestions",
    icon: Sparkles,
  },
  {
    title: "Challenges",
    description: "Join platform-wide or coach challenges and compete for rewards.",
    href: "/docs/client/challenges",
    icon: Target,
  },
  {
    title: "Achievements",
    description: "Earn badges, gain XP, and unlock exclusive avatars.",
    href: "/docs/client/achievements",
    icon: Trophy,
  },
  {
    title: "Leaderboards",
    description: "Compete with others on location-based leaderboards.",
    href: "/docs/client/leaderboards",
    icon: Trophy,
  },
  {
    title: "Habits & Streaks",
    description: "Track daily habits assigned by your coach and build consistency streaks.",
    href: "/docs/client/habits",
    icon: Target,
  },
  {
    title: "Shopping Lists",
    description: "Create grocery lists from meal plans with supermarket integration.",
    href: "/docs/client/grocery",
    icon: ShoppingCart,
  },
  {
    title: "Fitness Tools",
    description: "Access calculators for BMI, BMR, TDEE, body fat, and more.",
    href: "/docs/client/tools",
    icon: Calculator,
  },
  {
    title: "Digital Library",
    description: "View and access purchased e-books, videos, and training templates.",
    href: "/docs/client/library",
    icon: Library,
  },
  {
    title: "Favourites",
    description: "Save and manage your favourite coaches for quick access.",
    href: "/docs/client/favourites",
    icon: Star,
  },
  {
    title: "Connections",
    description: "Connect with friends, share progress, and view their achievements.",
    href: "/docs/client/connections",
    icon: Users,
  },
  {
    title: "Data Sharing",
    description: "Control what health data you share with your coaches.",
    href: "/docs/client/data-sharing",
    icon: Settings,
  },
  {
    title: "Account Security",
    description: "Enable two-factor authentication and manage your security settings.",
    href: "/docs/client/security",
    icon: Settings,
  },
  {
    title: "Wearable Devices",
    description: "Connect fitness trackers and sync your health data automatically.",
    href: "/docs/client/wearables",
    icon: Settings,
  },
];

export default function ClientOverview() {
  return (
    <DocsLayout
      title="Client Guide | Find Coaches & Track Fitness Progress"
      description="Complete guide to using FitConnect as a client. Find UK personal trainers, book sessions, track workouts and achieve your fitness goals."
      breadcrumbs={[{ label: "For Clients" }]}
    >
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          As a FitConnect client, you have access to a powerful set of tools to help you achieve your 
          fitness goals. From finding the perfect coach to tracking your progress and competing with 
          others, this documentation will guide you through every feature.
        </p>
      </section>

      {/* Guide Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {clientGuides.map((guide) => (
            <Link key={guide.href} to={guide.href} className="no-underline">
              <Card className="h-full hover:border-primary/50 transition-colors bg-card">
                <CardHeader className="pb-2">
                  <guide.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{guide.description}</CardDescription>
                  <span className="text-primary text-sm font-medium flex items-center gap-1">
                    Read guide <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Tips */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Tips for Success</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Complete your profile</h3>
            <p className="text-sm text-muted-foreground">
              A complete profile helps coaches understand your needs and provide better recommendations.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Read coach reviews</h3>
            <p className="text-sm text-muted-foreground">
              Check what other clients say about a coach before booking your first session.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Track consistently</h3>
            <p className="text-sm text-muted-foreground">
              Log your progress regularly to see trends and keep your coach informed of your journey.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Communicate openly</h3>
            <p className="text-sm text-muted-foreground">
              Message your coach about any questions, concerns, or adjustments needed to your plans.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
