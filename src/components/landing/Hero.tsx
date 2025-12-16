import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Trophy } from "lucide-react";
import BlobShape from "@/components/ui/blob-shape";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users", color: "from-gradient-pink to-gradient-purple" },
    { icon: Trophy, value: "500+", label: "Expert Coaches", color: "from-gradient-orange to-gradient-coral" },
    { icon: Star, value: "4.9", label: "Average Rating", color: "from-gradient-teal to-gradient-mint" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Gradient Blobs */}
      <BlobShape variant="pink" size="xl" className="top-0 -left-48 opacity-60" />
      <BlobShape variant="teal" size="lg" className="bottom-20 -right-32 opacity-50" />
      <BlobShape variant="orange" size="md" className="top-1/3 right-1/4 opacity-40" />

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">
              The #1 Fitness Coaching Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Transform Your Body with{" "}
            <span className="gradient-text">Elite Coaches</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Connect with world-class personal trainers, nutritionists, and combat
            sports coaches. Get personalized plans and achieve your fitness goals
            faster.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <GradientButton asChild size="lg">
              <Link to="/coaches">
                Find Your Coach
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </GradientButton>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-border text-foreground hover:bg-secondary rounded-xl"
            >
              <Link to="/become-coach">
                <Play className="mr-2 w-5 h-5" />
                Become a Coach
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-soft`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
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

        {/* Floating Preview Cards */}
        <div
          className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {[
              { delay: "0s", gradient: "from-gradient-pink/20 to-gradient-purple/10" },
              { delay: "0.2s", gradient: "from-gradient-teal/20 to-gradient-mint/10" },
              { delay: "0.4s", gradient: "from-gradient-orange/20 to-gradient-coral/10" },
            ].map((item, index) => (
              <div
                key={index}
                className={`card-elevated p-4 md:p-6 animate-float bg-gradient-to-br ${item.gradient}`}
                style={{ animationDelay: item.delay }}
              >
                <div className="aspect-square rounded-xl bg-secondary/50 mb-4" />
                <div className="h-4 bg-secondary rounded-lg w-3/4 mb-2" />
                <div className="h-3 bg-secondary/60 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
