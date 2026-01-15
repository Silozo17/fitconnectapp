import { Link } from "react-router-dom";
import { 
  Building2, Users, Calendar, CreditCard, BarChart3, Shield, ArrowRight, Bell, Check, Zap,
  HeartHandshake, RefreshCw, Clock, Phone, MapPin, Lock, Award, Sparkles, MessageSquare,
  Globe, ChevronRight, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEOHead } from "@/components/shared/SEOHead";
import { MigrationTimeline } from "@/components/gym/marketing/MigrationTimeline";
import { ROICalculator } from "@/components/gym/marketing/ROICalculator";
import { GymTypeShowcase } from "@/components/gym/marketing/GymTypeShowcase";
import { FeatureTabs } from "@/components/gym/marketing/FeatureTabs";
import { CompetitorComparison } from "@/components/gym/marketing/CompetitorComparison";
import { GymTestimonials } from "@/components/gym/marketing/GymTestimonials";
import { GymFAQ, faqSchemaData } from "@/components/gym/marketing/GymFAQ";

const ForGyms = () => {
  const pricingFeatures = [
    "1 location included (+£25/month each additional)",
    "Unlimited staff accounts",
    "Full member management",
    "Class scheduling & bookings",
    "Payment processing (Stripe)",
    "Staff access control & activity logs",
    "QR check-in system",
    "Analytics & reporting",
    "Automated communications"
  ];

  const migrationSoftware = [
    "Mindbody",
    "Glofox", 
    "ClubRight",
    "TeamUp",
    "Gymcatch",
    "Spreadsheets",
  ];

  const integrations = [
    { name: "Stripe", description: "Payment processing" },
    { name: "GoCardless", description: "Direct Debit" },
    { name: "Apple Health", description: "Wearable sync" },
    { name: "Google Fit", description: "Activity data" },
    { name: "Zoom", description: "Online classes" },
    { name: "Xero", description: "Coming soon" },
  ];

  const securityFeatures = [
    { icon: Lock, title: "256-bit SSL Encryption", description: "Bank-level security for all data" },
    { icon: Shield, title: "GDPR Compliant", description: "Full UK data protection compliance" },
    { icon: Globe, title: "UK Data Centres", description: "Your data stays in the UK" },
    { icon: RefreshCw, title: "Daily Backups", description: "Never lose your data" },
  ];

  // Schema markup for SEO
  const schemaMarkup = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FitConnect Gym Management Software",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "99",
        "priceCurrency": "GBP",
        "priceValidUntil": "2025-12-31",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1",
      },
      "description": "All-in-one gym management software for fitness businesses. Manage members, automate billing, schedule classes, and grow your gym.",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqSchemaData,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fitconnect.uk" },
        { "@type": "ListItem", "position": 2, "name": "For Gyms", "item": "https://fitconnect.uk/for-gyms" },
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title="Gym Management Software UK | All-in-One Platform | FitConnect"
        description="Manage members, automate billing, schedule classes and grow your gym with FitConnect. Built by gym owners, trusted by 500+ UK fitness businesses. Start your free 14-day trial."
        canonicalPath="/for-gyms"
        keywords={[
          "gym management software UK",
          "fitness studio software",
          "gym billing system",
          "class scheduling software",
          "gym member management",
          "CrossFit box management",
          "martial arts school software",
          "boutique gym software",
          "Mindbody alternative UK",
          "gym software UK",
          "fitness business software",
          "gym check-in system",
        ]}
        schema={schemaMarkup}
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust badges */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HeartHandshake className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Built by Gym Owners • 14-Day Free Trial • No Card Required</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                The All-in-One Gym Management Platform
                <span className="block text-primary mt-2">That Actually Gets It</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Stop juggling 5 different apps. FitConnect combines member management, billing, scheduling, 
                check-ins, and marketing—all in one powerful platform built by gym owners who've been in your shoes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <GradientButton size="lg" asChild>
                  <Link to="/gym-register">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </GradientButton>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">
                    <Phone className="mr-2 w-5 h-5" />
                    Book a Demo
                  </Link>
                </Button>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Gyms Using FitConnect</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">50,000+</p>
                  <p className="text-sm text-muted-foreground">Members Managed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime SLA</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">4.9★</p>
                  <p className="text-sm text-muted-foreground">Customer Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* BUILT BY GYM OWNERS STORY */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <HeartHandshake className="w-4 h-4" />
                    Our Story
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                    We Were Frustrated Too.
                    <span className="text-primary block">So We Built Something Better.</span>
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      After running gyms for over a decade, we knew the pain of juggling multiple software tools, 
                      chasing failed payments, and spending hours on admin instead of coaching.
                    </p>
                    <p>
                      Existing software was either too expensive, too complicated, or designed by people 
                      who'd never stepped foot in a gym. We needed something different.
                    </p>
                    <p className="font-medium text-foreground">
                      So we built FitConnect—the gym management platform we always wished existed. 
                      Simple enough for any staff member, powerful enough for any gym.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <Award className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">10+ Years</h3>
                    <p className="text-sm text-muted-foreground">Running gyms & martial arts schools</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <Users className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Tested Daily</h3>
                    <p className="text-sm text-muted-foreground">In real gyms by real staff</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <MessageSquare className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">User-Driven</h3>
                    <p className="text-sm text-muted-foreground">Every feature requested by gym owners</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <MapPin className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">UK-Based</h3>
                    <p className="text-sm text-muted-foreground">Support team in your timezone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* PROBLEM / SOLUTION */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Sound Familiar?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've heard these frustrations from hundreds of gym owners. Here's how FitConnect solves them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  problem: "Juggling 5+ apps for billing, scheduling, and check-ins",
                  solution: "One platform that does it all—no more switching between tools",
                },
                {
                  problem: "Chasing failed payments and losing revenue",
                  solution: "Automated payment recovery that saves hours and recovers money",
                },
                {
                  problem: "Expensive software eating into already thin margins",
                  solution: "Transparent pricing from £99/mo—no hidden fees ever",
                },
                {
                  problem: "Staff struggling with complicated systems",
                  solution: "Intuitive interface anyone can learn in under an hour",
                },
                {
                  problem: "Poor member communication hurting retention",
                  solution: "Automated emails, SMS, and at-risk member alerts",
                },
                {
                  problem: "No visibility into what's actually working",
                  solution: "Real-time dashboards with actionable insights",
                },
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-xs">✕</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.problem}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium">{item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURE DEEP-DIVE TABS */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Run Your Gym
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                10 powerful modules working together. Click to explore each feature in detail.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <FeatureTabs />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* GYM TYPE SHOWCASE */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Built for Every Type of Fitness Business
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you run a CrossFit box, martial arts school, or 24/7 gym—FitConnect adapts to how you work.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <GymTypeShowcase />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHITE-GLOVE MIGRATION */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <RefreshCw className="w-4 h-4" />
                  Zero Hassle Switching
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Switching Software? We Handle Everything.
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Your dedicated account manager will migrate all your data, train your staff, 
                  and stay with you for 90 days. You focus on members—we handle the tech.
                </p>
              </div>

              {/* Migration from badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <span className="text-sm text-muted-foreground">Migrating from:</span>
                {migrationSoftware.map((software, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full bg-card border border-border text-sm"
                  >
                    {software}
                  </span>
                ))}
              </div>

              <MigrationTimeline />

              {/* Migration guarantee */}
              <div className="mt-12 p-6 rounded-2xl bg-card border border-primary/20 text-center">
                <h3 className="font-semibold text-lg mb-2">Our Migration Guarantee</h3>
                <p className="text-muted-foreground mb-4">
                  If we can't migrate your data successfully, your first 3 months are free. 
                  That's how confident we are in our process.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/contact">
                    <Phone className="mr-2 w-4 h-4" />
                    Talk to Migration Team
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* ROI CALCULATOR */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Calculate Your Savings
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how much time and money you could save by switching to FitConnect.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <ROICalculator />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Trusted by 500+ UK Fitness Businesses
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from gym owners who've made the switch.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <GymTestimonials />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INTEGRATIONS */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Works With Your Existing Tools
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Seamlessly connect with the tools you already use.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{integration.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECURITY & COMPLIANCE */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Enterprise-Grade Security
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your members' data is protected with bank-level security. Full GDPR compliance guaranteed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* COMPETITOR COMPARISON */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                How We Compare
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See why gym owners are switching to FitConnect.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <CompetitorComparison />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* PRICING */}
        {/* ============================================ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No hidden fees, no complicated tiers, no "call for quote". Just straightforward pricing that scales with you.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="font-display text-5xl md:text-6xl font-bold text-foreground">£99</span>
                      <span className="text-muted-foreground text-lg">/month</span>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-lg text-foreground font-medium">+ £1 per member payment</span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      We only charge when your members pay—aligned with your success
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-sm font-medium text-primary">🎉 14-day free trial • No card required</span>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {pricingFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div className="bg-secondary/50 rounded-xl p-6 mb-8">
                    <h4 className="font-medium text-foreground mb-4">Example monthly costs:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-foreground">£149</p>
                        <p className="text-sm text-muted-foreground">50 member payments</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg border-2 border-primary">
                        <p className="text-2xl font-bold text-foreground">£199</p>
                        <p className="text-sm text-muted-foreground">100 member payments</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-foreground">£599</p>
                        <p className="text-sm text-muted-foreground">500 member payments</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <GradientButton size="lg" asChild>
                      <Link to="/gym-register">
                        Start Free Trial
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </GradientButton>
                    <p className="text-sm text-muted-foreground mt-4">
                      14-day free trial • No card required • Cancel anytime
                    </p>
                  </div>
                </div>
              </div>

              {/* Enterprise callout */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Running a gym chain with 5+ locations?{" "}
                  <Link to="/contact" className="text-primary font-medium hover:underline">
                    Contact us for enterprise pricing →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FAQ */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about FitConnect. Can't find an answer?{" "}
                <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <GymFAQ />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FINAL CTA */}
        {/* ============================================ */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ready to Transform Your Gym?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 500+ UK gyms already using FitConnect to streamline operations, retain more members, and grow their business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton size="lg" asChild>
                  <Link to="/gym-register">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </GradientButton>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">
                    <Phone className="mr-2 w-5 h-5" />
                    Book a Demo
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  No card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" />
                  Free migration
                </span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForGyms;
