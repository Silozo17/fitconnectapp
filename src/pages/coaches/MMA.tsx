import { Link } from "react-router-dom";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Flame, Target, Zap, Shield, Users, ArrowRight, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const MMA = () => {
  const { t } = useTranslation('pages');

  const benefits = [
    {
      icon: Zap,
      title: t('coachTypes.mma.benefits.combat.title'),
      description: t('coachTypes.mma.benefits.combat.description'),
    },
    {
      icon: Target,
      title: t('coachTypes.mma.benefits.conditioning.title'),
      description: t('coachTypes.mma.benefits.conditioning.description'),
    },
    {
      icon: Shield,
      title: t('coachTypes.mma.benefits.selfDefense.title'),
      description: t('coachTypes.mma.benefits.selfDefense.description'),
    },
    {
      icon: Users,
      title: t('coachTypes.mma.benefits.coaches.title'),
      description: t('coachTypes.mma.benefits.coaches.description'),
    },
  ];

  const disciplines = [
    { name: t('coachTypes.mma.disciplines.bjj.name'), description: t('coachTypes.mma.disciplines.bjj.description') },
    { name: t('coachTypes.mma.disciplines.muayThai.name'), description: t('coachTypes.mma.disciplines.muayThai.description') },
    { name: t('coachTypes.mma.disciplines.wrestling.name'), description: t('coachTypes.mma.disciplines.wrestling.description') },
    { name: t('coachTypes.mma.disciplines.boxing.name'), description: t('coachTypes.mma.disciplines.boxing.description') },
  ];

  const faqs = [
    {
      question: t('coachTypes.mma.faq.experience.question'),
      answer: t('coachTypes.mma.faq.experience.answer'),
    },
    {
      question: t('coachTypes.mma.faq.training.question'),
      answer: t('coachTypes.mma.faq.training.answer'),
    },
    {
      question: t('coachTypes.mma.faq.safety.question'),
      answer: t('coachTypes.mma.faq.safety.answer'),
    },
    {
      question: t('coachTypes.mma.faq.fitness.question'),
      answer: t('coachTypes.mma.faq.fitness.answer'),
    },
    {
      question: t('coachTypes.mma.faq.compete.question'),
      answer: t('coachTypes.mma.faq.compete.answer'),
    },
  ];

  const featuredCoaches = [
    { name: "Carlos Silva", specialty: t('coachTypes.mma.featured.specialties.bjj'), rating: 4.9, fights: 25 },
    { name: "Amanda Torres", specialty: t('coachTypes.mma.featured.specialties.striking'), rating: 4.8, experience: t('coachTypes.mma.featured.proFighter') },
    { name: "Jake Morrison", specialty: t('coachTypes.mma.featured.specialties.wrestling'), rating: 4.9, clients: 200 },
  ];

  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Service schema with enhanced details
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "MMA Training",
    "description": "Train MMA with experienced coaches. Learn BJJ, Muay Thai, wrestling and striking for all levels across the UK.",
    "url": "https://getfitconnect.co.uk/coaches/mma",
    "provider": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk"
    },
    "serviceType": "Mixed Martial Arts Training",
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "priceRange": "£40-£100"
  };

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Find Coaches", url: "/coaches" },
    { name: "MMA Coaches", url: "/coaches/mma" }
  ]);

  return (
    <>
      <SEOHead
        title={t('coachTypes.mma.meta.title')}
        description={t('coachTypes.mma.meta.description')}
        canonicalPath="/coaches/mma"
        keywords={["MMA coach near me", "MMA training UK", "learn mixed martial arts", "BJJ training", "Muay Thai coach", "martial arts classes"]}
        schema={[faqSchema, serviceSchema, breadcrumbSchema]}
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Flame className="w-3 h-3 mr-1" /> {t('coachTypes.mma.hero.badge')}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                {t('coachTypes.mma.hero.titleStart')} <span className="text-gradient-primary">{t('coachTypes.mma.hero.titleHighlight')}</span> {t('coachTypes.mma.hero.titleEnd')}
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                {t('coachTypes.mma.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=mma">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('coachTypes.mma.hero.browseButton')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    {t('coachTypes.mma.hero.howItWorks')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disciplines Section */}
        <section className="py-12 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold mb-2">{t('coachTypes.mma.disciplines.title')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {disciplines.map((discipline, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-foreground mb-1">{discipline.name}</h3>
                    <p className="text-xs text-muted-foreground">{discipline.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('coachTypes.mma.benefits.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.mma.benefits.description')}
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
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('coachTypes.mma.featured.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.mma.featured.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredCoaches.map((coach, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Flame className="w-8 h-8 text-primary" />
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
                        {coach.fights ? t('coachTypes.mma.featured.stats.fights', { count: coach.fights }) : 
                         coach.clients ? t('coachTypes.mma.featured.stats.clients', { count: coach.clients }) : 
                         coach.experience}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=mma">
                <Button variant="outline" size="lg">
                  {t('coachTypes.mma.featured.viewAll')} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('coachTypes.mma.faq.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('coachTypes.mma.faq.description')}
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
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('coachTypes.mma.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('coachTypes.mma.cta.description')}
            </p>
            <Link to="/coaches?type=mma">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('coachTypes.mma.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default MMA;
