import { Link } from "react-router-dom";
import { SEOHead } from "@/components/shared/SEOHead";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dumbbell, Target, TrendingUp, Users, CheckCircle, ArrowRight, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const PersonalTrainers = () => {
  const { t } = useTranslation('pages');

  const benefits = [
    {
      icon: Target,
      title: t('coachTypes.personalTrainers.benefits.programs.title'),
      description: t('coachTypes.personalTrainers.benefits.programs.description'),
    },
    {
      icon: TrendingUp,
      title: t('coachTypes.personalTrainers.benefits.progress.title'),
      description: t('coachTypes.personalTrainers.benefits.progress.description'),
    },
    {
      icon: Users,
      title: t('coachTypes.personalTrainers.benefits.guidance.title'),
      description: t('coachTypes.personalTrainers.benefits.guidance.description'),
    },
    {
      icon: CheckCircle,
      title: t('coachTypes.personalTrainers.benefits.flexible.title'),
      description: t('coachTypes.personalTrainers.benefits.flexible.description'),
    },
  ];

  const faqs = [
    {
      question: t('coachTypes.personalTrainers.faq.choose.question'),
      answer: t('coachTypes.personalTrainers.faq.choose.answer'),
    },
    {
      question: t('coachTypes.personalTrainers.faq.cost.question'),
      answer: t('coachTypes.personalTrainers.faq.cost.answer'),
    },
    {
      question: t('coachTypes.personalTrainers.faq.online.question'),
      answer: t('coachTypes.personalTrainers.faq.online.answer'),
    },
    {
      question: t('coachTypes.personalTrainers.faq.frequency.question'),
      answer: t('coachTypes.personalTrainers.faq.frequency.answer'),
    },
    {
      question: t('coachTypes.personalTrainers.faq.firstSession.question'),
      answer: t('coachTypes.personalTrainers.faq.firstSession.answer'),
    },
  ];

  const featuredTrainers = [
    { name: "James Wilson", specialty: t('coachTypes.personalTrainers.featured.specialties.weightLoss'), rating: 4.9, sessions: 500 },
    { name: "Sarah Chen", specialty: t('coachTypes.personalTrainers.featured.specialties.strength'), rating: 4.8, sessions: 350 },
    { name: "Mike Johnson", specialty: t('coachTypes.personalTrainers.featured.specialties.functional'), rating: 4.9, sessions: 420 },
  ];

  // Generate FAQ schema from translated FAQs
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

  // Service schema for personal training
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Personal Training UK",
    "description": "Hire certified personal trainers across the UK. Online and in-person sessions with custom workout plans.",
    "url": "https://getfitconnect.co.uk/coaches/personal-trainers",
    "provider": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk"
    },
    "serviceType": "Personal Training",
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "priceRange": "£40-£100"
  };

  // Breadcrumb schema for navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://getfitconnect.co.uk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Coaches",
        "item": "https://getfitconnect.co.uk/coaches"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Personal Trainers",
        "item": "https://getfitconnect.co.uk/coaches/personal-trainers"
      }
    ]
  };

  return (
    <>
      <SEOHead
        title={t('coachTypes.personalTrainers.meta.title')}
        description={t('coachTypes.personalTrainers.meta.description')}
        canonicalPath="/coaches/personal-trainers"
        keywords={["hire personal trainer UK", "certified PT near me", "book personal trainer", "personal training sessions", "fitness coach UK"]}
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
                <Dumbbell className="w-3 h-3 mr-1" /> {t('coachTypes.personalTrainers.hero.badge')}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                {t('coachTypes.personalTrainers.hero.titleStart')} <span className="text-gradient-primary">{t('coachTypes.personalTrainers.hero.titleHighlight')}</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                {t('coachTypes.personalTrainers.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=personal-trainer">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('coachTypes.personalTrainers.hero.browseButton')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    {t('coachTypes.personalTrainers.hero.howItWorks')}
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
                {t('coachTypes.personalTrainers.benefits.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.personalTrainers.benefits.description')}
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

        {/* Featured Trainers */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('coachTypes.personalTrainers.featured.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.personalTrainers.featured.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredTrainers.map((trainer, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{trainer.name}</h3>
                        <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-foreground font-medium">{trainer.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{t('coachTypes.personalTrainers.featured.stats.sessions', { count: trainer.sessions })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=personal-trainer">
                <Button variant="outline" size="lg">
                  {t('coachTypes.personalTrainers.featured.viewAll')} <ArrowRight className="ml-2 w-5 h-5" />
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
                {t('coachTypes.personalTrainers.faq.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('coachTypes.personalTrainers.faq.description')}
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
              {t('coachTypes.personalTrainers.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('coachTypes.personalTrainers.cta.description')}
            </p>
            <Link to="/coaches?type=personal-trainer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('coachTypes.personalTrainers.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PersonalTrainers;
