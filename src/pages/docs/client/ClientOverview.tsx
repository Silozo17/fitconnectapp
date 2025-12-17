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
  ArrowRight
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
    title: "Achievements & Leaderboards",
    description: "Earn badges, gain XP, and compete with others on location-based leaderboards.",
    href: "/docs/client/achievements",
    icon: Trophy,
  },
  {
    title: "Settings & Integrations",
    description: "Connect wearables, manage notifications, and customise your experience.",
    href: "/docs/client/settings",
    icon: Settings,
  },
];

export default function ClientOverview() {
  return (
    <DocsLayout
      title="Client Documentation"
      description="Everything you need to know about using FitConnect as a client."
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
            <Link key={guide.href} to={guide.href}>
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
