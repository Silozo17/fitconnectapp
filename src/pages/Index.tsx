import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import FeaturedCoaches from "@/components/landing/FeaturedCoaches";
import Leaderboard from "@/components/landing/Leaderboard";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import { AvatarShowcase } from "@/components/landing/AvatarShowcase";
import { BlogSection } from "@/components/landing/BlogSection";
import { useAuth } from "@/contexts/AuthContext";
import { isDespia } from "@/lib/despia";
import { getBestDashboardRoute, saveViewState, getViewModeFromPath } from "@/lib/view-restoration";

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // In native app, authenticated users should not be on homepage - redirect to dashboard
  // CRITICAL: Use saved view preference, not role-based default
  useEffect(() => {
    if (!loading && user && role && isDespia()) {
      // getBestDashboardRoute checks saved route first, then saved view preference, then falls back to role default
      const dashboardRoute = getBestDashboardRoute(role);
      
      // Sync view state to ensure consistency
      const viewMode = getViewModeFromPath(dashboardRoute);
      if (viewMode) {
        saveViewState(viewMode);
      }
      
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FitConnect",
    "url": "https://getfitconnect.co.uk",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://getfitconnect.co.uk/coaches?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FitConnect",
    "operatingSystem": ["iOS", "Android"],
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    },
    "description": "Connect with verified personal trainers, nutritionists and fitness coaches across the UK."
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" }
  ]);

  return (
    <>
      <SEOHead
        title="Find Personal Trainers & Fitness Coaches | FitConnect UK"
        description="Connect with verified personal trainers, nutritionists and boxing coaches across the UK. Book sessions, get custom workout plans and achieve your fitness goals. Download free."
        canonicalPath="/"
        keywords={["find personal trainer", "personal trainer near me", "fitness coach UK", "online personal training", "book fitness coach", "hire personal trainer"]}
        schema={[websiteSchema, softwareAppSchema, breadcrumbSchema]}
      />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <FeaturedCoaches />
          <AvatarShowcase />
          <Leaderboard />
          <Features />
          <Testimonials />
          <CTA />
          <BlogSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
