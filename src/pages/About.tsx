import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { Award, Users, Heart, Target, TrendingUp, Shield, Sparkles, Globe } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation("pages");

  const values = [
    {
      icon: Award,
      title: t("about.values.excellence.title"),
      description: t("about.values.excellence.description")
    },
    {
      icon: Users,
      title: t("about.values.accessibility.title"),
      description: t("about.values.accessibility.description")
    },
    {
      icon: Heart,
      title: t("about.values.community.title"),
      description: t("about.values.community.description")
    },
    {
      icon: Target,
      title: t("about.values.results.title"),
      description: t("about.values.results.description")
    }
  ];

  const stats = [
    { value: "10K+", label: t("about.stats.activeUsers") },
    { value: "500+", label: t("about.stats.expertCoaches") },
    { value: "50K+", label: t("about.stats.sessionsCompleted") },
    { value: "98%", label: t("about.stats.satisfactionRate") }
  ];

  const team = [
    {
      name: "Sarah Mitchell",
      role: t("about.team.sarah.role"),
      bio: t("about.team.sarah.bio")
    },
    {
      name: "Marcus Chen",
      role: t("about.team.marcus.role"),
      bio: t("about.team.marcus.bio")
    },
    {
      name: "Dr. Emily Rodriguez",
      role: t("about.team.emily.role"),
      bio: t("about.team.emily.bio")
    },
    {
      name: "James Okonkwo",
      role: t("about.team.james.role"),
      bio: t("about.team.james.bio")
    }
  ];

  return (
    <PageLayout
      title={t("about.meta.title")}
      description={t("about.meta.description")}
    >
      {/* Decorative Avatars */}
      <DecorativeAvatar 
        avatarSlug="weightlifting-lion" 
        position="top-right" 
        size="lg" 
        opacity={18}
        className="right-8 top-40 z-0"
      />
      <DecorativeAvatar 
        avatarSlug="strongman-bear" 
        position="bottom-left" 
        size="md" 
        opacity={15}
        className="left-8 bottom-60 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            {t("about.hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("about.hero.titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("about.hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("about.hero.description")}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("about.story.titleStart")}{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("about.story.titleHighlight")}
                </span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("about.story.paragraph1")}</p>
                <p>{t("about.story.paragraph2")}</p>
                <p>{t("about.story.paragraph3")}</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {t("about.story.established")}
                  </p>
                  <p className="text-muted-foreground">{t("about.story.location")}</p>
                </div>
              </div>
              <BlobShape className="absolute -bottom-10 -right-10 w-40 h-40 opacity-50" variant="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about.mission.title")}</h2>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              "{t("about.mission.quoteStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                {t("about.mission.quoteHighlight")}
              </span>{" "}
              {t("about.mission.quoteEnd")}"
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("about.valuesSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("about.valuesSection.titleHighlight")}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.valuesSection.description")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} variant="glass" className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute top-0 left-1/4 w-[400px] h-[400px] opacity-20" variant="pink" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("about.teamSection.titleStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("about.teamSection.titleHighlight")}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.teamSection.description")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} variant="glass" className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <div className="hidden md:block">
                    <Shield className="w-16 h-16 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{t("about.trust.title")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("about.trust.description")}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t("about.trust.items.credentials")}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t("about.trust.items.background")}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t("about.trust.items.quality")}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t("about.trust.items.security")}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("about.cta.titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("about.cta.titleHighlight")}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("about.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/coaches">
              <GradientButton size="lg">{t("about.cta.findCoach")}</GradientButton>
            </Link>
            <Link to="/for-coaches">
              <GradientButton size="lg" variant="outline">{t("about.cta.becomeCoach")}</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
