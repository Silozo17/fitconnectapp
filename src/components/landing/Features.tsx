import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Shield,
} from "lucide-react";

const Features = forwardRef<HTMLElement>((props, ref) => {
  const { t } = useTranslation('landing');
  
  const features = [
    {
      icon: Search,
      titleKey: "features.items.smartDiscovery.title",
      descriptionKey: "features.items.smartDiscovery.description",
      gradient: "from-gradient-pink to-gradient-purple",
    },
    {
      icon: Calendar,
      titleKey: "features.items.easyBooking.title",
      descriptionKey: "features.items.easyBooking.description",
      gradient: "from-gradient-orange to-gradient-coral",
    },
    {
      icon: ClipboardList,
      titleKey: "features.items.customPlans.title",
      descriptionKey: "features.items.customPlans.description",
      gradient: "from-gradient-teal to-gradient-mint",
    },
    {
      icon: MessageSquare,
      titleKey: "features.items.directMessaging.title",
      descriptionKey: "features.items.directMessaging.description",
      gradient: "from-gradient-purple to-gradient-blue",
    },
    {
      icon: TrendingUp,
      titleKey: "features.items.progressTracking.title",
      descriptionKey: "features.items.progressTracking.description",
      gradient: "from-gradient-mint to-gradient-teal",
    },
    {
      icon: Shield,
      titleKey: "features.items.verifiedCoaches.title",
      descriptionKey: "features.items.verifiedCoaches.description",
      gradient: "from-gradient-coral to-gradient-orange",
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="py-24 md:py-32 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            {t('features.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('features.title')}{" "}
            <span className="gradient-text">{t('features.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card p-6 md:p-8 hover-lift"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";

export default Features;
