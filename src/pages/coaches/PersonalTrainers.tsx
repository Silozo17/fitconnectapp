import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dumbbell, Target, TrendingUp, Users, CheckCircle, ArrowRight, Star } from "lucide-react";

const PersonalTrainers = () => {
  const benefits = [
    {
      icon: Target,
      title: "Personalised Programs",
      description: "Custom workout plans designed specifically for your goals, fitness level, and schedule.",
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your improvements with detailed tracking and regular assessments.",
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Work with certified professionals who keep you motivated and accountable.",
    },
    {
      icon: CheckCircle,
      title: "Flexible Training",
      description: "Train online or in-person, at your convenience with flexible scheduling.",
    },
  ];

  const faqs = [
    {
      question: "How do I choose the right personal trainer?",
      answer: "Look at their certifications, experience, specialisations, and reviews from other clients. Our platform lets you filter trainers by expertise, location, and price range to find your perfect match.",
    },
    {
      question: "How much does personal training cost?",
      answer: "Prices vary depending on the trainer's experience and location. On FitConnect, you'll find trainers ranging from £30 to £150+ per session, with package discounts often available.",
    },
    {
      question: "Can I train online with a personal trainer?",
      answer: "Yes! Many of our personal trainers offer online coaching via video calls, custom workout plans, and messaging support. This is a flexible and often more affordable option.",
    },
    {
      question: "How often should I train with a personal trainer?",
      answer: "Most clients start with 2-3 sessions per week. Your trainer will recommend the optimal frequency based on your goals and current fitness level.",
    },
    {
      question: "What should I expect in my first session?",
      answer: "Your first session typically includes a fitness assessment, goal setting discussion, and introduction to basic exercises. Your trainer will create a baseline to track your progress.",
    },
  ];

  const featuredTrainers = [
    { name: "James Wilson", specialty: "Weight Loss", rating: 4.9, sessions: 500 },
    { name: "Sarah Chen", specialty: "Strength Training", rating: 4.8, sessions: 350 },
    { name: "Mike Johnson", specialty: "Functional Fitness", rating: 4.9, sessions: 420 },
  ];

  return (
    <>
      <Helmet>
        <title>Personal Trainers | FitConnect - Find Your Perfect PT</title>
        <meta name="description" content="Find certified personal trainers on FitConnect. Get customised workout plans, expert guidance, and achieve your fitness goals with professional support." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Dumbbell className="w-3 h-3 mr-1" /> Personal Training
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Find Your Perfect <span className="text-gradient-primary">Personal Trainer</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Work with certified personal trainers who create customised workout programs, keep you accountable, and help you achieve results faster than training alone.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/coaches?type=personal-trainer">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Personal Trainers <ArrowRight className="ml-2 w-5 h-5" />
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
                Why Work with a Personal Trainer?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Personal training is the fastest way to reach your fitness goals with expert guidance every step of the way.
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
                Top-Rated Personal Trainers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover highly-rated personal trainers ready to help you transform.
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
                      <span className="text-muted-foreground">{trainer.sessions}+ sessions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Link to="/coaches?type=personal-trainer">
                <Button variant="outline" size="lg">
                  View All Personal Trainers <ArrowRight className="ml-2 w-5 h-5" />
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
                Everything you need to know about personal training.
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
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with a personal trainer today and take the first step towards your goals.
            </p>
            <Link to="/coaches?type=personal-trainer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find Your Trainer <ArrowRight className="ml-2 w-5 h-5" />
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
