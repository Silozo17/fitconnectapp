import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Swords, Target, Zap, Shield, Heart, ArrowRight, Star } from "lucide-react";

const Boxing = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Full-Body Workout",
      description: "Boxing engages every muscle group, burning up to 800 calories per session.",
    },
    {
      icon: Target,
      title: "Learn Real Skills",
      description: "Master proper technique from footwork to combinations with expert coaching.",
    },
    {
      icon: Shield,
      title: "Self-Defence",
      description: "Gain confidence and practical self-defence skills that last a lifetime.",
    },
    {
      icon: Heart,
      title: "Stress Relief",
      description: "Release tension and boost mental clarity through focused training.",
    },
  ];

  const faqs = [
    {
      question: "Do I need any experience to start boxing?",
      answer: "Absolutely not! Our coaches work with complete beginners through to competitive boxers. You'll learn at your own pace with proper technique from day one.",
    },
    {
      question: "What equipment do I need?",
      answer: "For your first session, just wear comfortable workout clothes and trainers. Your coach will provide gloves and pads. As you progress, you may want to invest in your own gloves and wraps.",
    },
    {
      question: "Is boxing safe?",
      answer: "Yes! With proper coaching, boxing is very safe. Beginners focus on technique, pad work, and fitness rather than sparring. Your coach will ensure you progress safely.",
    },
    {
      question: "Will boxing help me lose weight?",
      answer: "Boxing is one of the most effective workouts for weight loss and conditioning. Expect to burn 500-800 calories per session while building lean muscle.",
    },
    {
      question: "How quickly will I see results?",
      answer: "Most people notice improved fitness and coordination within 2-4 weeks. Noticeable body composition changes typically occur within 6-8 weeks of consistent training.",
    },
  ];

  const featuredCoaches = [
    { name: "Mike Rodriguez", specialty: "Amateur Boxing", rating: 4.9, fights: 50 },
    { name: "Tommy Williams", specialty: "Fitness Boxing", rating: 4.8, clients: 300 },
    { name: "Sarah Jones", specialty: "Women's Boxing", rating: 4.9, experience: "15 years" },
  ];

  return (
    <>
      <Helmet>
        <title>Boxing Coaches | FitConnect - Learn Boxing with Experts</title>
        <meta name="description" content="Find expert boxing coaches on FitConnect. Learn proper technique, improve fitness, and train with professionals from beginner to competitive level." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Swords className="w-3 h-3 mr-1" /> Boxing Training
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Learn to Box with <span className="text-gradient-primary">Expert Coaches</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Train with experienced boxing coaches who teach proper technique, build your fitness, and help you achieve your goals—whether that's fitness, competition, or self-defence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=boxing">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Boxing Coaches <ArrowRight className="ml-2 w-5 h-5" />
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
                Why Train Boxing?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Boxing offers incredible physical and mental benefits for people of all fitness levels.
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
                Top-Rated Boxing Coaches
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Train with experienced boxing coaches who know how to get results.
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
                        {coach.fights ? `${coach.fights} fights coached` : 
                         coach.clients ? `${coach.clients}+ clients` : 
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
                  View All Boxing Coaches <ArrowRight className="ml-2 w-5 h-5" />
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
                Everything you need to know about boxing training.
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
              Ready to Step in the Ring?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with a boxing coach today and start your journey.
            </p>
            <Link to="/coaches?type=boxing">
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

export default Boxing;
