import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Scale, Ruler } from "lucide-react";
import { useAddProgress } from "@/hooks/useCoachClients";
import { useTranslation } from "@/hooks/useTranslation";

interface AddProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

export function AddProgressModal({ open, onOpenChange, clientName, clientId }: AddProgressModalProps) {
  const { t } = useTranslation("coach");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [arms, setArms] = useState("");
  const [legs, setLegs] = useState("");
  const [notes, setNotes] = useState("");
  
  const addProgressMutation = useAddProgress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) return;

    const measurements: Record<string, number> = {};
    if (chest) measurements.chest = parseFloat(chest);
    if (waist) measurements.waist = parseFloat(waist);
    if (hips) measurements.hips = parseFloat(hips);
    if (arms) measurements.arms = parseFloat(arms);
    if (legs) measurements.legs = parseFloat(legs);
    
    addProgressMutation.mutate({
      clientId,
      weightKg: weight ? parseFloat(weight) : undefined,
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  const resetForm = () => {
    setWeight("");
    setBodyFat("");
    setChest("");
    setWaist("");
    setHips("");
    setArms("");
    setLegs("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            {clientName ? t('addProgressModal.titleWithClient', { clientName }) : t('addProgressModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
          <div className="p-4 rounded-lg bg-background border border-border space-y-4 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Scale className="h-4 w-4 text-primary" />
              {t('addProgressModal.bodyComposition')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="weight">{t('addProgressModal.weight')}</Label>
                <Input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75.5" className="w-full bg-card border-border" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="bodyFat">{t('addProgressModal.bodyFat')}</Label>
                <Input id="bodyFat" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="18.5" className="w-full bg-card border-border" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background border border-border space-y-4 min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ruler className="h-4 w-4 text-primary" />
              {t('addProgressModal.measurements')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="chest">{t('addProgressModal.chest')}</Label>
                <Input id="chest" type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} placeholder="100" className="w-full bg-card border-border" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="waist">{t('addProgressModal.waist')}</Label>
                <Input id="waist" type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="80" className="w-full bg-card border-border" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="hips">{t('addProgressModal.hips')}</Label>
                <Input id="hips" type="number" step="0.1" value={hips} onChange={(e) => setHips(e.target.value)} placeholder="95" className="w-full bg-card border-border" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="arms">{t('addProgressModal.arms')}</Label>
                <Input id="arms" type="number" step="0.1" value={arms} onChange={(e) => setArms(e.target.value)} placeholder="35" className="w-full bg-card border-border" />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="legs">{t('addProgressModal.legs')}</Label>
                <Input id="legs" type="number" step="0.1" value={legs} onChange={(e) => setLegs(e.target.value)} placeholder="55" className="w-full bg-card border-border" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 min-w-0">
            <Label htmlFor="notes">{t('addProgressModal.notes')}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('addProgressModal.notesPlaceholder')} className="w-full bg-background border-border resize-none" rows={3} />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('addProgressModal.cancel')}
            </Button>
            <Button type="submit" disabled={addProgressMutation.isPending || !clientId}>
              {addProgressMutation.isPending ? t('addProgressModal.saving') : t('addProgressModal.saveProgress')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
