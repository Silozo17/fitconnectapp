import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExcludedDate {
  date: string;
  reason: string;
  addedAt?: string;
}

interface ClassInfo {
  id: string;
  parent_class_id?: string | null;
  is_recurring_template?: boolean;
  excluded_dates?: ExcludedDate[];
  class_type?: {
    name: string;
  };
}

interface ManageBreaksDialogProps {
  classInfo: ClassInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageBreaksDialog({
  classInfo,
  open,
  onOpenChange,
}: ManageBreaksDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const queryClient = useQueryClient();

  // Get the template class (either this one if it's a template, or fetch parent)
  const templateId = classInfo?.is_recurring_template 
    ? classInfo.id 
    : classInfo?.parent_class_id;

  const { data: templateClass, isLoading } = useQuery({
    queryKey: ["gym-class-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from("gym_classes")
        .select("id, excluded_dates, gym_class_types(name)")
        .eq("id", templateId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!templateId && open,
  });

  const excludedDates: ExcludedDate[] = (templateClass?.excluded_dates as unknown as ExcludedDate[]) || [];

  const addBreak = useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason: string }) => {
      if (!templateId) throw new Error("No template class found");

      const newExclusion: ExcludedDate = {
        date,
        reason,
        addedAt: new Date().toISOString(),
      };

      const updatedExclusions = [...excludedDates, newExclusion];

      const { error } = await supabase
        .from("gym_classes")
        .update({ excluded_dates: updatedExclusions as unknown as any })
        .eq("id", templateId);

      if (error) throw error;

      // Also cancel any existing class on that date
      const { data: existingClass } = await supabase
        .from("gym_classes")
        .select("id")
        .eq("parent_class_id", templateId)
        .gte("start_time", `${date}T00:00:00`)
        .lte("start_time", `${date}T23:59:59`)
        .maybeSingle();

      if (existingClass) {
        // Cancel via the edge function to handle notifications
        const { data: session } = await supabase.auth.getSession();
        await supabase.functions.invoke("gym-cancel-class", {
          body: {
            classId: existingClass.id,
            reason: `Break added: ${reason}`,
            scope: "single",
            notifyMembers: true,
          },
          headers: {
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        });
      }

      return updatedExclusions;
    },
    onSuccess: () => {
      toast.success("Break added successfully");
      queryClient.invalidateQueries({ queryKey: ["gym-class-template", templateId] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
      setSelectedDate(undefined);
      setReason("");
      setIsAddingBreak(false);
    },
    onError: (error) => {
      console.error("Failed to add break:", error);
      toast.error("Failed to add break");
    },
  });

  const removeBreak = useMutation({
    mutationFn: async (dateToRemove: string) => {
      if (!templateId) throw new Error("No template class found");

      const updatedExclusions = excludedDates.filter(e => e.date !== dateToRemove);

      const { error } = await supabase
        .from("gym_classes")
        .update({ excluded_dates: updatedExclusions as unknown as any })
        .eq("id", templateId);

      if (error) throw error;
      return updatedExclusions;
    },
    onSuccess: () => {
      toast.success("Break removed");
      queryClient.invalidateQueries({ queryKey: ["gym-class-template", templateId] });
      queryClient.invalidateQueries({ queryKey: ["gym-classes"] });
    },
    onError: (error) => {
      console.error("Failed to remove break:", error);
      toast.error("Failed to remove break");
    },
  });

  if (!classInfo) return null;

  const handleAddBreak = () => {
    if (!selectedDate || !reason.trim()) return;
    addBreak.mutate({
      date: format(selectedDate, "yyyy-MM-dd"),
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Breaks</DialogTitle>
          <DialogDescription>
            Add breaks for holidays, emergencies, or other dates when this recurring class should not run.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Breaks */}
          <div className="space-y-3">
            <Label>Current Breaks</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : excludedDates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border rounded-md border-dashed">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No breaks scheduled</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {excludedDates
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((exclusion) => (
                      <div
                        key={exclusion.date}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(parseISO(exclusion.date), "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">{exclusion.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBreak.mutate(exclusion.date)}
                          disabled={removeBreak.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Add New Break */}
          {isAddingBreak ? (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="break-reason">Reason</Label>
                <Input
                  id="break-reason"
                  placeholder="e.g., Bank Holiday, Christmas Break..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddingBreak(false);
                    setSelectedDate(undefined);
                    setReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddBreak}
                  disabled={!selectedDate || !reason.trim() || addBreak.isPending}
                >
                  {addBreak.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Add Break
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingBreak(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Break
            </Button>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
            <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Adding a break will automatically cancel any existing class on that date and notify booked members.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
