import { useMemo } from "react";
import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { usePlatformContact } from "@/hooks/usePlatformContact";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const FAQ = () => {
  const { contact } = usePlatformContact();
  const { t } = useTranslation("pages");

  const clientFAQs = [
    {
      question: t("faq.client.findCoach.question"),
      answer: t("faq.client.findCoach.answer")
    },
    {
      question: t("faq.client.coachTypes.question"),
      answer: t("faq.client.coachTypes.answer")
    },
    {
      question: t("faq.client.cost.question"),
      answer: t("faq.client.cost.answer")
    },
    {
      question: t("faq.client.cancel.question"),
      answer: t("faq.client.cancel.answer")
    },
    {
      question: t("faq.client.trial.question"),
      answer: t("faq.client.trial.answer")
    },
    {
      question: t("faq.client.online.question"),
      answer: t("faq.client.online.answer")
    },
    {
      question: t("faq.client.satisfaction.question"),
      answer: t("faq.client.satisfaction.answer")
    },
    {
      question: t("faq.client.plans.question"),
      answer: t("faq.client.plans.answer")
    }
  ];

  const coachFAQs = [
    {
      question: t("faq.coach.become.question"),
      answer: t("faq.coach.become.answer")
    },
    {
      question: t("faq.coach.requirements.question"),
      answer: t("faq.coach.requirements.answer")
    },
    {
      question: t("faq.coach.payment.question"),
      answer: t("faq.coach.payment.answer")
    },
    {
      question: t("faq.coach.rates.question"),
      answer: t("faq.coach.rates.answer")
    },
    {
      question: t("faq.coach.tools.question"),
      answer: t("faq.coach.tools.answer")
    },
    {
      question: t("faq.coach.fees.question"),
      answer: t("faq.coach.fees.answer")
    },
    {
      question: t("faq.coach.clients.question"),
      answer: t("faq.coach.clients.answer")
    },
    {
      question: t("faq.coach.hybrid.question"),
      answer: t("faq.coach.hybrid.answer")
    }
  ];

  const generalFAQs = [
    {
      question: t("faq.general.security.question"),
      answer: t("faq.general.security.answer")
    },
    {
      question: t("faq.general.payment.question"),
      answer: t("faq.general.payment.answer")
    },
    {
      question: t("faq.general.support.question"),
      answer: t("faq.general.support.answer", { email: contact.email })
    },
    {
      question: t("faq.general.refunds.question"),
      answer: t("faq.general.refunds.answer")
    },
    {
      question: t("faq.general.availability.question"),
      answer: t("faq.general.availability.answer")
    },
    {
      question: t("faq.general.corporate.question"),
      answer: t("faq.general.corporate.answer", { email: contact.email })
    }
  ];

  // Generate FAQPage schema for structured data
  const faqSchema = useMemo(() => {
    const allFaqs = [...clientFAQs, ...coachFAQs, ...generalFAQs];
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [clientFAQs, coachFAQs, generalFAQs]);

  return (
    <PageLayout
      title={t("faq.meta.title")}
      description={t("faq.meta.description")}
    >
      {/* FAQPage Schema for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* Decorative Avatar */}
      <DecorativeAvatar 
        avatarSlug="yoga-wolf" 
        position="bottom-right" 
        size="lg" 
        opacity={15}
        className="right-8 bottom-40 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            {t("faq.hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("faq.hero.titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("faq.hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("faq.hero.description")}
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
                  {t("faq.tabs.clients")}
                </TabsTrigger>
                <TabsTrigger value="coaches" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t("faq.tabs.coaches")}
                </TabsTrigger>
                <TabsTrigger value="general" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t("faq.tabs.general")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {clientFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`client-${index}`}
                      className="glass-item rounded-2xl px-6 data-[state=open]:shadow-soft"
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
                      className="glass-item rounded-2xl px-6 data-[state=open]:shadow-soft"
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
                      className="glass-item rounded-2xl px-6 data-[state=open]:shadow-soft"
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
            <h2 className="text-3xl font-bold mb-4">{t("faq.cta.title")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("faq.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`mailto:${contact.email}`}>
                <GradientButton size="lg">{t("faq.cta.contactSupport")}</GradientButton>
              </a>
              <Link to="/how-it-works">
                <GradientButton size="lg" variant="outline">{t("faq.cta.howItWorks")}</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
