import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeDateInput } from "@/components/ui/native-date-input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, CheckCircle, Loader2, Dumbbell, Utensils } from "lucide-react";
import { toast } from "sonner";
import { useCoachClients, CoachClient } from "@/hooks/useCoachClients";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TrainingPlan } from "@/hooks/useTrainingPlans";

interface AssignClientToPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: TrainingPlan | null;
}

export function AssignClientToPlanModal({ open, onOpenChange, plan }: AssignClientToPlanModalProps) {
  const { t } = useTranslation("coach");
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();
  const { data: clients = [], isLoading: isLoadingClients } = useCoachClients();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter active clients only
  const activeClients = useMemo(() => {
    return clients.filter(c => c.status === 'active');
  }, [clients]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return activeClients;
    const query = searchQuery.toLowerCase();
    return activeClients.filter(client => {
      const fullName = `${client.client_profile?.first_name || ''} ${client.client_profile?.last_name || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [activeClients, searchQuery]);

  const getInitials = (client: CoachClient) => {
    const first = client.client_profile?.first_name?.[0] || '';
    const last = client.client_profile?.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (client: CoachClient) => {
    const first = client.client_profile?.first_name || '';
    const last = client.client_profile?.last_name || '';
    return `${first} ${last}`.trim() || 'Unknown Client';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !plan || !coachProfile?.id) return;
    
    setIsAssigning(true);
    
    try {
      const { error } = await supabase
        .from("plan_assignments")
        .insert({
          plan_id: plan.id,
          client_id: selectedClientId,
          coach_id: coachProfile.id,
          start_date: startDate,
          status: "active",
        });

      if (error) throw error;

      const client = clients.find(c => c.client_id === selectedClientId);
      const clientName = client ? getFullName(client) : 'client';
      
      toast.success(t('assignPlanModal.success', { planName: plan.name, clientName }));
      
      queryClient.invalidateQueries({ queryKey: ["plan-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      
      setSelectedClientId(null);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning plan:", error);
      toast.error(t('assignPlanModal.error'));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedClientId(null);
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  const PlanIcon = plan?.plan_type === 'nutrition' ? Utensils : Dumbbell;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">Assign to Client</span>
          </DialogTitle>
          <DialogDescription>
            {plan && (
              <span className="flex items-center gap-2 mt-2">
                <PlanIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{plan.name}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Active Clients
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You need active clients to assign plans to.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-x-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search clients..." 
                className="pl-10 bg-background border-border w-full" 
              />
            </div>

            <ScrollArea className="h-[240px] -mx-1 px-1">
              <div className="space-y-2">
                {filteredClients.map((client) => {
                  const isSelected = selectedClientId === client.client_id;
                  
                  return (
                    <div 
                      key={client.id} 
                      onClick={() => setSelectedClientId(client.client_id)} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {getInitials(client)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{getFullName(client)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.plan_type || 'No plan assigned'}
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                    </div>
                  );
                })}
                
                {filteredClients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No clients found
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedClientId && (
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('assignPlanModal.startDate')}</Label>
                <NativeDateInput 
                  id="startDate"
                  value={startDate} 
                  onChange={setStartDate}
                  className="bg-background border-border"
                />
              </div>
            )}
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning || !selectedClientId} className="w-full sm:w-auto">
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
