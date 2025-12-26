import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";
import BlobShape from "@/components/ui/blob-shape";

const Testimonials = () => {
  const { t } = useTranslation('landing');
  
  const testimonials = [
    {
      key: "james",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      key: "sophie",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      key: "michael",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Blobs */}
      <BlobShape variant="purple" size="lg" className="top-0 left-1/4 opacity-30" />
      <BlobShape variant="teal" size="md" className="bottom-0 right-1/4 opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-orange/10 text-gradient-orange font-medium text-sm mb-4">
            {t('testimonials.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('testimonials.title')}{" "}
            <span className="gradient-text-orange">{t('testimonials.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('testimonials.description')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card p-6 md:p-8 relative">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gradient-pink/20 to-gradient-purple/10 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-warning text-warning"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                "{t(`testimonials.items.${testimonial.key}.content`)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <img
                  src={testimonial.image}
                  alt={t(`testimonials.items.${testimonial.key}.name`)}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20"
                />
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {t(`testimonials.items.${testimonial.key}.name`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`testimonials.items.${testimonial.key}.role`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
