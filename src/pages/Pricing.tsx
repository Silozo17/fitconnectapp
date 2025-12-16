import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { Check, Star, Zap, Crown, MessageSquare, Calendar, TrendingUp, Video, FileText, Shield } from "lucide-react";

const Pricing = () => {
  const tiers = [
    {
      name: "Starter",
      priceRange: "$30 - $50",
      perSession: "per session",
      description: "Perfect for beginners starting their fitness journey",
      icon: Zap,
      features: [
        "Certified coaches with 2-5 years experience",
        "Basic workout or meal plans",
        "In-app messaging support",
        "Session scheduling",
        "Progress tracking"
      ],
      highlight: false
    },
    {
      name: "Pro",
      priceRange: "$50 - $100",
      perSession: "per session",
      description: "For dedicated individuals seeking accelerated results",
      icon: Star,
      features: [
        "Experienced coaches with 5-10+ years",
        "Fully customized training programs",
        "Nutrition guidance included",
        "Priority messaging response",
        "Video form checks & feedback",
        "Weekly check-ins"
      ],
      highlight: true,
      badge: "Most Popular"
    },
    {
      name: "Elite",
      priceRange: "$100 - $200+",
      perSession: "per session",
      description: "Premium coaching from industry-leading experts",
      icon: Crown,
      features: [
        "Celebrity & athlete-level coaches",
        "Comprehensive lifestyle coaching",
        "24/7 messaging access",
        "Custom meal plans & recipes",
        "Advanced analytics & insights",
        "Exclusive content & resources",
        "Competition prep available"
      ],
      highlight: false
    }
  ];

  const platformFeatures = [
    {
      icon: MessageSquare,
      title: "Unlimited Messaging",
      description: "Chat with your coach between sessions for guidance and support"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book and manage sessions with our intuitive calendar system"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your journey with detailed metrics and visualizations"
    },
    {
      icon: Video,
      title: "Video Sessions",
      description: "Train remotely with HD video calls built into the platform"
    },
    {
      icon: FileText,
      title: "Custom Plans",
      description: "Receive personalized workout and nutrition plans from your coach"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe, encrypted transactions with our satisfaction guarantee"
    }
  ];

  return (
    <PageLayout
      title="Pricing"
      description="Transparent pricing for FitConnect coaching services. Find coaches that fit your budget, from $30 to $200+ per session."
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="primary" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="secondary" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Flexible Pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees or subscriptions. Pay per session and only for what you need. 
            Coach rates vary based on experience and specialty.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative border-0 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  tier.highlight 
                    ? 'bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 ring-2 ring-primary/20' 
                    : 'bg-card/80 backdrop-blur-sm'
                }`}
              >
                {tier.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {tier.priceRange}
                    </span>
                    <span className="text-muted-foreground ml-2">{tier.perSession}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/coaches" className="block">
                    <GradientButton 
                      className="w-full" 
                      variant={tier.highlight ? "primary" : "outline"}
                    >
                      Browse {tier.name} Coaches
                    </GradientButton>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Included With{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Every Session
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All FitConnect users get access to our full suite of platform features at no extra cost
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Package Discounts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                      Save More With{" "}
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Session Packages
                      </span>
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Many coaches offer discounted rates when you commit to multiple sessions. 
                      Package deals can save you 10-20% compared to single sessions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary" />
                        <span>4-session packages: ~10% savings</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary" />
                        <span>8-session packages: ~15% savings</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary" />
                        <span>12+ session packages: ~20% savings</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-8 rounded-3xl bg-background shadow-soft">
                      <p className="text-sm text-muted-foreground mb-2">Example: 8-Session Package</p>
                      <p className="text-lg line-through text-muted-foreground">$640</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        $544
                      </p>
                      <p className="text-primary font-semibold">Save $96</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Fee Note */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How FitConnect Works</h2>
            <p className="text-muted-foreground mb-8">
              FitConnect charges a small platform fee (included in coach rates) to maintain our platform, 
              ensure quality standards, provide customer support, and continuously improve your experience. 
              <span className="font-semibold text-foreground"> There are no hidden fees</span>—the price you see on a coach's profile is the price you pay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/coaches">
                <GradientButton size="lg">Find Your Coach</GradientButton>
              </Link>
              <Link to="/faq">
                <GradientButton size="lg" variant="outline">View FAQ</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Pricing;
