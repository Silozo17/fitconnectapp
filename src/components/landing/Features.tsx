import { 
  Search, 
  Calendar, 
  MessageSquare, 
  ClipboardList, 
  TrendingUp, 
  Shield 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Coach Discovery",
      description: "Find the perfect coach based on your goals, budget, and preferences. Filter by specialty, location, and availability.",
    },
    {
      icon: Calendar,
      title: "24/7 Easy Booking",
      description: "Book sessions anytime with real-time availability. Manage, reschedule, or cancel appointments with ease.",
    },
    {
      icon: ClipboardList,
      title: "Custom Training Plans",
      description: "Get personalized workout and nutrition plans tailored to your goals. Track progress and adjust as you grow.",
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Stay connected with your coach through instant messaging. Share updates, ask questions, and stay motivated.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your transformation with detailed analytics. Track weight, measurements, and workout completion.",
    },
    {
      icon: Shield,
      title: "Verified Coaches",
      description: "All coaches are verified professionals with proven credentials. Train with confidence and trust.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background relative">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">
            PLATFORM FEATURES
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform provides all the tools you need to find the right coach, 
            stay on track, and achieve your fitness goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group card-elevated p-6 md:p-8 hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
