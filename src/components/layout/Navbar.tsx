import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Menu, X, Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, role, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Find Coaches", href: "/coaches" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "For Coaches", href: "/for-coaches" },
  ];

  const dashboardLink = role === "coach" ? "/dashboard/coach" : role === "admin" ? "/dashboard/admin" : "/dashboard/client";

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

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col gap-2">
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
