import { useState } from "react";
import { useMyProgress, useLogProgress } from "@/hooks/gym/useGymMemberPortal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { TrendingUp, Plus, Scale, Percent, Ruler, FileText } from "lucide-react";

export function MemberProgress() {
  const { data: progress, isLoading } = useMyProgress();
  const logProgress = useLogProgress();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: "",
    body_fat_percentage: "",
    notes: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const measurements: Record<string, number> = {};
    Object.entries(formData.measurements).forEach(([key, val]) => {
      if (val) measurements[key] = parseFloat(val);
    });

    await logProgress.mutateAsync({
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : undefined,
      notes: formData.notes || undefined,
      measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
    });

    setFormData({
      weight_kg: "",
      body_fat_percentage: "",
      notes: "",
      measurements: { chest: "", waist: "", hips: "", arms: "", thighs: "" },
    });
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Tracking
          </CardTitle>
          <CardDescription>Track your fitness journey</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Body Fat %
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="15.0"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, body_fat_percentage: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Measurements (cm)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(formData.measurements).map(([key, value]) => (
                    <Input
                      key={key}
                      type="number"
                      step="0.1"
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        measurements: { ...prev.measurements, [key]: e.target.value }
                      }))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </Label>
                <Textarea
                  placeholder="How are you feeling? Any observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={logProgress.isPending}>
                {logProgress.isPending ? "Saving..." : "Save Progress"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {progress && progress.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {progress.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.recorded_at), "EEEE, MMMM d, yyyy")}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {entry.weight_kg && (
                            <div className="flex items-center gap-1">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{entry.weight_kg} kg</span>
                            </div>
                          )}
                          {entry.body_fat_percentage && (
                            <div className="flex items-center gap-1">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{entry.body_fat_percentage}%</span>
                            </div>
                          )}
                        </div>
                        {entry.measurements && Object.keys(entry.measurements as object).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(entry.measurements as Record<string, number>).map(([key, val]) => (
                              <span key={key} className="text-xs bg-muted px-2 py-1 rounded">
                                {key}: {val}cm
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No progress logged yet</p>
            <p className="text-sm">Start tracking your fitness journey</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
