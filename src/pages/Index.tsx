import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import FeaturedCoaches from "@/components/landing/FeaturedCoaches";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

const Index = () => {
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
          <Features />
          <FeaturedCoaches />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
