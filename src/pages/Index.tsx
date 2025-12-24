import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // In native app, authenticated users should not be on homepage - redirect to dashboard
  useEffect(() => {
    if (!loading && user && role && isDespia()) {
      const dashboardRoute = 
        role === "admin" || role === "manager" || role === "staff"
          ? "/dashboard/admin"
          : role === "coach"
            ? "/dashboard/coach"
            : "/dashboard/client";
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <>
      <Helmet>
        <title>FitConnect - Find Your Perfect Fitness Coach | Personal Training, Nutrition & Combat Sports</title>
        <meta 
          name="description" 
          content="Connect with elite personal trainers, nutritionists, and combat sports coaches. Get personalized training plans and achieve your fitness goals with FitConnect." 
        />
      </Helmet>
      
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
