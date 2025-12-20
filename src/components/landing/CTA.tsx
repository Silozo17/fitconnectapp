import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-bg-primary opacity-95" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t('cta.description')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 h-14 px-8 text-lg font-semibold rounded-xl shadow-lg"
            >
              <Link to="/coaches">
                {t('cta.findCoach')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-900 text-gray-900 hover:bg-gray-900/10 h-14 text-lg px-8 rounded-xl border-2"
            >
              <Link to="/for-coaches">{t('cta.applyAsCoach')}</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              {t('cta.trustBadges.freeToJoin')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              {t('cta.trustBadges.noCommitment')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              {t('cta.trustBadges.cancelAnytime')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
