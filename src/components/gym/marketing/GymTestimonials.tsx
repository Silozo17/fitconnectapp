import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  gymName: string;
  gymType: string;
  metric?: string;
  metricLabel?: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "We switched from Mindbody and cut our software costs in half. The migration was seamless—they handled everything while we kept running classes.",
    author: "James Morrison",
    role: "Owner",
    gymName: "CrossFit Brixton",
    gymType: "CrossFit Box",
    metric: "£200",
    metricLabel: "saved monthly",
    rating: 5,
  },
  {
    quote: "The belt grading system is perfect for our martial arts school. Parents love being able to see their kids' progress online.",
    author: "Sarah Chen",
    role: "Head Instructor",
    gymName: "Dragon Spirit MMA",
    gymType: "Martial Arts",
    metric: "300+",
    metricLabel: "student families",
    rating: 5,
  },
  {
    quote: "Finally, software that doesn't require a PhD to use. My staff were confident using it after one training session.",
    author: "Mike Thompson",
    role: "Manager",
    gymName: "Flex Fitness",
    gymType: "24/7 Gym",
    metric: "15hrs",
    metricLabel: "saved weekly",
    rating: 5,
  },
  {
    quote: "The automated billing alone has transformed our cash flow. No more chasing payments—everything just works.",
    author: "Emma Richards",
    role: "Co-Founder",
    gymName: "Studio Sweat",
    gymType: "Boutique Studio",
    metric: "98%",
    metricLabel: "payment success",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

export function GymTestimonials() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {testimonials.map((testimonial, index) => (
        <div 
          key={index}
          className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          {/* Quote icon */}
          <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
          
          {/* Content */}
          <div className="space-y-4">
            <StarRating rating={testimonial.rating} />
            
            <blockquote className="text-foreground leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            
            {/* Author */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.gymName}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                  {testimonial.gymType}
                </span>
              </div>
              
              {/* Metric */}
              {testimonial.metric && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{testimonial.metric}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.metricLabel}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Single testimonial highlight for hero sections
export function FeaturedTestimonial() {
  const featured = testimonials[0];
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Quote className="w-12 h-12 text-primary/20 mx-auto mb-4" />
      <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6">
        "{featured.quote}"
      </blockquote>
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">
            {featured.author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="text-left">
          <p className="font-semibold">{featured.author}</p>
          <p className="text-sm text-muted-foreground">{featured.role}, {featured.gymName}</p>
        </div>
      </div>
    </div>
  );
}
