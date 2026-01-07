/**
 * DisciplineSetupCTA - Call to action to set up a discipline
 */

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Dumbbell, Swords, PersonStanding } from "lucide-react";

interface DisciplineSetupCTAProps {
  className?: string;
}

export function DisciplineSetupCTA({ className }: DisciplineSetupCTAProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-card",
      "bg-gradient-to-br from-primary/5 via-transparent to-transparent",
      className
    )}>
      {/* Decorative icons */}
      <div className="absolute top-4 right-4 opacity-10">
        <div className="flex gap-2">
          <Swords className="w-8 h-8" />
          <Dumbbell className="w-8 h-8" />
          <PersonStanding className="w-8 h-8" />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Track Your Discipline</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Choose your sport or training style to get a personalized widget with 
          metrics, milestones, and insights tailored to you.
        </p>

        <Button 
          onClick={() => navigate('/dashboard/client/discipline-setup')}
          className="w-full sm:w-auto"
        >
          Choose Discipline
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
