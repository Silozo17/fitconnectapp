import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Apple, Utensils, Heart, Scale, CheckCircle, ArrowRight, Star, Leaf } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEOHead, createFAQPageSchema, createServiceSchema, createBreadcrumbSchema } from "@/components/shared/SEOHead";

const Nutritionists = () => {
  const { t } = useTranslation('pages');

  const benefits = [
    {
      icon: Utensils,
      title: t('coachTypes.nutritionists.benefits.mealPlans.title'),
      description: t('coachTypes.nutritionists.benefits.mealPlans.description'),
    },
    {
      icon: Scale,
      title: t('coachTypes.nutritionists.benefits.weight.title'),
      description: t('coachTypes.nutritionists.benefits.weight.description'),
    },
    {
      icon: Heart,
      title: t('coachTypes.nutritionists.benefits.health.title'),
      description: t('coachTypes.nutritionists.benefits.health.description'),
    },
    {
      icon: Leaf,
      title: t('coachTypes.nutritionists.benefits.dietary.title'),
      description: t('coachTypes.nutritionists.benefits.dietary.description'),
    },
  ];

  const faqs = [
    {
      question: t('coachTypes.nutritionists.faq.difference.question'),
      answer: t('coachTypes.nutritionists.faq.difference.answer'),
    },
    {
      question: t('coachTypes.nutritionists.faq.weightLoss.question'),
      answer: t('coachTypes.nutritionists.faq.weightLoss.answer'),
    },
    {
      question: t('coachTypes.nutritionists.faq.strictDiet.question'),
      answer: t('coachTypes.nutritionists.faq.strictDiet.answer'),
    },
    {
      question: t('coachTypes.nutritionists.faq.medical.question'),
      answer: t('coachTypes.nutritionists.faq.medical.answer'),
    },
    {
      question: t('coachTypes.nutritionists.faq.frequency.question'),
      answer: t('coachTypes.nutritionists.faq.frequency.answer'),
    },
  ];

  const featuredNutritionists = [
    { name: "Sophie Anderson", specialty: t('coachTypes.nutritionists.featured.specialties.weightLoss'), rating: 4.9, clients: 200 },
    { name: "Dr. Emma Roberts", specialty: t('coachTypes.nutritionists.featured.specialties.sports'), rating: 4.8, clients: 180 },
    { name: "Lisa Thompson", specialty: t('coachTypes.nutritionists.featured.specialties.plantBased'), rating: 4.9, clients: 150 },
  ];

  const faqSchema = createFAQPageSchema(faqs);
  const serviceSchema = createServiceSchema({
    name: "Nutrition Coaching Services",
    description: "Find certified nutritionists and nutrition coaches for meal planning, macro coaching, weight management, and dietary guidance. Book consultations with registered nutritionists across the UK.",
    url: "/coaches/nutritionists",
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Coaches", url: "/coaches" },
    { name: "Nutritionists", url: "/coaches/nutritionists" },
  ]);

  return (
    <>
      <SEOHead
        title="Find Nutritionists Near Me | Nutrition Coaches & Dietitians UK"
        description="Find and book certified nutritionists near you. Get personalized meal plans, macro coaching, weight management guidance, and dietary advice. Online and in-person nutrition consultations available across the UK."
        canonicalPath="/coaches/nutritionists"
        keywords={[
          "nutritionist near me",
          "nutritionist UK",
          "nutrition coach",
          "online nutritionist UK",
          "dietitian near me",
          "meal planning UK",
          "macro coaching",
          "weight loss nutritionist",
          "sports nutritionist UK",
          "registered dietitian",
          "nutrition consultant London",
          "nutrition coach Manchester",
        ]}
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
                <Apple className="w-3 h-3 mr-1" /> {t('coachTypes.nutritionists.hero.badge')}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                {t('coachTypes.nutritionists.hero.titleStart')} <span className="text-gradient-primary">{t('coachTypes.nutritionists.hero.titleHighlight')}</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                {t('coachTypes.nutritionists.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=nutritionist">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t('coachTypes.nutritionists.hero.browseButton')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    {t('coachTypes.nutritionists.hero.howItWorks')}
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
                {t('coachTypes.nutritionists.benefits.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.nutritionists.benefits.description')}
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

        {/* Featured Nutritionists */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('coachTypes.nutritionists.featured.title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('coachTypes.nutritionists.featured.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredNutritionists.map((nutritionist, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Apple className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{nutritionist.name}</h3>
                        <p className="text-sm text-muted-foreground">{nutritionist.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-foreground font-medium">{nutritionist.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{t('coachTypes.nutritionists.featured.stats.clients', { count: nutritionist.clients })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=nutritionist">
                <Button variant="outline" size="lg">
                  {t('coachTypes.nutritionists.featured.viewAll')} <ArrowRight className="ml-2 w-5 h-5" />
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
                {t('coachTypes.nutritionists.faq.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('coachTypes.nutritionists.faq.description')}
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
              {t('coachTypes.nutritionists.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('coachTypes.nutritionists.cta.description')}
            </p>
            <Link to="/coaches?type=nutritionist">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('coachTypes.nutritionists.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Nutritionists;
