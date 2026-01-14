import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Building2, Users, Calendar, CreditCard, BarChart3, Shield, ArrowRight, Bell, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ForGyms = () => {
  const { t } = useTranslation("common");

  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Track memberships, attendance, and member profiles all in one place."
    },
    {
      icon: Calendar,
      title: "Class Scheduling",
      description: "Easy-to-use scheduling for classes, personal training, and facility bookings."
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Automated billing, payment collection, and financial reporting."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Real-time data on attendance, revenue, and member engagement."
    },
    {
      icon: Shield,
      title: "Access Control",
      description: "Secure check-in system with QR codes and staff permissions."
    },
    {
      icon: Bell,
      title: "Automated Communications",
      description: "Keep members engaged with automated reminders and announcements."
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Free Trial Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">14-Day Free Trial • No Card Required</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Gym & Club Management
              <span className="block text-primary mt-2">Made Simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete platform to manage your gym, martial arts club, or fitness studio. 
              From member management to payments, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton size="lg" asChild>
                <Link to="/gym-register">
                  Register Your Gym
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </GradientButton>
              <Button variant="outline" size="lg" asChild>
                <Link to="/gym-login">
                  <Building2 className="mr-2 w-5 h-5" />
                  Staff Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for gyms, martial arts clubs, and fitness studios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No hidden fees, no complicated tiers. Just straightforward pricing that scales with you.
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
                    We only charge when your members pay
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
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </GradientButton>
                  <p className="text-sm text-muted-foreground mt-4">
                    14-day free trial • No card required • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Gym?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of gyms already using FitConnect to streamline their operations.
            </p>
            <GradientButton size="lg" asChild>
              <Link to="/gym-register">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </GradientButton>
            <p className="text-sm text-muted-foreground mt-4">
              14-day free trial • Then £99/month + £1 per member payment
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForGyms;
