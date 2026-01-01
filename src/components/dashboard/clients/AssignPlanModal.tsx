import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Search, Dumbbell, Utensils, CheckCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTrainingPlans } from "@/hooks/useTrainingPlans";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AssignPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

const typeConfig: Record<string, { icon: typeof Dumbbell; color: string }> = {
  workout: { icon: Dumbbell, color: "bg-blue-500/20 text-blue-400" },
  strength: { icon: Dumbbell, color: "bg-blue-500/20 text-blue-400" },
  cardio: { icon: Dumbbell, color: "bg-orange-500/20 text-orange-400" },
  nutrition: { icon: Utensils, color: "bg-green-500/20 text-green-400" },
  hybrid: { icon: ClipboardList, color: "bg-purple-500/20 text-purple-400" },
  flexibility: { icon: ClipboardList, color: "bg-teal-500/20 text-teal-400" },
};

export function AssignPlanModal({ open, onOpenChange, clientName, clientId }: AssignPlanModalProps) {
  const { t } = useTranslation("coach");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();
  const { data: plans, isLoading: isLoadingPlans } = useTrainingPlans(coachProfile?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredPlans = (plans || []).filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlan = () => {
    onOpenChange(false);
    navigate("/dashboard/coach/plans/new");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !clientId || !coachProfile?.id) return;
    
    setIsAssigning(true);
    
    try {
      const plan = plans?.find(p => p.id === selectedPlan);
      if (!plan) throw new Error("Plan not found");

      // Insert assignment into plan_assignments table
      const { error } = await supabase
        .from("plan_assignments")
        .insert({
          plan_id: selectedPlan,
          client_id: clientId,
          coach_id: coachProfile.id,
          start_date: startDate,
          status: "active",
        });

      if (error) throw error;

      toast.success(t('assignPlanModal.success', { planName: plan.name, clientName }));
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["plan-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      
      setSelectedPlan(null);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning plan:", error);
      toast.error(t('assignPlanModal.error'));
    } finally {
      setIsAssigning(false);
    }
  };

  const getTypeConfig = (planType: string) => {
    return typeConfig[planType.toLowerCase()] || typeConfig.workout;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] bg-card border-border overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ClipboardList className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">
              {clientName ? t('assignPlanModal.titleWithClient', { clientName }) : t('assignPlanModal.title')}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a training or nutrition plan to assign to this client
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('assignPlanModal.noPlansCreated')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {t('assignPlanModal.noPlansCreatedDesc')}
            </p>
            <Button onClick={handleCreatePlan} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('assignPlanModal.createFirstPlan')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={t('assignPlanModal.searchPlans')} 
                className="pl-10 bg-background border-border" 
              />
            </div>

            <ScrollArea className="h-[280px] -mx-1 px-1">
              <div className="space-y-2">
                {filteredPlans.map((plan) => {
                  const config = getTypeConfig(plan.plan_type);
                  const Icon = config.icon;
                  const isSelected = selectedPlan === plan.id;
                  
                  return (
                    <div 
                      key={plan.id} 
                      onClick={() => setSelectedPlan(plan.id)} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{plan.name}</h4>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className={config.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {plan.plan_type}
                            </Badge>
                            {plan.duration_weeks && (
                              <span className="text-xs text-muted-foreground">
                                {plan.duration_weeks} {t('assignPlanModal.weeks')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredPlans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('assignPlanModal.noPlansFound')}
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedPlan && (
              <div className="space-y-2 min-w-0 overflow-hidden">
                <Label htmlFor="startDate">{t('assignPlanModal.startDate')}</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full min-w-0 bg-background border-border" 
                />
              </div>
            )}
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                {t('assignPlanModal.cancel')}
              </Button>
              <Button type="submit" disabled={isAssigning || !selectedPlan} className="w-full sm:w-auto">
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('assignPlanModal.assigning')}
                  </>
                ) : (
                  t('assignPlanModal.assignPlan')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}