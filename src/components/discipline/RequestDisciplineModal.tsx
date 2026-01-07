/**
 * RequestDisciplineModal - Request a new discipline
 */

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDisciplineRequest } from "@/hooks/useDisciplineRequest";

interface RequestDisciplineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDisciplineModal({ open, onOpenChange }: RequestDisciplineModalProps) {
  const { submitRequest, isSubmitting } = useDisciplineRequest();
  const [disciplineName, setDisciplineName] = useState("");
  const [requestedMetrics, setRequestedMetrics] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit() {
    if (!disciplineName.trim()) return;

    submitRequest(
      {
        disciplineName: disciplineName.trim(),
        requestedMetrics: requestedMetrics.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onOpenChange(false);
            setDisciplineName("");
            setRequestedMetrics("");
          }, 2000);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Request a Discipline
          </DialogTitle>
          <DialogDescription>
            Can't find your sport? Let us know and we'll consider adding it.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in-50">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-medium">Request Submitted!</p>
            <p className="text-sm text-muted-foreground">We'll review it soon</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline Name *</Label>
                <Input
                  id="discipline"
                  placeholder="e.g., Judo, Rock Climbing, Rowing"
                  value={disciplineName}
                  onChange={(e) => setDisciplineName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metrics">
                  What metrics would you track? <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="metrics"
                  placeholder="e.g., Sessions per week, belt progression, competition results, max rep counts..."
                  value={requestedMetrics}
                  onChange={(e) => setRequestedMetrics(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!disciplineName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
