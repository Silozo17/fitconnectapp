import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachFilters, { FilterState } from "@/components/coaches/CoachFilters";
import CoachCard from "@/components/coaches/CoachCard";
import { coaches } from "@/data/coaches";
import { Users } from "lucide-react";

const Coaches = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    specialty: "",
    location: "",
    priceRange: "",
    sessionType: "",
  });

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          coach.name.toLowerCase().includes(searchLower) ||
          coach.specialty.toLowerCase().includes(searchLower) ||
          coach.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (filters.specialty) {
        const specialtyMap: Record<string, string[]> = {
          "personal-training": ["Personal Training"],
          nutrition: ["Nutrition Coach"],
          boxing: ["Boxing Coach"],
          mma: ["MMA Coach"],
        };
        if (!specialtyMap[filters.specialty]?.includes(coach.specialty)) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (locationLower === "online") {
          if (!coach.online) return false;
        } else {
          if (!coach.location.toLowerCase().includes(locationLower)) return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-").map((v) => parseInt(v) || Infinity);
        if (coach.price < min || (max !== Infinity && coach.price > max)) {
          return false;
        }
      }

      // Session type filter
      if (filters.sessionType) {
        if (filters.sessionType === "in-person" && !coach.inPerson) return false;
        if (filters.sessionType === "online" && !coach.online) return false;
        if (filters.sessionType === "both" && (!coach.online || !coach.inPerson)) return false;
      }

      return true;
    });
  }, [filters]);

  // Sort sponsored coaches first
  const sortedCoaches = useMemo(() => {
    return [...filteredCoaches].sort((a, b) => {
      if (a.sponsored && !b.sponsored) return -1;
      if (!a.sponsored && b.sponsored) return 1;
      return 0;
    });
  }, [filteredCoaches]);

  return (
    <>
      <Helmet>
        <title>Find Fitness Coaches | Personal Trainers, Nutritionists & Combat Sports | FitConnect</title>
        <meta 
          name="description" 
          content="Browse and connect with verified fitness coaches near you. Filter by specialty, location, price, and session type to find your perfect match." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Find Your <span className="gradient-text">Perfect Coach</span>
              </h1>
              <p className="text-muted-foreground">
                Browse our verified fitness professionals and start your transformation today.
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <CoachFilters onFilterChange={setFilters} />
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-2 mb-6 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>
                Showing <strong className="text-foreground">{sortedCoaches.length}</strong> coaches
              </span>
            </div>

            {/* Coach Grid */}
            {sortedCoaches.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedCoaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  No coaches found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Coaches;
