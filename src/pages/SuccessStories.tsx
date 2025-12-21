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
import { useTranslation } from "@/hooks/useTranslation";

const SuccessStories = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: t('pages.successStories.filters.all') },
    { id: "weight-loss", label: t('pages.successStories.filters.weightLoss') },
    { id: "muscle-gain", label: t('pages.successStories.filters.muscleGain') },
    { id: "boxing", label: t('pages.successStories.filters.boxing') },
    { id: "mma", label: t('pages.successStories.filters.mma') },
    { id: "nutrition", label: t('pages.successStories.filters.nutrition') },
  ];

  const stories = [
    {
      id: 1,
      name: "Sarah M.",
      category: "weight-loss",
      coach: "James Wilson",
      coachType: t('pages.successStories.coachTypes.personalTrainer'),
      beforeWeight: "95kg",
      afterWeight: "68kg",
      duration: t('pages.successStories.duration.months', { count: 8 }),
      quote: t('pages.successStories.stories.sarah.quote'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
    },
    {
      id: 2,
      name: "Marcus T.",
      category: "muscle-gain",
      coach: "Alex Chen",
      coachType: t('pages.successStories.coachTypes.personalTrainer'),
      beforeWeight: "65kg",
      afterWeight: "82kg",
      duration: t('pages.successStories.duration.months', { count: 12 }),
      quote: t('pages.successStories.stories.marcus.quote'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400",
    },
    {
      id: 3,
      name: "Emma K.",
      category: "boxing",
      coach: "Mike Rodriguez",
      coachType: t('pages.successStories.coachTypes.boxingCoach'),
      achievement: t('pages.successStories.stories.emma.achievement'),
      duration: t('pages.successStories.duration.months', { count: 18 }),
      quote: t('pages.successStories.stories.emma.quote'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
    },
    {
      id: 4,
      name: "David L.",
      category: "nutrition",
      coach: "Sophie Anderson",
      coachType: t('pages.successStories.coachTypes.nutritionist'),
      achievement: t('pages.successStories.stories.david.achievement'),
      duration: t('pages.successStories.duration.months', { count: 6 }),
      quote: t('pages.successStories.stories.david.quote'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    },
    {
      id: 5,
      name: "Ryan P.",
      category: "mma",
      coach: "Carlos Silva",
      coachType: t('pages.successStories.coachTypes.mmaCoach'),
      achievement: t('pages.successStories.stories.ryan.achievement'),
      duration: t('pages.successStories.duration.months', { count: 14 }),
      quote: t('pages.successStories.stories.ryan.quote'),
      rating: 5,
      image: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400",
    },
    {
      id: 6,
      name: "Jennifer H.",
      category: "weight-loss",
      coach: "Lisa Brown",
      coachType: t('pages.successStories.coachTypes.personalTrainer'),
      beforeWeight: "82kg",
      afterWeight: "62kg",
      duration: t('pages.successStories.duration.months', { count: 10 }),
      quote: t('pages.successStories.stories.jennifer.quote'),
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
        <title>{t('pages.successStories.meta.title')}</title>
        <meta name="description" content={t('pages.successStories.meta.description')} />
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
              {t('pages.successStories.hero.badge')}
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t('pages.successStories.hero.titleStart')} <span className="text-gradient-primary">{t('pages.successStories.hero.titleHighlight')}</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              {t('pages.successStories.hero.description')}
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
                        {t('pages.successStories.card.coach')}: <span className="text-foreground">{story.coach}</span> • {story.duration}
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
              {t('pages.successStories.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('pages.successStories.cta.description')}
            </p>
            <Link to="/coaches">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('pages.successStories.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
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