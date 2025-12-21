import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Swords, Target, Zap, Shield, Heart, ArrowRight, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Boxing = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Zap,
      title: t('pages.coachTypes.boxing.benefits.fullBody.title'),
      description: t('pages.coachTypes.boxing.benefits.fullBody.description'),
    },
    {
      icon: Target,
      title: t('pages.coachTypes.boxing.benefits.skills.title'),
      description: t('pages.coachTypes.boxing.benefits.skills.description'),
    },
    {
      icon: Shield,
      title: t('pages.coachTypes.boxing.benefits.selfDefense.title'),
      description: t('pages.coachTypes.boxing.benefits.selfDefense.description'),
    },
    {
      icon: Heart,
      title: t('pages.coachTypes.boxing.benefits.stress.title'),
      description: t('pages.coachTypes.boxing.benefits.stress.description'),
    },
  ];

  const faqs = [
    {
      question: t('pages.coachTypes.boxing.faq.experience.question'),
      answer: t('pages.coachTypes.boxing.faq.experience.answer'),
    },
    {
      question: t('pages.coachTypes.boxing.faq.equipment.question'),
      answer: t('pages.coachTypes.boxing.faq.equipment.answer'),
    },
    {
      question: t('pages.coachTypes.boxing.faq.safety.question'),
      answer: t('pages.coachTypes.boxing.faq.safety.answer'),
    },
    {
      question: t('pages.coachTypes.boxing.faq.weightLoss.question'),
      answer: t('pages.coachTypes.boxing.faq.weightLoss.answer'),
    },
    {
      question: t('pages.coachTypes.boxing.faq.results.question'),
      answer: t('pages.coachTypes.boxing.faq.results.answer'),
    },
  ];

  const featuredCoaches = [
    { name: "Mike Rodriguez", specialty: t('pages.coachTypes.boxing.featured.specialties.amateur'), rating: 4.9, fights: 50 },
    { name: "Tommy Williams", specialty: t('pages.coachTypes.boxing.featured.specialties.fitness'), rating: 4.8, clients: 300 },
    { name: "Sarah Jones", specialty: t('pages.coachTypes.boxing.featured.specialties.womens'), rating: 4.9, experience: t('pages.coachTypes.boxing.featured.experience', { years: 15 }) },
  ];

  return (
    <>
      <Helmet>
        <title>{t('pages.coachTypes.boxing.meta.title')}</title>
        <meta name="description" content={t('pages.coachTypes.boxing.meta.description')} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Swords className="w-3 h-3 mr-1" /> {t('pages.coachTypes.boxing.hero.badge')}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                {t('pages.coachTypes.boxing.hero.titleStart')} <span className="text-gradient-primary">{t('pages.coachTypes.boxing.hero.titleHighlight')}</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                {t('pages.coachTypes.boxing.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=boxing">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('pages.coachTypes.boxing.hero.browseButton')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    {t('pages.coachTypes.boxing.hero.howItWorks')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('pages.coachTypes.boxing.benefits.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('pages.coachTypes.boxing.benefits.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Coaches */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('pages.coachTypes.boxing.featured.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('pages.coachTypes.boxing.featured.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredCoaches.map((coach, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Swords className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{coach.name}</h3>
                        <p className="text-sm text-muted-foreground">{coach.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-foreground font-medium">{coach.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {coach.fights ? t('pages.coachTypes.boxing.featured.stats.fights', { count: coach.fights }) : 
                         coach.clients ? t('pages.coachTypes.boxing.featured.stats.clients', { count: coach.clients }) : 
                         coach.experience}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=boxing">
                <Button variant="outline" size="lg">
                  {t('pages.coachTypes.boxing.featured.viewAll')} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('pages.coachTypes.boxing.faq.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('pages.coachTypes.boxing.faq.description')}
              </p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('pages.coachTypes.boxing.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('pages.coachTypes.boxing.cta.description')}
            </p>
            <Link to="/coaches?type=boxing">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('pages.coachTypes.boxing.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Boxing;