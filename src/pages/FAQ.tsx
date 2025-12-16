import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const FAQ = () => {
  const clientFAQs = [
    {
      question: "How do I find the right coach for me?",
      answer: "Our smart matching system helps you find coaches based on your goals, budget, location, and preferred training style. Browse coach profiles, read reviews, and book a free discovery call to ensure it's a great fit before committing."
    },
    {
      question: "What types of coaches are available on FitConnect?",
      answer: "We offer a diverse range of certified professionals including Personal Trainers, Nutritionists & Dietitians, Boxing Coaches, MMA Trainers, Yoga Instructors, and Strength & Conditioning Specialists. Each coach is verified and brings unique expertise to help you reach your goals."
    },
    {
      question: "How much does coaching cost?",
      answer: "Coaching rates vary based on the coach's experience, specialty, and session type. Rates typically range from $30-$200+ per session. You can filter coaches by price range and many offer package discounts for multiple sessions."
    },
    {
      question: "Can I cancel or reschedule sessions?",
      answer: "Yes! You can reschedule or cancel sessions up to 24 hours before the scheduled time at no charge. Cancellations within 24 hours may be subject to the coach's cancellation policy, which is displayed on their profile."
    },
    {
      question: "Is there a free trial or introductory session?",
      answer: "Many coaches offer a free 15-minute discovery call to discuss your goals and see if you're a good match. Look for the 'Free Consultation' badge on coach profiles, or message coaches directly to inquire."
    },
    {
      question: "How do online sessions work?",
      answer: "Online sessions are conducted through our integrated video platform. Simply log in at your scheduled time, and you'll be connected with your coach. You can train from home, your gym, or anywhere with a stable internet connection."
    },
    {
      question: "What if I'm not satisfied with my coach?",
      answer: "Your satisfaction is our priority. If you're not happy after your first session, contact our support team within 48 hours for a full refund. We'll also help match you with a different coach who better fits your needs."
    },
    {
      question: "Do coaches create personalized workout/meal plans?",
      answer: "Yes! Most coaches create customized plans based on your goals, preferences, and any limitations. The level of customization depends on the package you choose—discuss specifics with your coach during the discovery call."
    }
  ];

  const coachFAQs = [
    {
      question: "How do I become a coach on FitConnect?",
      answer: "Click 'Become a Coach' and complete our application. You'll need to submit your certifications, experience details, and complete a brief interview. Once approved, you can set up your profile and start accepting clients."
    },
    {
      question: "What are the requirements to join as a coach?",
      answer: "We require: (1) Valid certification from an accredited organization in your specialty, (2) Minimum 2 years of professional coaching experience, (3) Passing a background check, (4) Professional liability insurance. Additional certifications strengthen your profile."
    },
    {
      question: "How and when do I get paid?",
      answer: "Payments are processed automatically after each completed session. Funds are transferred to your connected bank account within 3-5 business days. You can track all earnings and pending payments in your coach dashboard."
    },
    {
      question: "Can I set my own rates and schedule?",
      answer: "Absolutely! You have full control over your hourly rates, package pricing, and availability. Set your schedule, block off vacation time, and adjust rates anytime through your dashboard."
    },
    {
      question: "What tools does FitConnect provide for coaches?",
      answer: "Our platform includes: client management dashboard, scheduling & calendar integration, secure messaging, video session hosting, progress tracking tools, workout/meal plan builders, payment processing, and marketing visibility."
    },
    {
      question: "How much does FitConnect charge coaches?",
      answer: "We charge a 15% platform fee on each session. This covers payment processing, platform maintenance, marketing, and support. There are no upfront costs or monthly fees—you only pay when you earn."
    },
    {
      question: "How do I get more clients on the platform?",
      answer: "Complete your profile with photos and detailed descriptions, respond quickly to inquiries, collect reviews from clients, and maintain a high rating. Featured placement is available for top-performing coaches."
    },
    {
      question: "Can I coach both online and in-person?",
      answer: "Yes! You can offer online sessions, in-person sessions, or both. Simply indicate your preferences in your profile settings and specify your in-person service area."
    }
  ];

  const generalFAQs = [
    {
      question: "Is my personal information secure?",
      answer: "Yes, security is our top priority. We use bank-level encryption (256-bit SSL) to protect all data. Payment information is handled by Stripe, a PCI-compliant payment processor. We never share your personal information with third parties."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards (Visa, Mastercard, American Express, Discover), Apple Pay, Google Pay, and bank transfers in select regions. All payments are processed securely through Stripe."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our support team via email at support@fitconnect.com, through the in-app chat, or by phone during business hours (9 AM - 6 PM EST). We typically respond to inquiries within 24 hours."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a satisfaction guarantee. If you're unsatisfied with your first session with a new coach, contact us within 48 hours for a full refund. Package refunds are prorated based on unused sessions."
    },
    {
      question: "Is FitConnect available in my area?",
      answer: "FitConnect is available worldwide for online coaching! For in-person sessions, availability depends on coaches in your area. Enter your location in the search to see local coaches, or choose online coaching for maximum flexibility."
    },
    {
      question: "Can I use FitConnect for corporate wellness programs?",
      answer: "Yes! We offer corporate packages for businesses looking to provide fitness coaching as an employee benefit. Contact our enterprise team at enterprise@fitconnect.com for custom solutions and volume pricing."
    }
  ];

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about FitConnect. Learn about finding coaches, pricing, payments, and how our fitness coaching platform works."
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Help Center
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about FitConnect. Can't find what you're looking for? 
            Reach out to our friendly support team.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-muted/50">
                <TabsTrigger value="clients" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  For Clients
                </TabsTrigger>
                <TabsTrigger value="coaches" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  For Coaches
                </TabsTrigger>
                <TabsTrigger value="general" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  General
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {clientFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`client-${index}`}
                      className="border border-border/50 rounded-2xl px-6 bg-card/50 backdrop-blur-sm data-[state=open]:shadow-soft"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="coaches">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {coachFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`coach-${index}`}
                      className="border border-border/50 rounded-2xl px-6 bg-card/50 backdrop-blur-sm data-[state=open]:shadow-soft"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="general">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {generalFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`general-${index}`}
                      className="border border-border/50 rounded-2xl px-6 bg-card/50 backdrop-blur-sm data-[state=open]:shadow-soft"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our friendly support team is here to help you with anything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:support@fitconnect.com">
                <GradientButton size="lg">Contact Support</GradientButton>
              </a>
              <Link to="/how-it-works">
                <GradientButton size="lg" variant="outline">Learn How It Works</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
