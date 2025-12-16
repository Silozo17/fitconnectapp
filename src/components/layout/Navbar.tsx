import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Menu, X, Dumbbell, ChevronDown, Swords, Apple, Flame, Users, BookOpen, Trophy, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, role, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const coachTypes = [
    { name: "All Coaches", href: "/coaches", icon: Users, description: "Browse all fitness professionals" },
    { name: "Personal Trainers", href: "/coaches/personal-trainers", icon: Dumbbell, description: "Custom workout programs" },
    { name: "Nutritionists", href: "/coaches/nutritionists", icon: Apple, description: "Expert diet & meal plans" },
    { name: "Boxing Coaches", href: "/coaches/boxing", icon: Swords, description: "Learn the sweet science" },
    { name: "MMA Coaches", href: "/coaches/mma", icon: Flame, description: "Mixed martial arts training" },
  ];

  const resources = [
    { name: "How It Works", href: "/how-it-works", icon: BookOpen, description: "Learn about the platform" },
    { name: "Success Stories", href: "/success-stories", icon: Trophy, description: "Real client transformations" },
    { name: "FAQ", href: "/faq", icon: HelpCircle, description: "Common questions answered" },
  ];

  const navLinks = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Pricing", href: "/pricing" },
    { name: "For Coaches", href: "/for-coaches" },
  ];

  const dashboardLink = role === "coach" ? "/dashboard/coach" : role === "admin" ? "/dashboard/admin" : "/dashboard/client";

  const handleDropdownEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled ? "bg-background/90 backdrop-blur-xl shadow-soft border-b border-border/50" : "bg-transparent")}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FitConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {/* Find Coaches Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter("coaches")}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1">
                Find Coaches
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "coaches" && "rotate-180")} />
              </button>
              
              {activeDropdown === "coaches" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                  {coachTypes.map((item) => (
                    <Link
                      key={item.name}
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

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter("resources")}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-1">
                Resources
                <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "resources" && "rotate-180")} />
              </button>
              
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
                  {resources.map((item) => (
                    <Link
                      key={item.name}
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
              <Link key={link.name} to={link.href} className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors rounded-lg hover:bg-secondary/50">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button asChild variant="ghost"><Link to={dashboardLink}>Dashboard</Link></Button>
                <Button onClick={() => signOut()} variant="outline">Sign Out</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/auth">Log In</Link></Button>
                <GradientButton asChild size="sm"><Link to="/auth">Get Started</Link></GradientButton>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary transition-colors">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {/* Mobile Find Coaches Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Find Coaches</p>
                {coachTypes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="border-t border-border/50 my-2" />

              {/* Mobile Resources Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resources</p>
                {resources.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="border-t border-border/50 my-2" />

              {/* Mobile Other Links */}
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="px-4 py-3 text-foreground hover:bg-secondary rounded-lg font-medium" onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-border/50 mt-2 pt-4 flex flex-col gap-2 px-4">
                {user ? (
                  <>
                    <Button asChild variant="outline" className="w-full"><Link to={dashboardLink} onClick={() => setIsOpen(false)}>Dashboard</Link></Button>
                    <Button onClick={() => { signOut(); setIsOpen(false); }} variant="ghost" className="w-full">Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full"><Link to="/auth" onClick={() => setIsOpen(false)}>Log In</Link></Button>
                    <GradientButton asChild className="w-full"><Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link></GradientButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
