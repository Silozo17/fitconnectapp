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

// NOTE: Authenticated user redirects are handled centrally by RouteRestorer
// to prevent race conditions and screen flashing

const Index = () => {
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
    "description": "Find verified personal trainers, nutritionists and fitness coaches across the UK. Book sessions and achieve your fitness goals."
  };

  const mobileAppSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "FitConnect",
    "operatingSystem": ["iOS", "Android"],
    "applicationCategory": "HealthApplication",
    "downloadUrl": [
      "https://apps.apple.com/app/fitconnect",
      "https://play.google.com/store/apps/details?id=uk.co.getfitconnect"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500"
    }
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" }
  ]);

  return (
    <>
      <SEOHead
        title="Find Personal Trainers Near You | FitConnect UK"
        description="Find verified personal trainers, nutritionists and boxing coaches across the UK. Book sessions online or in-person. Free to download on iOS and Android."
        canonicalPath="/"
        keywords={["personal trainer near me", "find personal trainer UK", "fitness coach", "book personal trainer", "hire PT near me", "online personal training"]}
        schema={[websiteSchema, softwareAppSchema, mobileAppSchema, breadcrumbSchema]}
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
