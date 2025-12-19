import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Apple, Trophy, Users } from "lucide-react";

const slides = [
  {
    icon: Dumbbell,
    title: "Find Your Perfect Coach",
    description: "Browse verified personal trainers, nutritionists, boxing and MMA coaches near you or online.",
  },
  {
    icon: Apple,
    title: "Personalized Plans",
    description: "Get custom workout and nutrition plans tailored to your goals and lifestyle.",
  },
  {
    icon: Trophy,
    title: "Track Your Progress",
    description: "Log workouts, track measurements, and celebrate your achievements with badges and XP.",
  },
  {
    icon: Users,
    title: "Join the Community",
    description: "Connect with like-minded people, join challenges, and climb the leaderboards.",
  },
];

const GetStarted = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleGetStarted = () => {
    navigate("/auth?mode=signup");
  };

  const handleLogin = () => {
    navigate("/auth?mode=login");
  };

  const handleSkip = () => {
    navigate("/");
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <>
      <Helmet>
        <title>Get Started | FitConnect</title>
        <meta name="description" content="Start your fitness journey with FitConnect. Find coaches, get personalized plans, and track your progress." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Skip button */}
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">FitConnect</span>
            </div>
          </div>

          {/* Carousel */}
          <div className="w-full max-w-sm">
            <div className="relative overflow-hidden">
              {/* Slide content */}
              <div className="flex flex-col items-center text-center px-4 min-h-[280px]">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CurrentIcon className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>

              {/* Navigation arrows */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-muted"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-8 space-y-3 max-w-sm mx-auto w-full">
          <Button 
            onClick={handleGetStarted} 
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={handleLogin} 
            variant="outline" 
            className="w-full h-12 text-lg"
            size="lg"
          >
            I have an account
          </Button>
        </div>
      </div>
    </>
  );
};

export default GetStarted;
