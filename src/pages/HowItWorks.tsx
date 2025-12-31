import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Search, Calendar, Video, TrendingUp, 
  FileText, Shield, CheckCircle, Users,
  MessageSquare, Star, Zap, Award
} from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation("pages");

  const clientSteps = [
    {
      step: "01",
      icon: Search,
      title: t("howItWorks.clientSteps.step1.title"),
      description: t("howItWorks.clientSteps.step1.description"),
      details: [
        t("howItWorks.clientSteps.step1.detail1"),
        t("howItWorks.clientSteps.step1.detail2"),
        t("howItWorks.clientSteps.step1.detail3"),
        t("howItWorks.clientSteps.step1.detail4")
      ]
    },
    {
      step: "02",
      icon: MessageSquare,
      title: t("howItWorks.clientSteps.step2.title"),
      description: t("howItWorks.clientSteps.step2.description"),
      details: [
        t("howItWorks.clientSteps.step2.detail1"),
        t("howItWorks.clientSteps.step2.detail2"),
        t("howItWorks.clientSteps.step2.detail3"),
        t("howItWorks.clientSteps.step2.detail4")
      ]
    },
    {
      step: "03",
      icon: Calendar,
      title: t("howItWorks.clientSteps.step3.title"),
      description: t("howItWorks.clientSteps.step3.description"),
      details: [
        t("howItWorks.clientSteps.step3.detail1"),
        t("howItWorks.clientSteps.step3.detail2"),
        t("howItWorks.clientSteps.step3.detail3"),
        t("howItWorks.clientSteps.step3.detail4")
      ]
    },
    {
      step: "04",
      icon: TrendingUp,
      title: t("howItWorks.clientSteps.step4.title"),
      description: t("howItWorks.clientSteps.step4.description"),
      details: [
        t("howItWorks.clientSteps.step4.detail1"),
        t("howItWorks.clientSteps.step4.detail2"),
        t("howItWorks.clientSteps.step4.detail3"),
        t("howItWorks.clientSteps.step4.detail4")
      ]
    }
  ];

  const coachSteps = [
    {
      step: "01",
      icon: FileText,
      title: t("howItWorks.coachSteps.step1.title"),
      description: t("howItWorks.coachSteps.step1.description"),
      details: [
        t("howItWorks.coachSteps.step1.detail1"),
        t("howItWorks.coachSteps.step1.detail2"),
        t("howItWorks.coachSteps.step1.detail3"),
        t("howItWorks.coachSteps.step1.detail4")
      ]
    },
    {
      step: "02",
      icon: Users,
      title: t("howItWorks.coachSteps.step2.title"),
      description: t("howItWorks.coachSteps.step2.description"),
      details: [
        t("howItWorks.coachSteps.step2.detail1"),
        t("howItWorks.coachSteps.step2.detail2"),
        t("howItWorks.coachSteps.step2.detail3"),
        t("howItWorks.coachSteps.step2.detail4")
      ]
    },
    {
      step: "03",
      icon: Zap,
      title: t("howItWorks.coachSteps.step3.title"),
      description: t("howItWorks.coachSteps.step3.description"),
      details: [
        t("howItWorks.coachSteps.step3.detail1"),
        t("howItWorks.coachSteps.step3.detail2"),
        t("howItWorks.coachSteps.step3.detail3"),
        t("howItWorks.coachSteps.step3.detail4")
      ]
    },
    {
      step: "04",
      icon: Award,
      title: t("howItWorks.coachSteps.step4.title"),
      description: t("howItWorks.coachSteps.step4.description"),
      details: [
        t("howItWorks.coachSteps.step4.detail1"),
        t("howItWorks.coachSteps.step4.detail2"),
        t("howItWorks.coachSteps.step4.detail3"),
        t("howItWorks.coachSteps.step4.detail4")
      ]
    }
  ];

  const features = [
    {
      icon: Video,
      title: t("howItWorks.features.hdVideo"),
      description: t("howItWorks.features.hdVideoDesc")
    },
    {
      icon: MessageSquare,
      title: t("howItWorks.features.secureMessaging"),
      description: t("howItWorks.features.secureMessagingDesc")
    },
    {
      icon: Calendar,
      title: t("howItWorks.features.smartScheduling"),
      description: t("howItWorks.features.smartSchedulingDesc")
    },
    {
      icon: TrendingUp,
      title: t("howItWorks.features.progressTracking"),
      description: t("howItWorks.features.progressTrackingDesc")
    },
    {
      icon: FileText,
      title: t("howItWorks.features.customPlans"),
      description: t("howItWorks.features.customPlansDesc")
    },
    {
      icon: Shield,
      title: t("howItWorks.features.safeSecurity"),
      description: t("howItWorks.features.safeSecurityDesc")
    }
  ];

  return (
    <PageLayout
      title={t("howItWorks.title")}
      description={t("howItWorks.metaDescription")}
    >
      {/* Decorative Avatars */}
      <DecorativeAvatar 
        avatarSlug="crossfit-wolf" 
        position="top-right" 
        size="lg" 
        opacity={18}
        className="right-8 top-40 z-0"
      />
      <DecorativeAvatar 
        avatarSlug="martial-arts-crane" 
        position="bottom-left" 
        size="md" 
        opacity={15}
        className="left-8 bottom-32 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            {t("howItWorks.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("howItWorks.hero.title")}{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("howItWorks.hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("howItWorks.hero.description")}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="clients" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="h-auto p-1 bg-muted/50">
                <TabsTrigger value="clients" className="px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t("howItWorks.tabs.lookingForCoach")}
                </TabsTrigger>
                <TabsTrigger value="coaches" className="px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t("howItWorks.tabs.imACoach")}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="clients">
              <div className="space-y-12 max-w-5xl mx-auto">
                {clientSteps.map((step, index) => (
                  <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary/30 to-secondary/30 bg-clip-text text-transparent">
                          {step.step}
                        </span>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <Card variant="glass" className="aspect-square flex items-center justify-center">
                        <step.icon className="w-24 h-24 text-primary/30" />
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link to="/coaches">
                  <GradientButton size="lg">{t("howItWorks.findYourCoachNow")}</GradientButton>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="coaches">
              <div className="space-y-12 max-w-5xl mx-auto">
                {coachSteps.map((step, index) => (
                  <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary/30 to-secondary/30 bg-clip-text text-transparent">
                          {step.step}
                        </span>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <Card variant="glass" className="aspect-square flex items-center justify-center">
                        <step.icon className="w-24 h-24 text-primary/30" />
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link to="/for-coaches">
                  <GradientButton size="lg">{t("howItWorks.startYourApplication")}</GradientButton>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("howItWorks.features.title")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("howItWorks.features.titleHighlight")}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("howItWorks.features.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} variant="glass" className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium mb-6 italic">
              "{t("howItWorks.testimonial.quote")}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}{t("howItWorks.testimonial.quoteHighlight")}
              </span>"
            </blockquote>
            <div>
              <p className="font-semibold">{t("howItWorks.testimonial.author")}</p>
              <p className="text-muted-foreground">{t("howItWorks.testimonial.result")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("howItWorks.cta.title")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("howItWorks.cta.titleHighlight")}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("howItWorks.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/coaches">
              <GradientButton size="lg">{t("howItWorks.cta.findACoach")}</GradientButton>
            </Link>
            <Link to="/for-coaches">
              <GradientButton size="lg" variant="outline">{t("howItWorks.cta.becomeACoach")}</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
