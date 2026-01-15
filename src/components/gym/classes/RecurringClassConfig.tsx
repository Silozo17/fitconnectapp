import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Repeat } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Su" },
  { value: 1, label: "Monday", short: "Mo" },
  { value: 2, label: "Tuesday", short: "Tu" },
  { value: 3, label: "Wednesday", short: "We" },
  { value: 4, label: "Thursday", short: "Th" },
  { value: 5, label: "Friday", short: "Fr" },
  { value: 6, label: "Saturday", short: "Sa" },
];

export interface RecurringConfig {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  daysOfWeek: number[];
  endType: "never" | "date" | "occurrences";
  endDate?: string;
  occurrences?: number;
  timeOfDay: string; // HH:mm format
  durationMinutes: number; // Class duration in minutes
}

interface RecurringClassConfigProps {
  config: RecurringConfig;
  onChange: (config: RecurringConfig) => void;
}

export function RecurringClassConfig({ config, onChange }: RecurringClassConfigProps) {
  const handleDayToggle = (day: number) => {
    const current = config.daysOfWeek || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    onChange({ ...config, daysOfWeek: updated });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Recurring Schedule
        </CardTitle>
        <CardDescription>
          Set up when this class repeats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency */}
        <div className="space-y-2">
          <Label>Repeat</Label>
          <Select
            value={config.frequency}
            onValueChange={(value) =>
              onChange({
                ...config,
                frequency: value as RecurringConfig["frequency"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Days of Week (for weekly/biweekly) */}
        {(config.frequency === "weekly" || config.frequency === "biweekly") && (
          <div className="space-y-2">
            <Label>On These Days</Label>
            <div className="flex gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
                    config.daysOfWeek?.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time-of-day" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Start Time
            </Label>
            <Input
              id="time-of-day"
              type="time"
              value={config.timeOfDay}
              onChange={(e) => onChange({ ...config, timeOfDay: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={config.durationMinutes?.toString() || "60"}
              onValueChange={(value) => onChange({ ...config, durationMinutes: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* End Condition */}
        <div className="space-y-2">
          <Label>Ends</Label>
          <Select
            value={config.endType}
            onValueChange={(value) =>
              onChange({
                ...config,
                endType: value as RecurringConfig["endType"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="date">On Date</SelectItem>
              <SelectItem value="occurrences">After Occurrences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.endType === "date" && (
          <div className="space-y-2">
            <Label htmlFor="end-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={config.endDate || ""}
              onChange={(e) => onChange({ ...config, endDate: e.target.value })}
            />
          </div>
        )}

        {config.endType === "occurrences" && (
          <div className="space-y-2">
            <Label htmlFor="occurrences">Number of Classes</Label>
            <Input
              id="occurrences"
              type="number"
              min={1}
              max={52}
              value={config.occurrences || 12}
              onChange={(e) =>
                onChange({ ...config, occurrences: parseInt(e.target.value) || 12 })
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
