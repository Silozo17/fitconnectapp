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
  useCoachWidgets,
  useUpdateCoachWidget,
  useAddCoachWidget,
  useResetCoachWidgets,
  COACH_WIDGET_TYPES,
  COACH_WIDGET_CATEGORIES,
  CoachDashboardWidget,
} from "@/hooks/useCoachWidgets";
import { getFormatOptionsForWidget, supportsFormatSelection, SIZE_OPTIONS, type WidgetDisplayFormat } from "@/lib/widget-formats";
import { toast } from "sonner";
import { RotateCcw, Loader2, BarChart3, DollarSign, List, Users, Zap } from "lucide-react";

interface CoachDashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  stats: BarChart3,
  business: DollarSign,
  lists: List,
  engagement: Users,
  actions: Zap,
};

export function CoachDashboardCustomizer({ open, onOpenChange }: CoachDashboardCustomizerProps) {
  const { data: widgets, isLoading } = useCoachWidgets();
  const updateWidget = useUpdateCoachWidget();
  const addWidget = useAddCoachWidget();
  const resetWidgets = useResetCoachWidgets();
  const [activeCategory, setActiveCategory] = useState<string>("stats");

  const handleToggleWidget = async (type: string, widgetState: CoachDashboardWidget | undefined) => {
    const currentlyVisible = widgetState?.is_visible ?? false;
    
    try {
      if (widgetState) {
        await updateWidget.mutateAsync({
          widgetId: widgetState.id,
          updates: { is_visible: !widgetState.is_visible },
        });
        toast.success(`Widget ${widgetState.is_visible ? "hidden" : "shown"}`);
      } else {
        const widgetConfig = COACH_WIDGET_TYPES[type as keyof typeof COACH_WIDGET_TYPES];
        await addWidget.mutateAsync({
          widget_type: type,
          title: widgetConfig.label,
          position: Object.keys(COACH_WIDGET_TYPES).indexOf(type),
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

  const handleSizeChange = async (type: string, widgetState: CoachDashboardWidget | undefined, size: string) => {
    try {
      if (widgetState) {
        await updateWidget.mutateAsync({
          widgetId: widgetState.id,
          updates: { size: size as CoachDashboardWidget["size"] },
        });
      } else {
        const widgetConfig = COACH_WIDGET_TYPES[type as keyof typeof COACH_WIDGET_TYPES];
        await addWidget.mutateAsync({
          widget_type: type,
          title: widgetConfig.label,
          position: Object.keys(COACH_WIDGET_TYPES).indexOf(type),
          size: size as CoachDashboardWidget["size"],
          is_visible: true,
          config: {},
        });
      }
      toast.success("Widget size updated");
    } catch (error) {
      toast.error("Failed to update widget size");
    }
  };

  const handleFormatChange = async (type: string, widgetState: CoachDashboardWidget | undefined, format: WidgetDisplayFormat) => {
    try {
      if (widgetState) {
        await updateWidget.mutateAsync({
          widgetId: widgetState.id,
          updates: { config: { ...widgetState.config, displayFormat: format } },
        });
      } else {
        const widgetConfig = COACH_WIDGET_TYPES[type as keyof typeof COACH_WIDGET_TYPES];
        await addWidget.mutateAsync({
          widget_type: type,
          title: widgetConfig.label,
          position: Object.keys(COACH_WIDGET_TYPES).indexOf(type),
          size: "medium",
          is_visible: true,
          config: { displayFormat: format },
        });
      }
      toast.success("Display format updated");
    } catch (error) {
      toast.error("Failed to update display format");
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

  const widgetsByCategory = Object.entries(COACH_WIDGET_TYPES).reduce((acc, [type, config]) => {
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
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display, their size, and how data is visualized
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 min-h-0">
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 gap-1">
              {COACH_WIDGET_CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat.key] || BarChart3;
                const count = getCategoryCount(cat.key);
                return (
                  <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1 text-xs whitespace-nowrap px-2 sm:px-3">
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="hidden sm:inline">{cat.label.split(" ")[0]}</span>
                    <Badge variant="secondary" className="h-4 min-w-[16px] px-1 text-[10px] justify-center">
                      {count.visible}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <ScrollArea className="h-[300px] sm:h-[400px] mt-4 pr-2 sm:pr-4">
            {COACH_WIDGET_CATEGORIES.map((cat) => (
              <TabsContent key={cat.key} value={cat.key} className="mt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">{cat.label}</h3>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryCount(cat.key).visible}/{getCategoryCount(cat.key).total}
                    </Badge>
                  </div>
                  <Separator />
                  
                  {(widgetsByCategory[cat.key] || []).map(({ type, label, category }) => {
                    const widgetState = getWidgetState(type);
                    const isVisible = widgetState?.is_visible ?? false;
                    const currentSize = widgetState?.size || "medium";
                    const currentFormat = (widgetState?.config?.displayFormat as WidgetDisplayFormat) || "number";
                    const formatOptions = getFormatOptionsForWidget(category);
                    const hasFormatOptions = supportsFormatSelection(category);
                    const currentSizeOption = SIZE_OPTIONS.find(s => s.value === currentSize);
                    const currentFormatOption = formatOptions.find(f => f.value === currentFormat);

                    return (
                      <div 
                        key={type}
                        className="flex flex-col p-3 rounded-lg glass-item gap-3"
                      >
                        {/* Row 1: Toggle + Widget Name */}
                        <div className="flex items-center gap-3">
                          <Switch
                            id={type}
                            checked={isVisible}
                            onCheckedChange={() => handleToggleWidget(type, widgetState)}
                            disabled={updateWidget.isPending || addWidget.isPending}
                            className="shrink-0"
                          />
                          <Label htmlFor={type} className="cursor-pointer text-sm font-medium flex-1 min-w-0 truncate">
                            {label}
                          </Label>
                        </div>
                        
                        {/* Row 2: Select Controls - aligned under widget name */}
                        <div className="flex items-center gap-2 ml-[52px]">
                          {hasFormatOptions && (
                            <Select
                              value={currentFormat}
                              onValueChange={(format) => handleFormatChange(type, widgetState, format as WidgetDisplayFormat)}
                              disabled={updateWidget.isPending || addWidget.isPending}
                            >
                              <SelectTrigger className="w-[90px] h-9 text-xs">
                                <SelectValue>
                                  <span className="sm:hidden">{currentFormatOption?.shortLabel || currentFormat}</span>
                                  <span className="hidden sm:inline">{currentFormatOption?.label || currentFormat}</span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {formatOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                    <span className="sm:hidden">{opt.shortLabel}</span>
                                    <span className="hidden sm:inline">{opt.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          <Select
                            value={currentSize}
                            onValueChange={(size) => handleSizeChange(type, widgetState, size)}
                            disabled={updateWidget.isPending || addWidget.isPending}
                          >
                            <SelectTrigger className="w-[80px] h-9 text-xs">
                              <SelectValue>
                                <span className="sm:hidden">{currentSizeOption?.shortLabel || currentSize}</span>
                                <span className="hidden sm:inline">{currentSizeOption?.label || currentSize}</span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {SIZE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                  <span className="sm:hidden">{opt.shortLabel}</span>
                                  <span className="hidden sm:inline">{opt.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>

        <Separator />

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={resetWidgets.isPending}
            className="w-full sm:w-auto"
          >
            {resetWidgets.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
