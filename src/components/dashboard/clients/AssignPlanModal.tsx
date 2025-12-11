import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Search, Dumbbell, Utensils, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  type: "workout" | "nutrition" | "hybrid";
  description: string;
  durationWeeks: number;
}

interface AssignPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Beginner Strength Program",
    type: "workout",
    description: "Perfect for those new to weight training. Focus on compound movements and building a strong foundation.",
    durationWeeks: 8,
  },
  {
    id: "2",
    name: "Fat Loss Meal Plan",
    type: "nutrition",
    description: "Calorie-controlled meal plan with high protein and balanced macros for sustainable fat loss.",
    durationWeeks: 12,
  },
  {
    id: "3",
    name: "Advanced Hypertrophy",
    type: "workout",
    description: "High volume training program designed for muscle growth and aesthetic development.",
    durationWeeks: 6,
  },
  {
    id: "4",
    name: "Complete Transformation",
    type: "hybrid",
    description: "Full workout and nutrition program for complete body recomposition.",
    durationWeeks: 16,
  },
  {
    id: "5",
    name: "Muscle Gain Diet",
    type: "nutrition",
    description: "High-calorie, high-protein meal plan optimized for lean muscle gain.",
    durationWeeks: 8,
  },
];

const typeConfig = {
  workout: { icon: Dumbbell, color: "bg-blue-500/20 text-blue-400" },
  nutrition: { icon: Utensils, color: "bg-green-500/20 text-green-400" },
  hybrid: { icon: ClipboardList, color: "bg-purple-500/20 text-purple-400" },
};

export function AssignPlanModal({ open, onOpenChange, clientName }: AssignPlanModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPlans = mockPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plan = mockPlans.find(p => p.id === selectedPlan);
    toast.success(`${plan?.name} assigned to ${clientName}`);
    setSelectedPlan(null);
    setSearchQuery("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assign Plan {clientName && `to ${clientName}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="pl-10 bg-background border-border"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredPlans.map((plan) => {
                const config = typeConfig[plan.type];
                const Icon = config.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{plan.name}</h4>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {plan.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {plan.durationWeeks} weeks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredPlans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No plans found matching your search
                </div>
              )}
            </div>
          </ScrollArea>

          {selectedPlan && (
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedPlan}>
              {isLoading ? "Assigning..." : "Assign Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
