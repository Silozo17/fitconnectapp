import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  User, 
  Dumbbell, 
  Shield, 
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Trophy,
  Flame,
  ShoppingCart,
  Target,
  Package,
  Rocket
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const popularArticles = [
  { title: "Creating your first account", href: "/docs/getting-started", icon: Sparkles },
  { title: "Finding the right coach", href: "/docs/client/coaches", icon: Search },
  { title: "Booking your first session", href: "/docs/client/sessions", icon: Calendar },
  { title: "Setting up Stripe payments", href: "/docs/coach/earnings", icon: CreditCard },
  { title: "Managing client conversations", href: "/docs/coach/messaging", icon: MessageSquare },
  { title: "Tracking your fitness progress", href: "/docs/client/progress", icon: TrendingUp },
  { title: "Habits & streaks", href: "/docs/client/habits", icon: Flame },
  { title: "Joining challenges", href: "/docs/client/challenges", icon: Target },
  { title: "Creating digital products", href: "/docs/coach/products", icon: Package },
  { title: "Using Boost marketing", href: "/docs/coach/boost", icon: Rocket },
  { title: "Understanding achievements", href: "/docs/client/achievements", icon: Trophy },
  { title: "Building workout plans", href: "/docs/coach/plans", icon: Dumbbell },
];

export default function DocsHub() {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "manager" || role === "staff";

  const quickLinks = [
    {
      title: "Getting Started",
      description: "New to FitConnect? Start here for a quick overview.",
      href: "/docs/getting-started",
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "For Clients",
      description: "Find coaches, book sessions, and track your progress.",
      href: "/docs/client",
      icon: User,
      color: "text-blue-500",
    },
    {
      title: "For Coaches",
      description: "Set up your profile, manage clients, and grow your business.",
      href: "/docs/coach",
      icon: Dumbbell,
      color: "text-amber-500",
    },
    ...(isAdmin ? [{
      title: "For Administrators",
      description: "Platform management and configuration guides.",
      href: "/docs/admin",
      icon: Shield,
      color: "text-purple-500",
    }] : []),
  ];

  return (
    <>
      <Helmet>
        <title>Help Center | FitConnect</title>
        <meta name="description" content="Get help with FitConnect. Find guides, tutorials, and answers to common questions." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative z-10 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              How can we <span className="text-primary">help</span> you?
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find guides, tutorials, and answers to help you get the most out of FitConnect.
            </p>
            
            {/* Search (visual only for now) */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search documentation..." 
                className="pl-12 h-12 text-lg bg-card border-border"
              />
            </div>
          </div>
        </section>

        {/* Main Categories */}
        <section className="py-12">
          <div className="container">
            <div className={`grid md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors bg-card">
                    <CardHeader>
                      <link.icon className={`h-10 w-10 ${link.color} mb-2`} />
                      <CardTitle className="text-xl">{link.title}</CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-primary text-sm font-medium flex items-center gap-1">
                        Browse guides <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularArticles.map((article) => (
                <Link 
                  key={article.href} 
                  to={article.href}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <article.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{article.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Get in touch with our support team.
            </p>
            <Button asChild variant="lime">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
