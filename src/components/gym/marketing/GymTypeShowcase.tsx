import { Dumbbell, Swords, Sparkles, Building, UserCheck, Medal, Users, Calendar, CreditCard, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface GymType {
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
}

const gymTypes: GymType[] = [
  {
    name: "CrossFit Boxes",
    icon: Dumbbell,
    description: "WOD programming, community building, and athlete tracking.",
    features: ["WOD scheduling", "Whiteboard results", "PR tracking", "Community challenges"],
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Martial Arts Schools",
    icon: Swords,
    description: "Belt grading systems, family accounts, and competition prep.",
    features: ["Belt/grading system", "Family memberships", "Sparring records", "Competition tracking"],
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    name: "Boutique Studios",
    icon: Sparkles,
    description: "Class packs, branded experience, and premium member perks.",
    features: ["Class pack credits", "Branded mobile app", "VIP member tiers", "Retail integration"],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Traditional Gyms",
    icon: Building,
    description: "24/7 access control, high-volume management, and multi-site.",
    features: ["24/7 access control", "Key fob integration", "Capacity management", "Multi-location support"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "PT Studios",
    icon: UserCheck,
    description: "1-on-1 scheduling, client progress tracking, and billing.",
    features: ["1-on-1 scheduling", "Progress photos", "Habit tracking", "Nutrition planning"],
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "Sports Clubs",
    icon: Medal,
    description: "Team management, event scheduling, and league integration.",
    features: ["Team rosters", "Event management", "Facility booking", "Match scheduling"],
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

export function GymTypeShowcase() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gymTypes.map((gym, index) => (
        <div 
          key={index}
          className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
        >
          {/* Icon and title */}
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              gym.bgColor
            )}>
              <gym.icon className={cn("w-7 h-7", gym.color)} />
            </div>
            <h3 className="font-display text-xl font-bold">{gym.name}</h3>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4">{gym.description}</p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {gym.features.map((feature, fIndex) => (
              <div 
                key={fIndex} 
                className="flex items-center gap-2 text-xs"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", gym.color.replace("text-", "bg-"))} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Compact icon grid for smaller displays
export function GymTypeIcons() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {gymTypes.map((gym, index) => (
        <div 
          key={index}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
            gym.bgColor
          )}>
            <gym.icon className={cn("w-8 h-8", gym.color)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {gym.name}
          </span>
        </div>
      ))}
    </div>
  );
}
