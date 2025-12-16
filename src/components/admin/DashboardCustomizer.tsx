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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAdminWidgets, 
  useUpdateWidget, 
  useAddWidget,
  useResetWidgets,
  WIDGET_TYPES,
  WIDGET_CATEGORIES,
  DashboardWidget 
} from "@/hooks/useAdminWidgets";
import { toast } from "sonner";
import { RotateCcw, Loader2, BarChart3, DollarSign, TrendingUp, LineChart, Link2, List, Zap } from "lucide-react";

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  stats: BarChart3,
  revenue: DollarSign,
  analytics: TrendingUp,
  charts: LineChart,
  integrations: Link2,
  lists: List,
  actions: Zap,
};

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { data: widgets, isLoading } = useAdminWidgets();
  const updateWidget = useUpdateWidget();
  const addWidget = useAddWidget();
  const resetWidgets = useResetWidgets();
  const [activeCategory, setActiveCategory] = useState<string>("stats");

  const handleToggleWidget = async (type: string, widgetState: DashboardWidget | undefined) => {
    const currentlyVisible = widgetState?.is_visible ?? false;
    
    try {
      if (widgetState) {
        await updateWidget.mutateAsync({
          widgetId: widgetState.id,
          updates: { is_visible: !widgetState.is_visible },
        });
        toast.success(`Widget ${widgetState.is_visible ? "hidden" : "shown"}`);
      } else {
        const widgetConfig = WIDGET_TYPES[type as keyof typeof WIDGET_TYPES];
        await addWidget.mutateAsync({
          widget_type: type,
          title: widgetConfig.label,
          position: Object.keys(WIDGET_TYPES).indexOf(type),
          size: "medium",
          is_visible: !currentlyVisible,
          config: {},
        });
        toast.success(`Widget ${currentlyVisible ? "hidden" : "shown"}`);
      }
    } catch (error) {
      toast.error("Failed to update widget");
    }
  };

  const handleSizeChange = async (type: string, widgetState: DashboardWidget | undefined, size: string) => {
    try {
      if (widgetState) {
        await updateWidget.mutateAsync({
          widgetId: widgetState.id,
          updates: { size: size as DashboardWidget["size"] },
        });
      } else {
        const widgetConfig = WIDGET_TYPES[type as keyof typeof WIDGET_TYPES];
        await addWidget.mutateAsync({
          widget_type: type,
          title: widgetConfig.label,
          position: Object.keys(WIDGET_TYPES).indexOf(type),
          size: size as DashboardWidget["size"],
          is_visible: true,
          config: {},
        });
      }
      toast.success("Widget size updated");
    } catch (error) {
      toast.error("Failed to update widget size");
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

  const getCategoryCount = (category: string) => {
    const categoryWidgets = widgetsByCategory[category] || [];
    const visibleCount = categoryWidgets.filter(w => {
      const state = getWidgetState(w.type);
      return state?.is_visible ?? false;
    }).length;
    return { visible: visibleCount, total: categoryWidgets.length };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display and configure their size
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {WIDGET_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.key] || BarChart3;
              const count = getCategoryCount(cat.key);
              return (
                <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1 text-xs">
                  <Icon className="h-3 w-3" />
                  <span className="hidden lg:inline">{cat.label.split(" ")[0]}</span>
                  <Badge variant="secondary" className="h-4 w-4 p-0 text-[10px] justify-center">
                    {count.visible}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="h-[400px] mt-4 pr-4">
            {WIDGET_CATEGORIES.map((cat) => (
              <TabsContent key={cat.key} value={cat.key} className="mt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{cat.label}</h3>
                    <Badge variant="outline">
                      {getCategoryCount(cat.key).visible}/{getCategoryCount(cat.key).total} visible
                    </Badge>
                  </div>
                  <Separator />
                  
                  {(widgetsByCategory[cat.key] || []).map(({ type, label }) => {
                    const widgetState = getWidgetState(type);
                    const isVisible = widgetState?.is_visible ?? false;
                    const currentSize = widgetState?.size || "medium";

                    return (
                      <div 
                        key={type}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Switch
                            id={type}
                            checked={isVisible}
                            onCheckedChange={() => handleToggleWidget(type, widgetState)}
                            disabled={updateWidget.isPending || addWidget.isPending}
                          />
                          <Label htmlFor={type} className="cursor-pointer truncate">
                            {label}
                          </Label>
                        </div>
                        
                        <Select
                          value={currentSize}
                          onValueChange={(size) => handleSizeChange(type, widgetState, size)}
                          disabled={updateWidget.isPending || addWidget.isPending}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        <Separator />

        <div className="flex justify-between">
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
