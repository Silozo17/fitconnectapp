import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight } from "lucide-react";

const FeaturedCoaches = () => {
  const coaches = [
    {
      id: 1,
      name: "Marcus Johnson",
      specialty: "Personal Training",
      location: "London, UK",
      rating: 4.9,
      reviews: 127,
      price: "£60/session",
      tags: ["Weight Loss", "Strength"],
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
      verified: true,
    },
    {
      id: 2,
      name: "Sarah Chen",
      specialty: "Nutrition Coach",
      location: "Manchester, UK",
      rating: 5.0,
      reviews: 89,
      price: "£45/session",
      tags: ["Meal Planning", "Vegan"],
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop",
      verified: true,
    },
    {
      id: 3,
      name: "David Okonkwo",
      specialty: "Boxing Coach",
      location: "Birmingham, UK",
      rating: 4.8,
      reviews: 156,
      price: "£55/session",
      tags: ["Boxing", "Conditioning"],
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
      verified: true,
    },
    {
      id: 4,
      name: "Emma Williams",
      specialty: "MMA Coach",
      location: "Leeds, UK",
      rating: 4.9,
      reviews: 72,
      price: "£65/session",
      tags: ["MMA", "Self Defense"],
      image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop",
      verified: true,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-primary font-medium mb-4 block">
              TOP RATED
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Featured <span className="gradient-text">Coaches</span>
            </h2>
          </div>
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary">
            <Link to="/coaches">
              View All Coaches
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Coaches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coaches.map((coach) => (
            <Link
              key={coach.id}
              to={`/coaches/${coach.id}`}
              className="group card-elevated overflow-hidden hover-lift"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {coach.verified && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-medium text-foreground">{coach.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({coach.reviews} reviews)
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  {coach.name}
                </h3>
                <p className="text-primary text-sm mb-2">{coach.specialty}</p>

                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-3 h-3" />
                  {coach.location}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {coach.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-display font-bold text-foreground">
                    {coach.price}
                  </span>
                  <span className="text-primary text-sm font-medium group-hover:underline">
                    View Profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoaches;
