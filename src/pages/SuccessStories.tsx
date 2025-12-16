import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, TrendingDown, Dumbbell, Apple, Target } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";

const SuccessStories = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Stories" },
    { id: "weight-loss", label: "Weight Loss" },
    { id: "muscle-gain", label: "Muscle Gain" },
    { id: "boxing", label: "Boxing" },
    { id: "mma", label: "MMA" },
    { id: "nutrition", label: "Nutrition" },
  ];

  const stories = [
    {
      id: 1,
      name: "Sarah M.",
      category: "weight-loss",
      coach: "James Wilson",
      coachType: "Personal Trainer",
      beforeWeight: "95kg",
      afterWeight: "68kg",
      duration: "8 months",
      quote: "FitConnect changed my life. My coach James helped me lose 27kg and gain confidence I never knew I had.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
    },
    {
      id: 2,
      name: "Marcus T.",
      category: "muscle-gain",
      coach: "Alex Chen",
      coachType: "Personal Trainer",
      beforeWeight: "65kg",
      afterWeight: "82kg",
      duration: "12 months",
      quote: "I went from skinny to strong. Alex's personalised program and constant support made all the difference.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400",
    },
    {
      id: 3,
      name: "Emma K.",
      category: "boxing",
      coach: "Mike Rodriguez",
      coachType: "Boxing Coach",
      achievement: "Amateur Champion",
      duration: "18 months",
      quote: "Started as a complete beginner. Now I've won my first amateur title. Mike's coaching is world-class.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
    },
    {
      id: 4,
      name: "David L.",
      category: "nutrition",
      coach: "Sophie Anderson",
      coachType: "Nutritionist",
      achievement: "Reversed pre-diabetes",
      duration: "6 months",
      quote: "Sophie's meal plans were easy to follow. My blood sugar is now normal and I feel amazing.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    },
    {
      id: 5,
      name: "Ryan P.",
      category: "mma",
      coach: "Carlos Silva",
      coachType: "MMA Coach",
      achievement: "First MMA fight win",
      duration: "14 months",
      quote: "From watching UFC on TV to stepping in the cage myself. Carlos prepared me for everything.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400",
    },
    {
      id: 6,
      name: "Jennifer H.",
      category: "weight-loss",
      coach: "Lisa Brown",
      coachType: "Personal Trainer",
      beforeWeight: "82kg",
      afterWeight: "62kg",
      duration: "10 months",
      quote: "After having kids, I thought I'd never get my body back. Lisa proved me wrong!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
    },
  ];

  const filteredStories = activeFilter === "all" 
    ? stories 
    : stories.filter(s => s.category === activeFilter);

  return (
    <>
      <Helmet>
        <title>Success Stories | FitConnect - Real Transformations</title>
        <meta name="description" content="Read inspiring success stories from FitConnect clients who transformed their lives with our world-class coaches." />
      </Helmet>
      
      <div className="min-h-screen bg-background relative">
        <Navbar />
        
        {/* Decorative Avatar */}
        <DecorativeAvatar 
          avatarSlug="deadlift-boar" 
          position="bottom-right" 
          size="xl" 
          opacity={18}
          className="right-8 bottom-20 z-0"
        />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto text-center relative z-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Real Results
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Success <span className="text-gradient-primary">Stories</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Real people, real transformations. See how our clients achieved their fitness goals with FitConnect coaches.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={activeFilter === filter.id ? "bg-primary text-primary-foreground" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <Card key={story.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-sm">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                      {story.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">"{story.quote}"</p>
                    <div className="space-y-2 mb-4">
                      <p className="font-semibold text-foreground">{story.name}</p>
                      {story.beforeWeight && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingDown className="w-4 h-4 text-primary" />
                          <span>{story.beforeWeight} → {story.afterWeight}</span>
                        </div>
                      )}
                      {story.achievement && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="w-4 h-4 text-primary" />
                          <span>{story.achievement}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Coach: <span className="text-foreground">{story.coach}</span> • {story.duration}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of others who have transformed their lives with FitConnect.
            </p>
            <Link to="/coaches">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find Your Coach <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default SuccessStories;
