import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dumbbell, Mail, ArrowRight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { FooterLocaleSelector } from "@/components/shared/FooterLocaleSelector";

const Footer = () => {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("website.footer.invalidEmail"));
      return;
    }

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim(), source: "footer" });

      if (error) {
        if (error.code === "23505") {
          toast.info(t("website.footer.alreadySubscribed"));
        } else {
          throw error;
        }
      } else {
        toast.success(t("website.footer.subscribeSuccess"));
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error(t("website.footer.subscribeFailed"));
    } finally {
      setIsSubscribing(false);
    }
  };

  const footerLinks = {
    [t("website.footer.sections.findCoaches")]: [
      { name: t("website.footer.links.allCoaches"), href: "/coaches" },
      { name: t("website.footer.links.personalTrainers"), href: "/coaches/personal-trainers" },
      { name: t("website.footer.links.nutritionists"), href: "/coaches/nutritionists" },
      { name: t("website.footer.links.boxingCoaches"), href: "/coaches/boxing" },
      { name: t("website.footer.links.mmaCoaches"), href: "/coaches/mma" },
    ],
    [t("website.footer.sections.resources")]: [
      { name: t("website.footer.links.howItWorks"), href: "/how-it-works" },
      { name: t("website.footer.links.successStories"), href: "/success-stories" },
      { name: t("website.footer.links.blog"), href: "/blog" },
      { name: t("website.footer.links.community"), href: "/community" },
      { name: t("website.footer.links.helpCenter"), href: "/docs" },
      { name: t("website.footer.links.faq"), href: "/faq" },
      { name: t("website.footer.links.marketplace"), href: "/marketplace" },
    ],
    [t("website.footer.sections.forCoaches")]: [
      { name: t("website.footer.links.whyFitConnect"), href: "/for-coaches" },
      { name: t("website.footer.links.pricingPlans"), href: "/pricing" },
      { name: t("website.footer.links.contactUs"), href: "/contact" },
    ],
    [t("website.footer.sections.legal")]: [
      { name: t("website.footer.links.aboutUs"), href: "/about" },
      { name: t("website.footer.links.privacyPolicy"), href: "/privacy" },
      { name: t("website.footer.links.termsOfService"), href: "/terms" },
    ],
  };

  return (
    <footer className="bg-card/50 border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">{t("website.footer.newsletterTitle")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("website.footer.newsletterDescription")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("website.footer.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubscribing}
                aria-label={t("website.footer.subscribeButtonLabel")}
              >
                {isSubscribing ? "..." : <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                FitConnect
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 text-sm">
              {t("website.footer.brandDescription")}
            </p>
            <SocialLinks 
              iconSize="w-5 h-5"
              className="gap-3"
            />
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Locale Selector */}
        <div className="mt-12 pt-8 border-t border-border">
          <FooterLocaleSelector />
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            {t("website.footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            {t("website.footer.madeWith")}
            <Zap className="w-4 h-4 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
