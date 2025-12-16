import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Search, Calendar, Video, TrendingUp, 
  FileText, Shield, CheckCircle, Users,
  MessageSquare, Star, Zap, Award
} from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";

const HowItWorks = () => {
  const clientSteps = [
    {
      step: "01",
      icon: Search,
      title: "Browse & Discover",
      description: "Search our curated network of certified coaches. Filter by specialty, location, price, and availability to find your perfect match.",
      details: [
        "Personal trainers, nutritionists, boxing coaches & more",
        "Read detailed profiles and verified reviews",
        "Compare rates and specialties",
        "View real results from other clients"
      ]
    },
    {
      step: "02",
      icon: MessageSquare,
      title: "Connect & Consult",
      description: "Message coaches directly and book a free discovery call to discuss your goals and ensure it's a great fit.",
      details: [
        "Free 15-minute consultation with most coaches",
        "Discuss your goals and limitations",
        "Get a feel for their coaching style",
        "No commitment until you're ready"
      ]
    },
    {
      step: "03",
      icon: Calendar,
      title: "Book & Train",
      description: "Schedule sessions that fit your life. Train online from anywhere or meet in person with local coaches.",
      details: [
        "Flexible scheduling to match your calendar",
        "Online or in-person sessions available",
        "HD video for remote training",
        "Easy rescheduling when needed"
      ]
    },
    {
      step: "04",
      icon: TrendingUp,
      title: "Track & Transform",
      description: "Monitor your progress with built-in tracking tools. Celebrate milestones and adjust your plan as you grow.",
      details: [
        "Visual progress charts and metrics",
        "Custom workout and meal plans",
        "Regular check-ins with your coach",
        "Achieve sustainable results"
      ]
    }
  ];

  const coachSteps = [
    {
      step: "01",
      icon: FileText,
      title: "Apply & Verify",
      description: "Submit your application with credentials. We verify certifications and conduct background checks to maintain quality standards.",
      details: [
        "Quick online application process",
        "Submit certifications and experience",
        "Background check for client safety",
        "Review typically takes 3-5 days"
      ]
    },
    {
      step: "02",
      icon: Users,
      title: "Build Your Profile",
      description: "Create a compelling profile that showcases your expertise. Set your rates, availability, and service offerings.",
      details: [
        "Upload photos and videos",
        "Highlight specialties and achievements",
        "Set your own rates and packages",
        "Define your service area"
      ]
    },
    {
      step: "03",
      icon: Zap,
      title: "Get Discovered",
      description: "Your profile goes live in our marketplace. Clients searching for your expertise will find you organically.",
      details: [
        "Appear in relevant search results",
        "Featured placement for top coaches",
        "Receive client inquiries directly",
        "Build your reputation with reviews"
      ]
    },
    {
      step: "04",
      icon: Award,
      title: "Coach & Earn",
      description: "Accept bookings, deliver amazing sessions, and get paid securely. Focus on coaching while we handle the business side.",
      details: [
        "Manage clients from your dashboard",
        "Automatic payment processing",
        "Build recurring client relationships",
        "Grow your business sustainably"
      ]
    }
  ];

  const features = [
    {
      icon: Video,
      title: "HD Video Sessions",
      description: "Crystal-clear video calls with screen sharing for form checks and demonstrations"
    },
    {
      icon: MessageSquare,
      title: "Secure Messaging",
      description: "Stay connected between sessions with in-app chat and file sharing"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Book sessions easily with calendar sync and automatic reminders"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visualize your journey with charts, photos, and milestone celebrations"
    },
    {
      icon: FileText,
      title: "Custom Plans",
      description: "Receive personalized workout and nutrition plans tailored to your goals"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Bank-level encryption protects your data and payments"
    }
  ];

  return (
    <PageLayout
      title="How It Works"
      description="Learn how FitConnect connects you with expert fitness coaches. Simple steps for clients to find coaches and coaches to grow their business."
    >
      {/* Decorative Avatars */}
      <DecorativeAvatar 
        avatarSlug="crossfit-wolf" 
        position="top-right" 
        size="lg" 
        opacity={18}
        className="right-8 top-40 z-0"
      />
      <DecorativeAvatar 
        avatarSlug="martial-arts-crane" 
        position="bottom-left" 
        size="md" 
        opacity={15}
        className="left-8 bottom-32 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Getting Started
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Fitness Journey,{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're looking for a coach or ready to grow your coaching business, 
            FitConnect makes it easy to get started.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="clients" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="h-auto p-1 bg-muted/50">
                <TabsTrigger value="clients" className="px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  I'm Looking for a Coach
                </TabsTrigger>
                <TabsTrigger value="coaches" className="px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  I'm a Coach
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="clients">
              <div className="space-y-12 max-w-5xl mx-auto">
                {clientSteps.map((step, index) => (
                  <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary/30 to-secondary/30 bg-clip-text text-transparent">
                          {step.step}
                        </span>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 aspect-square flex items-center justify-center">
                        <step.icon className="w-24 h-24 text-primary/30" />
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link to="/coaches">
                  <GradientButton size="lg">Find Your Coach Now</GradientButton>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="coaches">
              <div className="space-y-12 max-w-5xl mx-auto">
                {coachSteps.map((step, index) => (
                  <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary/30 to-secondary/30 bg-clip-text text-transparent">
                          {step.step}
                        </span>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 aspect-square flex items-center justify-center">
                        <step.icon className="w-24 h-24 text-primary/30" />
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link to="/for-coaches">
                  <GradientButton size="lg">Start Your Application</GradientButton>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Built In
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform includes all the tools you need for a seamless coaching experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium mb-6 italic">
              "FitConnect made finding the right coach so easy. Within a week, I was training with someone who truly understood my goals. 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Best decision I ever made for my health.
              </span>"
            </blockquote>
            <div>
              <p className="font-semibold">Amanda K.</p>
              <p className="text-muted-foreground">Lost 30 lbs in 4 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Started?
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're looking to transform your body or grow your coaching business, 
            your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/coaches">
              <GradientButton size="lg">Find a Coach</GradientButton>
            </Link>
            <Link to="/for-coaches">
              <GradientButton size="lg" variant="outline">Become a Coach</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
