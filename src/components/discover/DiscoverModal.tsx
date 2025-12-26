import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Package,
  Star,
  Target,
  Heart,
} from "lucide-react";

interface DiscoverModalProps {
  role: 'client' | 'coach';
  open: boolean;
  onClose: () => void;
}

const clientCards = [
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Log workouts, habits & photos to see your journey",
  },
  {
    icon: Users,
    title: "Connect with Coaches",
    description: "Find professionals who match your goals",
  },
  {
    icon: Calendar,
    title: "Manage Sessions",
    description: "Book, reschedule, and track appointments",
  },
  {
    icon: Target,
    title: "Build Habits",
    description: "Stay consistent with daily tracking",
  },
];

const coachCards = [
  {
    icon: Users,
    title: "Manage Clients",
    description: "View rosters and track client progress",
  },
  {
    icon: Package,
    title: "Send Packages",
    description: "Create and sell session bundles",
  },
  {
    icon: Calendar,
    title: "Schedule Sessions",
    description: "Organize your calendar effortlessly",
  },
  {
    icon: Star,
    title: "Grow Your Business",
    description: "Collect reviews and boost visibility",
  },
];

export function DiscoverModal({ role, open, onClose }: DiscoverModalProps) {
  const cards = role === 'client' ? clientCards : coachCards;
  const subtitle = role === 'client' 
    ? "Here's how FitConnect helps you stay on track"
    : "Everything you need to manage clients in one place";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-display">
            Welcome to FitConnect
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {cards.map((card) => (
            <Card 
              key={card.title} 
              variant="glass" 
              className="p-4 text-center hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <card.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm text-foreground mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description}
              </p>
            </Card>
          ))}
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
