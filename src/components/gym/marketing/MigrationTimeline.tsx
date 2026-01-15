import { CheckCircle2, Users, Settings, TrendingUp, Headphones, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelinePhase {
  days: string;
  title: string;
  description: string;
  icon: React.ElementType;
  items: string[];
  color: string;
}

const phases: TimelinePhase[] = [
  {
    days: "Days 1-7",
    title: "Discovery & Setup",
    description: "We learn your business and prepare everything",
    icon: Headphones,
    items: [
      "Dedicated account manager assigned",
      "Deep-dive call to understand your gym",
      "Custom migration plan created",
      "Staff accounts provisioned",
    ],
    color: "text-blue-500",
  },
  {
    days: "Days 8-30",
    title: "Migration & Training",
    description: "Your data moves over, your team gets trained",
    icon: Users,
    items: [
      "Member data imported & verified",
      "Payment methods migrated",
      "Staff training sessions",
      "Go-live with full support",
    ],
    color: "text-primary",
  },
  {
    days: "Days 31-60",
    title: "Optimisation",
    description: "Fine-tune automations and workflows",
    icon: Settings,
    items: [
      "Automated billing configured",
      "Email/SMS templates customised",
      "Reporting dashboards set up",
      "Integration checks completed",
    ],
    color: "text-amber-500",
  },
  {
    days: "Days 61-90",
    title: "Growth Planning",
    description: "Focus on growing your business",
    icon: TrendingUp,
    items: [
      "Marketing campaign setup",
      "Retention strategy review",
      "Advanced features training",
      "Quarterly success review",
    ],
    color: "text-emerald-500",
  },
];

export function MigrationTimeline() {
  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500 via-primary to-emerald-500 hidden md:block" />
      
      <div className="space-y-8">
        {phases.map((phase, index) => (
          <div 
            key={index}
            className="relative flex gap-6 items-start"
          >
            {/* Timeline dot */}
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 z-10",
              "bg-card border-2 border-border shadow-lg"
            )}>
              <phase.icon className={cn("w-7 h-7", phase.color)} />
            </div>
            
            {/* Content card */}
            <div className="flex-1 bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-semibold",
                  "bg-primary/10 text-primary"
                )}>
                  {phase.days}
                </span>
                <h3 className="font-display text-xl font-bold">{phase.title}</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">{phase.description}</p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      {/* Final success indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            Fully operational & optimised in 90 days
          </span>
          <ArrowRight className="w-4 h-4 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}
