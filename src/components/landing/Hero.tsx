import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GradientButton } from "@/components/ui/gradient-button";
import { NeonBadge } from "@/components/ui/neon-badge";
import { DottedPattern } from "@/components/ui/dotted-pattern";
import { Users, Award, Star, Zap, ArrowRight, Dumbbell, Salad, Swords } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { formatStatNumber } from "@/lib/formatStats";

const SUPABASE_URL = "https://ntgfihgneyoxxbwmtceq.supabase.co";
const HERO_IMAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/website-images/hero_image.webp`;

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
        priority
      />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <DottedPattern variant="circle" size={300} className="absolute top-20 right-10 opacity-30" />
        <DottedPattern variant="circle" size={150} className="absolute bottom-40 left-20 opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        {/* Main hero content - Split layout on large screens */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Text content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="flex justify-center lg:justify-start mb-8">
              <NeonBadge variant="lime" size="md" className="gap-2">
                <Zap className="w-4 h-4" />
                <span>{t('hero.badge')}</span>
              </NeonBadge>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title')}
              <span className="block gradient-text-energy">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
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

            {/* Stats - shown below buttons on mobile, inline on desktop */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-3 md:px-6 md:py-4 hover:border-primary/30 transition-all duration-300">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl md:text-2xl font-bold text-foreground font-display">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-2xl scale-95" />
              
              {/* Image container with subtle border glow */}
              <div className="relative rounded-3xl overflow-hidden border border-border/30 shadow-2xl shadow-primary/10">
                <img 
                  src={HERO_IMAGE_URL}
                  alt="FitConnect - Your personal fitness journey"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
                {/* Subtle gradient overlay at bottom for text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Services section */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <h2 className="sr-only">{t('hero.servicesHeading', 'Our Services')}</h2>
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
