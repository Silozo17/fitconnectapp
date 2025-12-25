import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Dumbbell, ChevronDown, Swords, Apple, Flame, Users, BookOpen, Trophy, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { HeaderLocaleSelector } from "@/components/shared/HeaderLocaleSelector";
import { useIOSRestrictions } from "@/hooks/useIOSRestrictions";

const Navbar = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, role, signOut } = useAuth();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isIOSNative, shouldHideCoachMarketplace, shouldHidePricingPage } = useIOSRestrictions();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const coachTypes = [
    { name: t("website.coachTypes.allCoaches"), href: "/coaches", icon: Users, description: t("website.coachTypes.allCoachesDesc") },
    { name: t("website.coachTypes.personalTrainers"), href: "/coaches/personal-trainers", icon: Dumbbell, description: t("website.coachTypes.personalTrainersDesc") },
    { name: t("website.coachTypes.nutritionists"), href: "/coaches/nutritionists", icon: Apple, description: t("website.coachTypes.nutritionistsDesc") },
    { name: t("website.coachTypes.boxingCoaches"), href: "/coaches/boxing", icon: Swords, description: t("website.coachTypes.boxingCoachesDesc") },
    { name: t("website.coachTypes.mmaCoaches"), href: "/coaches/mma", icon: Flame, description: t("website.coachTypes.mmaCoachesDesc") },
  ];

  const resources = [
    { name: t("website.resourceLinks.howItWorks"), href: "/how-it-works", icon: BookOpen, description: t("website.resourceLinks.howItWorksDesc") },
    { name: t("website.resourceLinks.successStories"), href: "/success-stories", icon: Trophy, description: t("website.resourceLinks.successStoriesDesc") },
    { name: t("website.resourceLinks.faq"), href: "/faq", icon: HelpCircle, description: t("website.resourceLinks.faqDesc") },
  ];

  // Filter out iOS-restricted items
  const forCoaches = shouldHidePricingPage
    ? [
        { name: t("website.forCoachesLinks.whyFitConnect"), href: "/for-coaches", icon: Users, description: t("website.forCoachesLinks.whyFitConnectDesc") },
      ]
    : [
        { name: t("website.forCoachesLinks.whyFitConnect"), href: "/for-coaches", icon: Users, description: t("website.forCoachesLinks.whyFitConnectDesc") },
        { name: t("website.forCoachesLinks.pricingPlans"), href: "/pricing", icon: BookOpen, description: t("website.forCoachesLinks.pricingPlansDesc") },
      ];

  // Filter navLinks based on iOS restrictions
  const navLinks = [
    { name: t("website.nav.community"), href: "/community" },
    // Hide marketplace on iOS native
    ...(!isIOSNative ? [{ name: t("website.nav.marketplace"), href: "/marketplace" }] : []),
  ];

  const dashboardLink = role === "coach" ? "/dashboard/coach" : role === "admin" ? "/dashboard/admin" : "/dashboard/client";

  const handleDropdownEnter = (dropdown: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled ? "glass-nav border-b border-border/40" : "bg-transparent")}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FitConnect</span>
          </Link>

          {/* Desktop Navigation - shows at xl (1280px) for tablets to use hamburger */}
          <div className="hidden xl:flex items-center gap-1">
            {/* Find Coaches Dropdown - Hidden on iOS native */}
            {!shouldHideCoachMarketplace && (
              <div 
                className="relative"
                onMouseEnter={() => handleDropdownEnter("coaches")}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1">
                  {t("website.nav.findCoaches")}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "coaches" && "rotate-180")} />
                </button>
                
                {activeDropdown === "coaches" && (
                  <div className="absolute top-full left-0 mt-2 w-72 glass-card rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                    {coachTypes.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter("resources")}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1">
                {t("website.nav.resources")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "resources" && "rotate-180")} />
              </button>
              
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                  {resources.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* For Coaches Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter("forcoaches")}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1">
                {t("website.nav.forCoaches")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "forcoaches" && "rotate-180")} />
              </button>
              
              {activeDropdown === "forcoaches" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                  {forCoaches.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons - shows at xl (1280px) */}
          <div className="hidden xl:flex items-center gap-3">
            <HeaderLocaleSelector />
            {user ? (
              <>
                <Button asChild variant="ghost"><Link to={dashboardLink}>{t("website.nav.dashboard")}</Link></Button>
                <Button onClick={() => signOut()} variant="outline">{t("website.nav.signOut")}</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/auth?mode=login">{t("website.nav.logIn")}</Link></Button>
                <GradientButton asChild size="sm"><Link to="/auth?mode=signup">{t("website.nav.getStarted")}</Link></GradientButton>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger - shows until xl (1280px) for tablets */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="xl:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors">
                <Menu className="w-6 h-6" />
                <span className="sr-only">{t("website.nav.openMenu")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col h-full">
              {/* Fixed Header with Logo */}
              <div className="flex items-center gap-2 p-6 pb-4 border-b border-border/50 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">FitConnect</span>
              </div>

              {/* Scrollable Navigation */}
              <div className="flex-1 overflow-y-auto">
                {/* Mobile Find Coaches Section - Hidden on iOS native */}
                {!shouldHideCoachMarketplace && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("website.nav.findCoaches")}</p>
                    {coachTypes.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center gap-3 py-2.5 text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-4 h-4 text-primary" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="border-t border-border/50 mx-6" />

                {/* Mobile Resources Section */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("website.nav.resources")}</p>
                  {resources.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 py-2.5 text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border/50 mx-6" />

                {/* Mobile For Coaches Section */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("website.nav.forCoaches")}</p>
                  {forCoaches.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 py-2.5 text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border/50 mx-6" />

                {/* Mobile Other Links */}
                <div className="px-6 py-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      to={link.href} 
                      className="block py-2.5 text-foreground hover:text-primary font-medium transition-colors" 
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Fixed Auth Buttons at Bottom */}
              <div className="border-t border-border/50 p-6 shrink-0">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={dashboardLink} onClick={() => setIsOpen(false)}>{t("website.nav.dashboard")}</Link>
                    </Button>
                    <Button onClick={() => { signOut(); setIsOpen(false); }} variant="ghost" className="w-full">
                      {t("website.nav.signOut")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>{t("website.nav.logIn")}</Link>
                    </Button>
                    <GradientButton asChild className="w-full">
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>{t("website.nav.getStarted")}</Link>
                    </GradientButton>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
