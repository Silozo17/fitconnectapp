import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Flame, Target, Zap, Shield, Users, ArrowRight, Star } from "lucide-react";

const MMA = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Complete Combat System",
      description: "Learn striking, wrestling, and ground fighting in one comprehensive training program.",
    },
    {
      icon: Target,
      title: "Elite Conditioning",
      description: "Build functional strength, explosive power, and combat-ready endurance.",
    },
    {
      icon: Shield,
      title: "Real Self-Defence",
      description: "Develop practical skills for any situation with complete martial arts training.",
    },
    {
      icon: Users,
      title: "Expert Coaches",
      description: "Train with coaches who have real competitive experience and proven teaching methods.",
    },
  ];

  const disciplines = [
    { name: "Brazilian Jiu-Jitsu", description: "Ground fighting & submissions" },
    { name: "Muay Thai", description: "Striking with hands, elbows, knees & kicks" },
    { name: "Wrestling", description: "Takedowns & control" },
    { name: "Boxing", description: "Fundamental striking" },
  ];

  const faqs = [
    {
      question: "Do I need martial arts experience to start MMA?",
      answer: "Not at all! Many of our coaches specialise in beginner programs. You'll learn fundamentals safely and progress at your own pace. No prior experience is necessary.",
    },
    {
      question: "What does MMA training involve?",
      answer: "MMA training combines multiple disciplines including striking (boxing, Muay Thai), wrestling, and grappling (Brazilian Jiu-Jitsu). Your coach will create a well-rounded program based on your goals.",
    },
    {
      question: "Is MMA training dangerous?",
      answer: "With proper coaching, MMA training is very safe. Beginners focus on technique, conditioning, and controlled drilling. Sparring is optional and only introduced when you're ready.",
    },
    {
      question: "Can MMA help with fitness and weight loss?",
      answer: "Absolutely! MMA provides an incredible full-body workout. Many people train MMA purely for fitness, burning 700-1000 calories per session while building functional strength.",
    },
    {
      question: "Do I need to compete to train MMA?",
      answer: "No! Most MMA practitioners train for fitness, self-defence, or personal development without ever competing. Your coach will support whatever goals you have.",
    },
  ];

  const featuredCoaches = [
    { name: "Carlos Silva", specialty: "BJJ & MMA", rating: 4.9, fights: 25 },
    { name: "Amanda Torres", specialty: "Striking Coach", rating: 4.8, experience: "Pro MMA Fighter" },
    { name: "Jake Morrison", specialty: "Wrestling & MMA", rating: 4.9, clients: 200 },
  ];

  return (
    <>
      <Helmet>
        <title>MMA Coaches | FitConnect - Mixed Martial Arts Training</title>
        <meta name="description" content="Find expert MMA coaches on FitConnect. Learn mixed martial arts including BJJ, Muay Thai, wrestling, and more from experienced fighters and coaches." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Flame className="w-3 h-3 mr-1" /> Mixed Martial Arts
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Train <span className="text-gradient-primary">MMA</span> with the Best
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Learn mixed martial arts from experienced fighters and coaches. Master multiple disciplines, build elite conditioning, and develop complete fighting skills.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=mma">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse MMA Coaches <ArrowRight className="ml-2 w-5 h-5" />
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

        {/* Disciplines Section */}
        <section className="py-12 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold mb-2">Disciplines You'll Learn</h2>
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
                Why Train MMA?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MMA offers the most complete martial arts training available, combining multiple disciplines for real-world effectiveness.
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
                Top-Rated MMA Coaches
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Train with coaches who have real fighting experience.
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
                        {coach.fights ? `${coach.fights} pro fights` : 
                         coach.clients ? `${coach.clients}+ clients` : 
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
                  View All MMA Coaches <ArrowRight className="ml-2 w-5 h-5" />
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
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about MMA training.
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
              Ready to Train Like a Fighter?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with an MMA coach today and begin your martial arts journey.
            </p>
            <Link to="/coaches?type=mma">
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

export default MMA;
