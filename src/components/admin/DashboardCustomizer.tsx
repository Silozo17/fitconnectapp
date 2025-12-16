import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useAdminWidgets, 
  useUpdateWidget, 
  useResetWidgets,
  WIDGET_TYPES,
  DashboardWidget 
} from "@/hooks/useAdminWidgets";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { data: widgets, isLoading } = useAdminWidgets();
  const updateWidget = useUpdateWidget();
  const resetWidgets = useResetWidgets();

  const handleToggleWidget = async (widget: DashboardWidget) => {
    try {
      await updateWidget.mutateAsync({
        widgetId: widget.id,
        updates: { is_visible: !widget.is_visible },
      });
      toast.success(`Widget ${widget.is_visible ? "hidden" : "shown"}`);
    } catch (error) {
      toast.error("Failed to update widget");
    }
  };

  const handleReset = async () => {
    try {
      await resetWidgets.mutateAsync();
      toast.success("Dashboard reset to defaults");
    } catch (error) {
      toast.error("Failed to reset dashboard");
    }
  };

  const widgetsByCategory = Object.entries(WIDGET_TYPES).reduce((acc, [type, config]) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push({ type, ...config });
    return acc;
  }, {} as Record<string, { type: string; label: string; category: string; icon: string }[]>);

  const getWidgetState = (type: string) => {
    return widgets?.find(w => w.widget_type === type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold capitalize">{category}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {categoryWidgets.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {categoryWidgets.map(({ type, label }) => {
                    const widgetState = getWidgetState(type);
                    const isVisible = widgetState?.is_visible ?? true;

                    return (
                      <div 
                        key={type}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <Label htmlFor={type} className="cursor-pointer">
                          {label}
                        </Label>
                        <Switch
                          id={type}
                          checked={isVisible}
                          onCheckedChange={() => widgetState && handleToggleWidget(widgetState)}
                          disabled={!widgetState || updateWidget.isPending}
                        />
                      </div>
                    );
                  })}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={resetWidgets.isPending}
          >
            {resetWidgets.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
