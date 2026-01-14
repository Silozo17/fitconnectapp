import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Dumbbell,
  Star,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
};

export default function GymPublicWebsite() {
  const { gymSlug } = useParams<{ gymSlug: string }>();

  // Fetch gym profile by slug
  const { data: gym, isLoading: loadingGym } = useQuery({
    queryKey: ['public-gym', gymSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_profiles')
        .select('*')
        .eq('slug', gymSlug)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!gymSlug,
  });

  // Fetch website settings
  const { data: settings } = useQuery({
    queryKey: ['public-gym-settings', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_website_settings')
        .select('*')
        .eq('gym_id', gym!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id,
  });

  // Fetch membership plans
  const { data: plans = [] } = useQuery({
    queryKey: ['public-gym-plans', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_membership_plans' as any)
        .select('*')
        .eq('gym_id', gym!.id)
        .eq('is_active', true)
        .order('price_monthly');
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!gym?.id && settings?.pricing_enabled !== false,
  });

  // Fetch class types
  const { data: classTypes = [] } = useQuery({
    queryKey: ['public-gym-classes', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_class_types')
        .select('*')
        .eq('gym_id', gym!.id)
        .eq('is_active', true)
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id && settings?.classes_enabled !== false,
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['public-gym-testimonials', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_testimonials')
        .select('*')
        .eq('gym_id', gym!.id)
        .eq('is_approved', true)
        .order('display_order')
        .limit(6);
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id && settings?.testimonials_enabled !== false,
  });

  // Fetch trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ['public-gym-trainers', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_featured_trainers')
        .select('*')
        .eq('gym_id', gym!.id)
        .eq('is_active', true)
        .order('display_order')
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id && settings?.trainers_enabled !== false,
  });

  // Fetch gallery
  const { data: gallery = [] } = useQuery({
    queryKey: ['public-gym-gallery', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_gallery_images')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('display_order')
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id && settings?.gallery_enabled !== false,
  });

  // Fetch opening hours
  const { data: openingHours = [] } = useQuery({
    queryKey: ['public-gym-hours', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_opening_hours')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('day_of_week');
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id,
  });

  // Fetch social links
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['public-gym-social', gym?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_social_links')
        .select('*')
        .eq('gym_id', gym!.id)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id,
  });

  if (loadingGym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Gym Not Found</h1>
          <p className="text-muted-foreground">The gym you're looking for doesn't exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  const themeColor = settings?.theme_color || '#3B82F6';
  const secondaryColor = settings?.secondary_color || '#10B981';

  return (
    <>
      <Helmet>
        <title>{settings?.meta_title || `${gym.name} | Fitness Center`}</title>
        <meta name="description" content={settings?.meta_description || gym.description || `Join ${gym.name} for the best fitness experience`} />
        <meta property="og:title" content={settings?.meta_title || gym.name} />
        <meta property="og:description" content={settings?.meta_description || gym.description || ''} />
        {settings?.og_image_url && <meta property="og:image" content={settings.og_image_url} />}
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          className="relative min-h-[70vh] flex items-center justify-center"
          style={{ 
            backgroundImage: settings?.hero_image_url ? `url(${settings.hero_image_url})` : undefined,
            backgroundColor: !settings?.hero_image_url ? themeColor : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {settings?.hero_title || gym.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {settings?.hero_subtitle || gym.description || 'Transform your body. Transform your life.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild style={{ backgroundColor: themeColor }}>
                <Link to={`/club/${gymSlug}/signup`}>
                  Join Now <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                View Classes
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        {(settings?.about_content || settings?.mission_statement) && (
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{settings?.about_title || 'About Us'}</h2>
              {settings?.about_content && (
                <p className="text-lg text-muted-foreground mb-6">{settings.about_content}</p>
              )}
              {settings?.mission_statement && (
                <blockquote className="border-l-4 pl-4 italic text-muted-foreground" style={{ borderColor: themeColor }}>
                  "{settings.mission_statement}"
                </blockquote>
              )}
            </div>
          </section>
        )}

        {/* Classes Section */}
        {settings?.classes_enabled !== false && classTypes.length > 0 && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Classes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classTypes.map((classType) => (
                  <Card key={classType.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="h-5 w-5" style={{ color: themeColor }} />
                        <h3 className="font-semibold text-lg">{classType.name}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{classType.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{classType.default_duration_minutes} min</span>
                        {classType.difficulty_level && (
                          <Badge variant="secondary">{classType.difficulty_level}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trainers Section */}
        {settings?.trainers_enabled !== false && trainers.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Meet Our Trainers</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trainers.map((trainer) => (
                  <Card key={trainer.id} className="overflow-hidden text-center">
                    <div 
                      className="h-48 bg-muted flex items-center justify-center"
                      style={{ 
                        backgroundImage: trainer.photo_url ? `url(${trainer.photo_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!trainer.photo_url && (
                        <Users className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{trainer.name}</h3>
                      {trainer.title && (
                        <p className="text-sm text-muted-foreground mb-2">{trainer.title}</p>
                      )}
                      {trainer.specialties && trainer.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {trainer.specialties.slice(0, 3).map((specialty, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {settings?.pricing_enabled !== false && plans.length > 0 && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Membership Plans</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-3xl font-bold">£{plan.price_monthly}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <Button className="w-full" style={{ backgroundColor: themeColor }} asChild>
                        <Link to={`/club/${gymSlug}/signup?plan=${plan.id}`}>
                          Get Started
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {settings?.testimonials_enabled !== false && testimonials.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">What Our Members Say</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (testimonial.rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {testimonial.author_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author_name}</p>
                          {testimonial.author_role && (
                            <p className="text-sm text-muted-foreground">{testimonial.author_role}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {settings?.gallery_enabled !== false && gallery.length > 0 && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((image) => (
                  <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Gym facility'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact & Hours Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
                <div className="space-y-4">
                  {gym.address_line_1 && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-1" style={{ color: themeColor }} />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{gym.address_line_1}</p>
                        {gym.city && <p className="text-muted-foreground">{gym.city}, {gym.postcode}</p>}
                      </div>
                    </div>
                  )}
                  {gym.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" style={{ color: themeColor }} />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${gym.phone}`} className="text-muted-foreground hover:underline">
                          {gym.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {gym.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" style={{ color: themeColor }} />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${gym.email}`} className="text-muted-foreground hover:underline">
                          {gym.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="mt-6">
                    <p className="font-medium mb-3">Follow Us</p>
                    <div className="flex gap-3">
                      {socialLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                          {socialIcons[link.platform] || link.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Opening Hours</h2>
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const hours = openingHours.find((h) => h.day_of_week === index);
                    const isToday = new Date().getDay() === index;
                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between p-3 rounded-lg ${isToday ? 'bg-primary/10' : 'bg-muted/50'}`}
                      >
                        <span className={isToday ? 'font-semibold' : ''}>{day}</span>
                        <span className="text-muted-foreground">
                          {hours?.is_closed 
                            ? 'Closed' 
                            : hours 
                              ? `${hours.open_time?.slice(0, 5)} - ${hours.close_time?.slice(0, 5)}`
                              : '6:00 - 22:00'
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} {gym.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to={`/club/${gymSlug}/signup`} className="text-sm hover:underline">
                Join Now
              </Link>
              <Link to={`/club/${gymSlug}/login`} className="text-sm hover:underline">
                Member Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
