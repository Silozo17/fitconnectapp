/**
 * DisciplineLogModal - Log multiple metrics at once
 */

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DisciplineConfig } from "@/config/disciplines/types";
import { useDisciplineEvents, DisciplineEventInput } from "@/hooks/useDisciplineEvents";

interface DisciplineLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DisciplineConfig;
}

interface MetricInput {
  id: string;
  label: string;
  eventType: string;
  enabled: boolean;
  value: string;
  placeholder: string;
}

export function DisciplineLogModal({ open, onOpenChange, config }: DisciplineLogModalProps) {
  const { logEvents, isLogging } = useDisciplineEvents(config.id);
  const [date, setDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Initialize metric inputs from config
  const [metricInputs, setMetricInputs] = useState<MetricInput[]>(() => 
    config.metrics
      .filter(m => m.sources.manualEventType)
      .map(m => ({
        id: m.id,
        label: m.label,
        eventType: m.sources.manualEventType!,
        enabled: false,
        value: '',
        placeholder: getPlaceholder(m.formatter),
      }))
  );

  // Add milestone as loggable item
  const [milestoneInput, setMilestoneInput] = useState({
    enabled: false,
    value: '',
  });

  function getPlaceholder(formatter: string): string {
    switch (formatter) {
      case 'sessions': return '1';
      case 'rounds': return '5';
      case 'min': return '30';
      case 'kg': return '100';
      case 'km': return '5.0';
      default: return '0';
    }
  }

  function toggleMetric(id: string) {
    setMetricInputs(prev => 
      prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
    );
  }

  function updateMetricValue(id: string, value: string) {
    setMetricInputs(prev => 
      prev.map(m => m.id === id ? { ...m, value } : m)
    );
  }

  async function handleSubmit() {
    const events: DisciplineEventInput[] = [];

    // Collect enabled metrics
    for (const input of metricInputs) {
      if (input.enabled && input.value) {
        events.push({
          disciplineId: config.id,
          eventType: input.eventType,
          value: parseFloat(input.value) || 0,
          recordedAt: date,
        });
      }
    }

    // Add milestone if enabled
    if (milestoneInput.enabled && milestoneInput.value) {
      events.push({
        disciplineId: config.id,
        eventType: config.milestone.eventType,
        value: 0,
        label: milestoneInput.value,
        recordedAt: date,
      });
    }

    if (events.length > 0) {
      logEvents(events, {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            onOpenChange(false);
            // Reset form
            setMetricInputs(prev => prev.map(m => ({ ...m, enabled: false, value: '' })));
            setMilestoneInput({ enabled: false, value: '' });
          }, 1000);
        },
      });
    }
  }

  const enabledCount = metricInputs.filter(m => m.enabled).length + (milestoneInput.enabled ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log {config.name}
          </DialogTitle>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in-50">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-medium">Logged!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Metrics Toggle List */}
              <div className="space-y-3">
                <Label>What to log</Label>
                
                {metricInputs.map((input) => (
                  <div 
                    key={input.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      input.enabled ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{input.label}</span>
                      <Switch
                        checked={input.enabled}
                        onCheckedChange={() => toggleMetric(input.id)}
                      />
                    </div>
                    
                    {input.enabled && (
                      <Input
                        type="number"
                        placeholder={input.placeholder}
                        value={input.value}
                        onChange={(e) => updateMetricValue(input.id, e.target.value)}
                        className="mt-2"
                        autoFocus
                      />
                    )}
                  </div>
                ))}

                {/* Milestone Input */}
                <div 
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    milestoneInput.enabled ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{config.milestone.label}</span>
                    <Switch
                      checked={milestoneInput.enabled}
                      onCheckedChange={(checked) => setMilestoneInput(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  
                  {milestoneInput.enabled && (
                    <Input
                      type="text"
                      placeholder={getMilestonePlaceholder(config.milestone.type)}
                      value={milestoneInput.value}
                      onChange={(e) => setMilestoneInput(prev => ({ ...prev, value: e.target.value }))}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={enabledCount === 0 || isLogging}
              >
                {isLogging ? 'Saving...' : `Log ${enabledCount} item${enabledCount !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getMilestonePlaceholder(type: string): string {
  switch (type) {
    case 'belt': return 'e.g., Blue Belt';
    case 'pb': return 'e.g., 120kg';
    case 'raceTime': return 'e.g., 23:45';
    case 'fightRecord': return 'e.g., 3-1-0';
    case 'date': return 'e.g., First bout completed';
    default: return 'Enter value';
  }
}
