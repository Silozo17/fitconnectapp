/**
 * DisciplineLogModal - Log multiple metrics at once with sport-specific inputs
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Check, Trophy } from "lucide-react";
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
import { DisciplineConfig, BeltValue, FightRecordValue, RaceTimeValue, SkillChecklistValue, BeltConfig } from "@/config/disciplines/types";
import { DISCIPLINE_DETAIL_CONFIGS } from "@/config/disciplines/detailConfigs";
import { useDisciplineEvents, DisciplineEventInput } from "@/hooks/useDisciplineEvents";
import { BeltWithStripesInput } from "./inputs/BeltWithStripesInput";
import { FightRecordInput } from "./inputs/FightRecordInput";
import { RaceTimeInput } from "./inputs/RaceTimeInput";
import { PBWeightInput } from "./inputs/PBWeightInput";
import { SkillChecklistInput } from "./inputs/SkillChecklistInput";
import { DropdownInput } from "./inputs/DropdownInput";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MilestoneValue = any;

// Type guards for options
function isBeltConfig(options: unknown): options is BeltConfig {
  return options !== undefined && 
    typeof options === 'object' && 
    options !== null && 
    'belts' in options && 
    'stripeColor' in options;
}

function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

export function DisciplineLogModal({ open, onOpenChange, config }: DisciplineLogModalProps) {
  const { logEvents, isLogging } = useDisciplineEvents(config.id);
  const [date, setDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  
  const detailConfig = DISCIPLINE_DETAIL_CONFIGS[config.id];
  const milestoneFieldConfig = detailConfig?.milestoneFields?.[0];
  
  // Initialize metric inputs from config (filter out computed metrics)
  const [metricInputs, setMetricInputs] = useState<MetricInput[]>(() => 
    config.metrics
      .filter(m => m.sources.manualEventType && !m.computed)
      .map(m => ({
        id: m.id,
        label: m.label,
        eventType: m.sources.manualEventType!,
        enabled: false,
        value: '',
        placeholder: getPlaceholder(m.formatter),
      }))
  );

  // Sport-specific milestone input
  const [milestoneEnabled, setMilestoneEnabled] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState<MilestoneValue>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setMetricInputs(prev => prev.map(m => ({ ...m, enabled: false, value: '' })));
      setMilestoneEnabled(false);
      setMilestoneValue(null);
      setDate(new Date());
    }
  }, [open]);

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

  function serializeMilestoneValue(value: MilestoneValue): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
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

    // Add milestone if enabled with sport-specific data
    if (milestoneEnabled && milestoneValue) {
      events.push({
        disciplineId: config.id,
        eventType: config.milestone.eventType,
        value: 0,
        label: serializeMilestoneValue(milestoneValue),
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
          }, 1000);
        },
      });
    }
  }

  const enabledCount = metricInputs.filter(m => m.enabled).length + (milestoneEnabled ? 1 : 0);

  // Render sport-specific milestone input
  function renderMilestoneInput() {
    if (!milestoneFieldConfig) {
      // Fallback to generic text input
      return (
        <Input
          type="text"
          placeholder={getMilestonePlaceholder(config.milestone.type)}
          value={typeof milestoneValue === 'string' ? milestoneValue : ''}
          onChange={(e) => setMilestoneValue(e.target.value)}
          className="mt-2"
        />
      );
    }

    const options = milestoneFieldConfig.options;

    switch (milestoneFieldConfig.type) {
      case 'belt_with_stripes':
        if (isBeltConfig(options)) {
          return (
            <div className="mt-3">
              <BeltWithStripesInput
                value={milestoneValue as BeltValue | null}
                onChange={setMilestoneValue}
                config={options}
              />
            </div>
          );
        }
        break;

      case 'fight_record':
        return (
          <div className="mt-3">
            <FightRecordInput
              value={milestoneValue as FightRecordValue | null}
              onChange={setMilestoneValue}
            />
          </div>
        );

      case 'race_time': {
        const rawFormat = options && typeof options === 'object' && hasProperty(options, 'format') 
          ? String(options.format) : 'mm:ss';
        const validFormat = ['mm:ss', 'hh:mm:ss', 'mm:ss.ms'].includes(rawFormat) 
          ? rawFormat as 'mm:ss' | 'hh:mm:ss' | 'mm:ss.ms' 
          : 'mm:ss';
        return (
          <div className="mt-3">
            <RaceTimeInput
              value={milestoneValue as RaceTimeValue | null}
              onChange={setMilestoneValue}
              label={milestoneFieldConfig.label}
              format={validFormat}
            />
          </div>
        );
      }

      case 'pb_weight': {
        const unitVal = options && typeof options === 'object' && hasProperty(options, 'unit')
          ? String(options.unit) : 'kg';
        return (
          <div className="mt-3">
            <PBWeightInput
              value={milestoneValue}
              onChange={setMilestoneValue}
              label={milestoneFieldConfig.label}
              unit={unitVal}
            />
          </div>
        );
      }

      case 'skill_checklist': {
        const skillsVal = options && typeof options === 'object' && hasProperty(options, 'skills')
          ? (options.skills as string[]) : [];
        return (
          <div className="mt-3">
            <SkillChecklistInput
              value={milestoneValue as SkillChecklistValue | null}
              onChange={setMilestoneValue}
              skills={skillsVal}
            />
          </div>
        );
      }

      case 'dropdown': {
        const choicesVal = options && typeof options === 'object' && hasProperty(options, 'choices')
          ? (options.choices as string[]) : [];
        return (
          <div className="mt-3">
            <DropdownInput
              value={typeof milestoneValue === 'string' ? milestoneValue : ''}
              onChange={setMilestoneValue}
              choices={choicesVal}
              placeholder="Select..."
            />
          </div>
        );
      }
    }

    // Default fallback
    return (
      <Input
        type="text"
        placeholder={getMilestonePlaceholder(config.milestone.type)}
        value={typeof milestoneValue === 'string' ? milestoneValue : ''}
        onChange={(e) => setMilestoneValue(e.target.value)}
        className="mt-2"
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
                    <div className="flex items-center justify-between">
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

                {/* Sport-Specific Milestone Input */}
                <div 
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    milestoneEnabled ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-sm">{config.milestone.label}</span>
                    </div>
                    <Switch
                      checked={milestoneEnabled}
                      onCheckedChange={setMilestoneEnabled}
                    />
                  </div>
                  
                  {milestoneEnabled && renderMilestoneInput()}
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
