import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Users, DollarSign, Calendar, BarChart3, Shield, Globe, 
  MessageSquare, Video, FileText, Clock, CheckCircle, Star,
  TrendingUp, Zap, Award
} from "lucide-react";

const ForCoaches = () => {
  const [sessionsPerWeek, setSessionsPerWeek] = useState(10);
  const [ratePerSession, setRatePerSession] = useState(75);

  const monthlyEarnings = sessionsPerWeek * ratePerSession * 4 * 0.85; // 15% platform fee
  const yearlyEarnings = monthlyEarnings * 12;

  const benefits = [
    {
      icon: Users,
      title: "Reach Thousands of Clients",
      description: "Get discovered by motivated individuals actively seeking your expertise. Our platform drives qualified leads directly to you."
    },
    {
      icon: Calendar,
      title: "Built-in Scheduling",
      description: "Manage your availability with our powerful scheduling system. Sync with your calendar and let clients book automatically."
    },
    {
      icon: DollarSign,
      title: "Secure Payments",
      description: "Get paid reliably after every session. We handle all payment processing so you can focus on coaching."
    },
    {
      icon: BarChart3,
      title: "Client Management Tools",
      description: "Track client progress, create custom plans, and manage your entire business from one dashboard."
    },
    {
      icon: Globe,
      title: "Train Clients Anywhere",
      description: "Offer online sessions to clients worldwide. Our HD video platform makes remote coaching seamless."
    },
    {
      icon: Shield,
      title: "Business Protection",
      description: "Clear terms, cancellation policies, and our support team backing you up if issues arise."
    }
  ];

  const platformTools = [
    { icon: Calendar, label: "Smart Scheduling" },
    { icon: MessageSquare, label: "In-App Messaging" },
    { icon: Video, label: "Video Sessions" },
    { icon: FileText, label: "Plan Builder" },
    { icon: TrendingUp, label: "Progress Tracking" },
    { icon: DollarSign, label: "Payment Processing" }
  ];

  const requirements = [
    "Valid certification from an accredited organization (NASM, ACE, ISSA, NSCA, etc.)",
    "Minimum 2 years of professional coaching experience",
    "Pass a comprehensive background check",
    "Maintain professional liability insurance",
    "Commitment to FitConnect's code of conduct and quality standards"
  ];

  const testimonials = [
    {
      quote: "FitConnect transformed my coaching business. I went from 5 local clients to over 30 clients worldwide in just 6 months.",
      author: "Mike Thompson",
      role: "Personal Trainer",
      rating: 5
    },
    {
      quote: "The platform handles all the admin work I used to dread—scheduling, payments, client management. Now I just focus on coaching.",
      author: "Sarah Chen",
      role: "Nutritionist",
      rating: 5
    },
    {
      quote: "As a boxing coach, I never thought online training would work. FitConnect proved me wrong. My online clients are crushing their goals.",
      author: "Marcus Williams",
      role: "Boxing Coach",
      rating: 5
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Apply & Get Verified",
      description: "Submit your credentials and complete our verification process. We review certifications and conduct background checks."
    },
    {
      step: "02",
      title: "Build Your Profile",
      description: "Create a compelling profile showcasing your expertise, experience, and training philosophy. Set your rates and availability."
    },
    {
      step: "03",
      title: "Start Coaching & Earning",
      description: "Accept client bookings, deliver amazing sessions, and grow your business. We handle the rest."
    }
  ];

  return (
    <PageLayout
      title="Become a Coach"
      description="Grow your coaching business with FitConnect. Reach thousands of clients, manage your schedule, and focus on what you love—coaching."
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                For Fitness Professionals
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Grow Your Coaching Business With{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  FitConnect
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join 500+ coaches reaching clients worldwide. Set your own rates, build your brand, 
                and focus on what you do best—transforming lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth?mode=signup&role=coach">
                  <GradientButton size="lg">Apply Now</GradientButton>
                </Link>
                <Link to="/how-it-works">
                  <GradientButton size="lg" variant="outline">Learn More</GradientButton>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold">Earnings Calculator</h3>
                    <p className="text-muted-foreground text-sm">See your potential earnings</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sessions per week: {sessionsPerWeek}
                      </label>
                      <Input
                        type="range"
                        min="1"
                        max="40"
                        value={sessionsPerWeek}
                        onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rate per session: ${ratePerSession}
                      </label>
                      <Input
                        type="range"
                        min="30"
                        max="200"
                        step="5"
                        value={ratePerSession}
                        onChange={(e) => setRatePerSession(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ${monthlyEarnings.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Yearly</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ${yearlyEarnings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        *After 15% platform fee. Actual earnings may vary.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <BlobShape className="absolute -bottom-10 -right-10 w-32 h-32 opacity-50 -z-10" variant="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Coaches Choose{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FitConnect
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a successful coaching business, all in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Tools */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Tools at Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Fingertips
              </span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {platformTools.map((tool, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-card shadow-soft border border-border/50"
              >
                <tool.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <span className="inline-block text-6xl font-bold bg-gradient-to-r from-primary/20 to-secondary/20 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Coaches{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Are Saying
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-primary">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Coach Requirements
              </h2>
              <p className="text-muted-foreground">
                We maintain high standards to ensure the best experience for our clients
              </p>
            </div>
            
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Coaching Business?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join FitConnect today and start reaching clients who are ready to transform their lives with your help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup&role=coach">
                <GradientButton size="lg">Apply to Become a Coach</GradientButton>
              </Link>
              <Link to="/faq">
                <GradientButton size="lg" variant="outline">Coach FAQ</GradientButton>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              <Clock className="w-4 h-4 inline mr-1" />
              Application review typically takes 3-5 business days
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ForCoaches;
