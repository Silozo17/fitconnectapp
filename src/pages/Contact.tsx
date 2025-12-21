import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Clock, HelpCircle, Send } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { usePlatformContact } from "@/hooks/usePlatformContact";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { contact } = usePlatformContact();
  const { t } = useTranslation("pages");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t("contact.form.fillAllFields"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast.success(t("contact.form.success"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(t("contact.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t("contact.info.email.title"),
      description: contact.email,
      subtext: t("contact.info.email.subtext"),
    },
    {
      icon: MessageSquare,
      title: t("contact.info.chat.title"),
      description: t("contact.info.chat.description"),
      subtext: t("contact.info.chat.subtext"),
    },
    {
      icon: Clock,
      title: t("contact.info.response.title"),
      description: t("contact.info.response.description"),
      subtext: t("contact.info.response.subtext"),
    },
  ];

  const quickLinks = [
    { title: t("contact.quickLinks.findCoach"), href: "/how-it-works" },
    { title: t("contact.quickLinks.pricing"), href: "/pricing" },
    { title: t("contact.quickLinks.becomeCoach"), href: "/for-coaches" },
    { title: t("contact.quickLinks.faqs"), href: "/faq" },
  ];

  return (
    <>
      <Helmet>
        <title>{t("contact.meta.title")}</title>
        <meta name="description" content={t("contact.meta.description")} />
      </Helmet>
      
      <div className="min-h-screen bg-background relative">
        <Navbar />
        
        {/* Decorative Avatar */}
        <DecorativeAvatar 
          avatarSlug="parkour-monkey" 
          position="bottom-right" 
          size="lg" 
          opacity={15}
          className="right-8 bottom-20 z-0"
        />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto text-center relative z-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {t("contact.hero.badge")}
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t("contact.hero.titleStart")} <span className="text-gradient-primary">{t("contact.hero.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              {t("contact.hero.description")}
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="pb-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                    <p className="text-foreground mb-1">{info.description}</p>
                    <p className="text-sm text-muted-foreground">{info.subtext}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">{t("contact.form.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("contact.form.name")}</Label>
                          <Input
                            id="name"
                            placeholder={t("contact.form.namePlaceholder")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("contact.form.email")}</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t("contact.form.emailPlaceholder")}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                        <Input
                          id="subject"
                          placeholder={t("contact.form.subjectPlaceholder")}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("contact.form.message")}</Label>
                        <Textarea
                          id="message"
                          placeholder={t("contact.form.messagePlaceholder")}
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          t("contact.form.sending")
                        ) : (
                          <>
                            {t("contact.form.send")} <Send className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Links */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      {t("contact.quickAnswers")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickLinks.map((link, index) => (
                      <Link
                        key={index}
                        to={link.href}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.title} →
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">{t("contact.followUs")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                <SocialLinks iconSize="w-5 h-5" className="gap-3" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
