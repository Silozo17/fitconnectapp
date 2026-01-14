import { useState } from "react";
import { useMyGoals, useCreateGoal, useUpdateGoal } from "@/hooks/gym/useGymMemberPortal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Target, Plus, CheckCircle, Clock, XCircle } from "lucide-react";

export function MemberGoals() {
  const { data: goals, isLoading } = useMyGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_value: "",
    unit: "",
    target_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await createGoal.mutateAsync({
      title: formData.title,
      description: formData.description || null,
      goal_type: "custom",
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      current_value: null,
      unit: formData.unit || null,
      start_date: new Date().toISOString(),
      target_date: formData.target_date || null,
    });

    setFormData({
      title: "",
      description: "",
      target_value: "",
      unit: "",
      target_date: "",
    });
    setDialogOpen(false);
  };

  const handleStatusUpdate = async (goalId: string, status: "active" | "completed" | "abandoned") => {
    await updateGoal.mutateAsync({ id: goalId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "abandoned":
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Abandoned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            <Target className="h-5 w-5" />
            Fitness Goals
          </CardTitle>
          <CardDescription>Set and track your goals</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Title *</Label>
                <Input
                  placeholder="e.g., Lose 5kg, Run 5k, etc."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your goal in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5"
                    value={formData.target_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="e.g., kg, km, reps"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createGoal.isPending}>
                {createGoal.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goals && goals.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {goals.map((goal) => {
                const progressPercent = goal.target_value && goal.current_value
                  ? Math.min(100, (goal.current_value / goal.target_value) * 100)
                  : 0;

                return (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            {getStatusBadge(goal.status)}
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          )}
                          {goal.target_value && (
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress: {goal.current_value || 0} / {goal.target_value} {goal.unit}</span>
                                <span>{Math.round(progressPercent)}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                          )}
                          {goal.target_date && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Target: {format(new Date(goal.target_date), "MMMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        {goal.status === "active" && (
                          <Select onValueChange={(value) => handleStatusUpdate(goal.id, value as "completed" | "abandoned")}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Complete</SelectItem>
                              <SelectItem value="abandoned">Abandon</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No goals set yet</p>
            <p className="text-sm">Create your first fitness goal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
