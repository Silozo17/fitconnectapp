import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { DottedPattern } from "@/components/ui/dotted-pattern";
import { Users, Award, Star, Zap, ArrowRight } from "lucide-react";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Award, value: "500+", label: "Expert Coaches" },
    { icon: Star, value: "4.9", label: "Average Rating" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <DottedPattern variant="circle" size={300} className="absolute top-20 right-10 opacity-30" />
        <DottedPattern variant="circle" size={150} className="absolute bottom-40 left-20 opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <NeonBadge variant="lime" size="md" className="gap-2">
              <Zap className="w-4 h-4" />
              <span>#1 Fitness Coaching Platform</span>
            </NeonBadge>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transform Your Body
            <span className="block gradient-text-energy">With Elite Coaches</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with world-class personal trainers, nutritionists, and combat sports coaches. 
            Achieve your fitness goals with personalized guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <GradientButton size="lg" asChild>
              <Link to="/coaches" className="gap-2">
                Find Your Coach
                <ArrowRight className="w-5 h-5" />
              </Link>
            </GradientButton>
            <GradientButton variant="outline" size="lg" asChild>
              <Link to="/for-coaches">Become a Coach</Link>
            </GradientButton>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-6 py-4 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground font-display">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="card-glow p-6 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-3xl">🏋️</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Personal Training</h3>
              <p className="text-muted-foreground text-sm">Custom workout plans tailored to your goals</p>
            </div>
            <div className="card-glow p-6 border-primary/30 glow-sm animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <span className="text-3xl">🥗</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Nutrition Coaching</h3>
              <p className="text-muted-foreground text-sm">Meal plans and macro tracking for results</p>
              <NeonBadge variant="purple" size="sm" className="mt-4">Most Popular</NeonBadge>
            </div>
            <div className="card-glow p-6 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-3xl">🥊</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Combat Sports</h3>
              <p className="text-muted-foreground text-sm">Boxing, MMA, and martial arts training</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
