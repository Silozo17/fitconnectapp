import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Users, DollarSign, Calendar, BarChart3, Shield, Globe, 
  MessageSquare, Video, FileText, Clock, CheckCircle, Star,
  TrendingUp, Award
} from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { formatStatNumber } from "@/lib/formatStats";
import { useTranslation } from "react-i18next";

const ForCoaches = () => {
  const { data: platformStats, isLoading } = usePlatformStats();
  const { t } = useTranslation("pages");
  const [numberOfClients, setNumberOfClients] = useState(15);
  const [adminHoursPerClient, setAdminHoursPerClient] = useState(2);

  // 70% time saved through platform automation (scheduling, payments, tracking, messaging)
  const weeklyTimeSaved = Math.round(numberOfClients * adminHoursPerClient * 0.7);
  const yearlyTimeSaved = weeklyTimeSaved * 52;

  const benefits = [
    {
      icon: Users,
      title: t("forCoaches.benefits.reach.title"),
      description: t("forCoaches.benefits.reach.description")
    },
    {
      icon: Calendar,
      title: t("forCoaches.benefits.scheduling.title"),
      description: t("forCoaches.benefits.scheduling.description")
    },
    {
      icon: DollarSign,
      title: t("forCoaches.benefits.payments.title"),
      description: t("forCoaches.benefits.payments.description")
    },
    {
      icon: BarChart3,
      title: t("forCoaches.benefits.management.title"),
      description: t("forCoaches.benefits.management.description")
    },
    {
      icon: Globe,
      title: t("forCoaches.benefits.global.title"),
      description: t("forCoaches.benefits.global.description")
    },
    {
      icon: Shield,
      title: t("forCoaches.benefits.protection.title"),
      description: t("forCoaches.benefits.protection.description")
    }
  ];

  const platformTools = [
    { icon: Calendar, label: t("forCoaches.tools.scheduling") },
    { icon: MessageSquare, label: t("forCoaches.tools.messaging") },
    { icon: Video, label: t("forCoaches.tools.video") },
    { icon: FileText, label: t("forCoaches.tools.planBuilder") },
    { icon: TrendingUp, label: t("forCoaches.tools.progress") },
    { icon: DollarSign, label: t("forCoaches.tools.payments") }
  ];

  const requirements = [
    t("forCoaches.requirements.certification"),
    t("forCoaches.requirements.experience"),
    t("forCoaches.requirements.background"),
    t("forCoaches.requirements.insurance"),
    t("forCoaches.requirements.conduct")
  ];

  const testimonials = [
    {
      quote: t("forCoaches.testimonials.mike.quote"),
      author: t("forCoaches.testimonials.mike.author"),
      role: t("forCoaches.testimonials.mike.role"),
      rating: 5
    },
    {
      quote: t("forCoaches.testimonials.sarah.quote"),
      author: t("forCoaches.testimonials.sarah.author"),
      role: t("forCoaches.testimonials.sarah.role"),
      rating: 5
    },
    {
      quote: t("forCoaches.testimonials.marcus.quote"),
      author: t("forCoaches.testimonials.marcus.author"),
      role: t("forCoaches.testimonials.marcus.role"),
      rating: 5
    }
  ];

  const steps = [
    {
      step: "01",
      title: t("forCoaches.steps.apply.title"),
      description: t("forCoaches.steps.apply.description")
    },
    {
      step: "02",
      title: t("forCoaches.steps.build.title"),
      description: t("forCoaches.steps.build.description")
    },
    {
      step: "03",
      title: t("forCoaches.steps.start.title"),
      description: t("forCoaches.steps.start.description")
    }
  ];

  return (
    <PageLayout
      title={t("forCoaches.meta.title")}
      description={t("forCoaches.meta.description")}
    >
      {/* Decorative Avatar */}
      <DecorativeAvatar 
        avatarSlug="elite-personal-trainer-human" 
        position="bottom-right" 
        size="xl" 
        opacity={20}
        className="right-8 bottom-40 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                {t("forCoaches.hero.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t("forCoaches.hero.titleStart")}{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  FitConnect
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("forCoaches.hero.description", { coachCount: isLoading ? "..." : formatStatNumber(platformStats?.totalCoaches || 0) })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth?mode=signup&role=coach">
                  <GradientButton size="lg">{t("forCoaches.hero.applyNow")}</GradientButton>
                </Link>
                <Link to="/how-it-works">
                  <GradientButton size="lg" variant="outline">{t("forCoaches.hero.learnMore")}</GradientButton>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold">{t("forCoaches.calculator.title")}</h3>
                    <p className="text-muted-foreground text-sm">{t("forCoaches.calculator.subtitle")}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("forCoaches.calculator.clientsLabel", { count: numberOfClients })}
                      </label>
                      <Input
                        type="range"
                        min="1"
                        max="50"
                        value={numberOfClients}
                        onChange={(e) => setNumberOfClients(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("forCoaches.calculator.hoursLabel", { count: adminHoursPerClient })}
                      </label>
                      <Input
                        type="range"
                        min="1"
                        max="5"
                        value={adminHoursPerClient}
                        onChange={(e) => setAdminHoursPerClient(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("forCoaches.calculator.weekly")}</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {weeklyTimeSaved} {t("forCoaches.calculator.hours")}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("forCoaches.calculator.saved")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("forCoaches.calculator.yearly")}</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {yearlyTimeSaved.toLocaleString()} {t("forCoaches.calculator.hours")}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("forCoaches.calculator.saved")}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Globe className="w-5 h-5 text-primary" />
                          <p className="text-lg font-bold">{isLoading ? "..." : formatStatNumber(platformStats?.totalUsers || 0)} {t("forCoaches.calculator.activeClients")}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("forCoaches.calculator.lookingForCoaches")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <BlobShape className="absolute -bottom-10 -right-10 w-32 h-32 opacity-50 -z-10" variant="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("forCoaches.benefitsSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FitConnect
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("forCoaches.benefitsSection.description")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Tools */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("forCoaches.toolsSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("forCoaches.toolsSection.titleHighlight")}
              </span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {platformTools.map((tool, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-card shadow-soft border border-border/50"
              >
                <tool.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("forCoaches.stepsSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("forCoaches.stepsSection.titleHighlight")}
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <span className="inline-block text-6xl font-bold bg-gradient-to-r from-primary/20 to-secondary/20 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("forCoaches.testimonialsSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("forCoaches.testimonialsSection.titleHighlight")}
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-primary">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("forCoaches.requirementsSection.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("forCoaches.requirementsSection.description")}
              </p>
            </div>
            
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("forCoaches.cta.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("forCoaches.cta.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("forCoaches.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup&role=coach">
                <GradientButton size="lg">{t("forCoaches.cta.apply")}</GradientButton>
              </Link>
              <Link to="/faq">
                <GradientButton size="lg" variant="outline">{t("forCoaches.cta.faq")}</GradientButton>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              <Clock className="w-4 h-4 inline mr-1" />
              {t("forCoaches.cta.reviewTime")}
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ForCoaches;
