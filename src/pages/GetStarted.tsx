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

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <>
      <Helmet>
        <title>Get Started | FitConnect</title>
        <meta name="description" content="Start your fitness journey with FitConnect. Find coaches, get personalized plans, and track your progress." />
      </Helmet>

      <div className="h-dvh bg-background flex flex-col overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 sm:py-8">
          {/* Logo */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">FitConnect</span>
            </div>
          </div>

          {/* Carousel */}
          <div className="w-full max-w-sm">
            <div className="relative overflow-hidden">
              {/* Slide content */}
              <div className="flex flex-col items-center text-center px-4 min-h-[180px] sm:min-h-[280px]">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <CurrentIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
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
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-muted"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div 
          className="px-6 space-y-2 sm:space-y-3 max-w-sm mx-auto w-full"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
        >
          <Button 
            onClick={handleGetStarted} 
            className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold"
            size="lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={handleLogin} 
            variant="outline" 
            className="w-full h-11 sm:h-12 text-base sm:text-lg"
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
