import { useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Mail, ArrowRight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinks } from "@/components/shared/SocialLinks";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim(), source: "footer" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Thanks for subscribing!");
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const footerLinks = {
    "Find Coaches": [
      { name: "All Coaches", href: "/coaches" },
      { name: "Personal Trainers", href: "/coaches/personal-trainers" },
      { name: "Nutritionists", href: "/coaches/nutritionists" },
      { name: "Boxing Coaches", href: "/coaches/boxing" },
      { name: "MMA Coaches", href: "/coaches/mma" },
    ],
    Resources: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Success Stories", href: "/success-stories" },
      { name: "Blog", href: "/blog" },
      { name: "Community", href: "/community" },
      { name: "Help Center", href: "/docs" },
      { name: "FAQ", href: "/faq" },
      { name: "Marketplace", href: "/marketplace" },
    ],
    "For Coaches": [
      { name: "Why FitConnect", href: "/for-coaches" },
      { name: "Pricing & Plans", href: "/pricing" },
      { name: "Contact Us", href: "/contact" },
    ],
    Legal: [
      { name: "About Us", href: "/about" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
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
            <h3 className="font-display text-2xl font-bold mb-2">Stay in the Loop</h3>
            <p className="text-muted-foreground mb-6">
              Get fitness tips, coach spotlights, and platform updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubscribing}
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
              Connect with world-class fitness coaches and transform your health
              journey. Your goals, your way.
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
                  <li key={link.name}>
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

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} FitConnect. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with passion for fitness 
            <Zap className="w-4 h-4 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
