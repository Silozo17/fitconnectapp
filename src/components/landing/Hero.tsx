import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GradientButton } from "@/components/ui/gradient-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { DottedPattern } from "@/components/ui/dotted-pattern";
import { Users, Award, Star, Zap, ArrowRight, Dumbbell, Salad, Swords } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { formatStatNumber } from "@/lib/formatStats";

const Hero = () => {
  const { t } = useTranslation('landing');
  const { data: platformStats, isLoading } = usePlatformStats();

  const stats = [
    { 
      icon: Users, 
      value: isLoading ? "..." : formatStatNumber(platformStats?.totalUsers || 0), 
      label: t('hero.stats.activeUsers')
    },
    { 
      icon: Award, 
      value: isLoading ? "..." : formatStatNumber(platformStats?.totalCoaches || 0), 
      label: t('hero.stats.expertCoaches')
    },
    { 
      icon: Star, 
      value: platformStats?.avgRating?.toFixed(1) || "4.9", 
      label: t('hero.stats.averageRating')
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg-hero">
      {/* Decorative Avatar */}
      <DecorativeAvatar 
        avatarSlug="sprinter-cheetah" 
        position="bottom-right" 
        size="xl" 
        opacity={25}
        className="right-8 bottom-8 z-0"
      />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <DottedPattern variant="circle" size={300} className="absolute top-20 right-10 opacity-30" />
        <DottedPattern variant="circle" size={150} className="absolute bottom-40 left-20 opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <NeonBadge variant="lime" size="md" className="gap-2">
              <Zap className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </NeonBadge>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title')}
            <span className="block gradient-text-energy">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <GradientButton size="lg" asChild>
              <Link to="/coaches" className="gap-2">
                {t('hero.ctaPrimary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </GradientButton>
            <GradientButton variant="outline" size="lg" asChild>
              <Link to="/for-coaches">{t('hero.ctaSecondary')}</Link>
            </GradientButton>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-6 py-4 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground font-display">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="card-glow p-6 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('hero.services.personalTraining')}</h3>
              <p className="text-muted-foreground text-sm">{t('hero.services.personalTrainingDesc')}</p>
            </div>
            <div className="card-glow p-6 border-primary/30 glow-sm animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <Salad className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('hero.services.nutritionCoaching')}</h3>
              <p className="text-muted-foreground text-sm">{t('hero.services.nutritionCoachingDesc')}</p>
              <NeonBadge variant="purple" size="sm" className="mt-4">{t('hero.services.mostPopular')}</NeonBadge>
            </div>
            <div className="card-glow p-6 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Swords className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('hero.services.combatSports')}</h3>
              <p className="text-muted-foreground text-sm">{t('hero.services.combatSportsDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
