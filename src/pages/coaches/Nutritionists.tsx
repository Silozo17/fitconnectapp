import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Apple, Utensils, Heart, Scale, CheckCircle, ArrowRight, Star, Leaf } from "lucide-react";

const Nutritionists = () => {
  const benefits = [
    {
      icon: Utensils,
      title: "Custom Meal Plans",
      description: "Personalised nutrition plans designed around your goals, preferences, and dietary requirements.",
    },
    {
      icon: Scale,
      title: "Weight Management",
      description: "Science-based approaches to achieve and maintain your ideal weight sustainably.",
    },
    {
      icon: Heart,
      title: "Health Optimisation",
      description: "Improve energy, sleep, digestion, and overall wellbeing through proper nutrition.",
    },
    {
      icon: Leaf,
      title: "Dietary Support",
      description: "Expert guidance for special diets including vegan, keto, gluten-free, and more.",
    },
  ];

  const faqs = [
    {
      question: "What's the difference between a nutritionist and a dietitian?",
      answer: "Both can provide excellent nutrition advice. Dietitians have protected titles and specific clinical qualifications. Nutritionists may have various certifications and often specialise in wellness, sports nutrition, or weight management.",
    },
    {
      question: "How can a nutritionist help me lose weight?",
      answer: "A nutritionist creates a sustainable, personalised eating plan based on your metabolism, lifestyle, and preferences. They help you understand portion sizes, meal timing, and make healthy choices without extreme restriction.",
    },
    {
      question: "Do I need to follow a strict diet?",
      answer: "No! Good nutrition coaching focuses on sustainable habits, not restrictive diets. Your nutritionist will work with your food preferences to create an enjoyable eating plan.",
    },
    {
      question: "Can nutritionists help with medical conditions?",
      answer: "Many nutritionists specialise in conditions like diabetes, digestive issues, and food intolerances. Always check your nutritionist's qualifications and consult your doctor for medical nutrition therapy.",
    },
    {
      question: "How often should I meet with my nutritionist?",
      answer: "Most clients start with weekly check-ins, then move to bi-weekly or monthly as they establish healthy habits. Your nutritionist will recommend the best frequency for your goals.",
    },
  ];

  const featuredNutritionists = [
    { name: "Sophie Anderson", specialty: "Weight Loss", rating: 4.9, clients: 200 },
    { name: "Dr. Emma Roberts", specialty: "Sports Nutrition", rating: 4.8, clients: 180 },
    { name: "Lisa Thompson", specialty: "Plant-Based", rating: 4.9, clients: 150 },
  ];

  return (
    <>
      <Helmet>
        <title>Nutritionists | FitConnect - Expert Nutrition Coaching</title>
        <meta name="description" content="Find qualified nutritionists on FitConnect. Get personalised meal plans, expert dietary advice, and achieve your health goals with professional nutrition coaching." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Apple className="w-3 h-3 mr-1" /> Nutrition Coaching
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Expert <span className="text-gradient-primary">Nutrition Coaching</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Work with qualified nutritionists who create personalised meal plans, help you build healthy habits, and guide you towards optimal health and performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=nutritionist">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Nutritionists <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline">
                    How It Works
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
                Why Work with a Nutritionist?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Proper nutrition is the foundation of health, energy, and performance. Get expert guidance tailored to you.
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
                Top-Rated Nutritionists
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover highly-rated nutrition experts ready to help you eat better.
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
                      <span className="text-muted-foreground">{nutritionist.clients}+ clients</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=nutritionist">
                <Button variant="outline" size="lg">
                  View All Nutritionists <ArrowRight className="ml-2 w-5 h-5" />
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
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about nutrition coaching.
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
              Ready to Transform Your Diet?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with a nutritionist today and start eating for your goals.
            </p>
            <Link to="/coaches?type=nutritionist">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find Your Nutritionist <ArrowRight className="ml-2 w-5 h-5" />
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
