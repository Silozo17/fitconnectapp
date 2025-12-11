import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Trophy } from "lucide-react";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Trophy, value: "500+", label: "Expert Coaches" },
    { icon: Star, value: "4.9", label: "Average Rating" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">
              The #1 Fitness Coaching Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Transform Your Body with{" "}
            <span className="gradient-text">Elite Coaches</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Connect with world-class personal trainers, nutritionists, and combat sports coaches. 
            Get personalized plans and achieve your fitness goals faster.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow text-lg px-8 h-14">
              <Link to="/coaches">
                Find Your Coach
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary h-14 text-lg px-8">
              <Link to="/become-coach">
                <Play className="mr-2 w-5 h-5" />
                Become a Coach
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-2xl text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Coach Cards Preview */}
        <div className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="grid grid-cols-3 gap-4 opacity-80">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="card-elevated p-4 rounded-xl animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="aspect-square rounded-lg bg-secondary mb-3" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary/60 rounded w-1/2" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
