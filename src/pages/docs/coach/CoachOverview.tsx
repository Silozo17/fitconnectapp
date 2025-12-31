import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen,
  UserPlus, 
  Users, 
  MessageSquare, 
  ClipboardList, 
  Calendar, 
  CreditCard, 
  FileCheck,
  BarChart3,
  ArrowRight,
  Kanban,
  Package,
  Rocket,
  UtensilsCrossed,
  Sparkles,
  Star,
  Trophy
} from "lucide-react";

const coachGuides = [
  {
    title: "Getting Started",
    description: "Complete guide to setting up your coaching business on FitConnect.",
    href: "/docs/coach/onboarding",
    icon: BookOpen,
  },
  {
    title: "Profile Setup",
    description: "Create a compelling profile that attracts your ideal clients.",
    href: "/docs/coach/profile",
    icon: UserPlus,
  },
  {
    title: "Managing Clients",
    description: "View client details, track progress, and manage relationships.",
    href: "/docs/coach/clients",
    icon: Users,
  },
  {
    title: "Messaging & Templates",
    description: "Communicate effectively with clients using templates and quick actions.",
    href: "/docs/coach/messaging",
    icon: MessageSquare,
  },
  {
    title: "Building Plans",
    description: "Create workout and nutrition plans using our powerful builders.",
    href: "/docs/coach/plans",
    icon: ClipboardList,
  },
  {
    title: "Schedule & Sessions",
    description: "Set your availability and manage coaching sessions.",
    href: "/docs/coach/schedule",
    icon: Calendar,
  },
  {
    title: "Packages & Pricing",
    description: "Create packages and subscription plans for your clients.",
    href: "/docs/coach/packages",
    icon: CreditCard,
  },
  {
    title: "Verification",
    description: "Get verified to build trust and improve your visibility.",
    href: "/docs/coach/verification",
    icon: FileCheck,
  },
  {
    title: "Earnings & Stripe",
    description: "Set up payments, track earnings, and manage your finances.",
    href: "/docs/coach/earnings",
    icon: BarChart3,
  },
  {
    title: "Sales Pipeline",
    description: "Track leads through stages and convert prospects into paying clients.",
    href: "/docs/coach/pipeline",
    icon: Kanban,
  },
  {
    title: "Digital Products",
    description: "Create and sell e-books, videos, and training templates.",
    href: "/docs/coach/products",
    icon: Package,
  },
  {
    title: "Boost Marketing",
    description: "Pay-for-performance client acquisition and marketplace visibility.",
    href: "/docs/coach/boost",
    icon: Rocket,
  },
  {
    title: "Nutrition Builder",
    description: "Create meal plans with macro targets and AI-powered suggestions.",
    href: "/docs/coach/nutrition",
    icon: UtensilsCrossed,
  },
  {
    title: "AI Tools",
    description: "Generate workouts, meal plans, and messages with AI assistance.",
    href: "/docs/coach/ai",
    icon: Sparkles,
  },
  {
    title: "Automations",
    description: "Set up automated messages, reminders, and client engagement workflows.",
    href: "/docs/coach/automations",
    icon: ClipboardList,
  },
  {
    title: "Managing Reviews",
    description: "View, respond to, and leverage client reviews and testimonials.",
    href: "/docs/coach/reviews",
    icon: Star,
  },
  {
    title: "Achievements",
    description: "Earn XP, unlock badges, and level up as you grow your coaching business.",
    href: "/docs/coach/achievements",
    icon: Trophy,
  },
];

export default function CoachOverview() {
  return (
    <DocsLayout
      title="Coach Documentation"
      description="Everything you need to build and grow your coaching business on FitConnect."
      breadcrumbs={[{ label: "For Coaches" }]}
    >
      {/* Introduction */}
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          FitConnect provides you with all the tools you need to run a successful coaching business. 
          From finding clients to managing your schedule, creating training plans, and getting paid, 
          this documentation will guide you through every feature.
        </p>
        <p className="text-muted-foreground">
          Whether you're a personal trainer, nutritionist, boxing coach, or MMA instructor, 
          FitConnect adapts to your specialty and business model.
        </p>
      </section>

      {/* Guide Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {coachGuides.map((guide) => (
            <Link key={guide.href} to={guide.href} className="no-underline">
              <Card className="h-full hover:border-primary/50 transition-colors bg-card">
                <CardHeader className="pb-2">
                  <guide.icon className="h-8 w-8 text-amber-500 mb-2" />
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

      {/* Quick Start Checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Checklist</h2>
        <p className="text-muted-foreground mb-4">
          Follow these steps to get your coaching business up and running:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-medium">Complete your profile</h3>
              <p className="text-sm text-muted-foreground">Add your bio, photo, certifications, and specialties.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-medium">Set up your services</h3>
              <p className="text-sm text-muted-foreground">Define session types, durations, and prices.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-medium">Configure availability</h3>
              <p className="text-sm text-muted-foreground">Set your working hours for each day of the week.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-medium">Connect Stripe</h3>
              <p className="text-sm text-muted-foreground">Set up payments to start accepting client payments.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">5</div>
            <div>
              <h3 className="font-medium">Get verified</h3>
              <p className="text-sm text-muted-foreground">Upload your ID and certifications to earn a verified badge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Why Coaches Choose FitConnect</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">All-in-one platform</h3>
            <p className="text-sm text-muted-foreground">
              Client management, scheduling, payments, and plan building in one place.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Built-in client discovery</h3>
            <p className="text-sm text-muted-foreground">
              Get discovered by clients searching for coaches in your specialty and area.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Professional tools</h3>
            <p className="text-sm text-muted-foreground">
              Workout and nutrition plan builders, message templates, and analytics.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Flexible pricing</h3>
            <p className="text-sm text-muted-foreground">
              Start free with up to 3 clients, upgrade as your business grows.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
