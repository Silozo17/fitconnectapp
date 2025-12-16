import {
  Search,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Shield,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Coach Discovery",
      description:
        "Find the perfect coach based on your goals, budget, and preferences. Filter by specialty, location, and availability.",
      gradient: "from-gradient-pink to-gradient-purple",
    },
    {
      icon: Calendar,
      title: "24/7 Easy Booking",
      description:
        "Book sessions anytime with real-time availability. Manage, reschedule, or cancel appointments with ease.",
      gradient: "from-gradient-orange to-gradient-coral",
    },
    {
      icon: ClipboardList,
      title: "Custom Training Plans",
      description:
        "Get personalized workout and nutrition plans tailored to your goals. Track progress and adjust as you grow.",
      gradient: "from-gradient-teal to-gradient-mint",
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description:
        "Stay connected with your coach through instant messaging. Share updates, ask questions, and stay motivated.",
      gradient: "from-gradient-purple to-gradient-blue",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your transformation with detailed analytics. Track weight, measurements, and workout completion.",
      gradient: "from-gradient-mint to-gradient-teal",
    },
    {
      icon: Shield,
      title: "Verified Coaches",
      description:
        "All coaches are verified professionals with proven credentials. Train with confidence and trust.",
      gradient: "from-gradient-coral to-gradient-orange",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
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
              className="group card-elevated p-6 md:p-8 hover-lift bg-background"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft`}
              >
                <feature.icon className="w-6 h-6 text-white" />
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
