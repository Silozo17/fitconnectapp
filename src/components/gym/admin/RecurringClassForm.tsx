import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Repeat } from "lucide-react";

interface RecurringPattern {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  days_of_week?: number[]; // 0 = Sunday, 6 = Saturday
  end_date?: string;
  occurrences?: number;
}

interface RecurringClassFormProps {
  value: RecurringPattern | null;
  onChange: (pattern: RecurringPattern | null) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function RecurringClassForm({ value, onChange, disabled }: RecurringClassFormProps) {
  const [isRecurring, setIsRecurring] = useState(!!value);
  const [pattern, setPattern] = useState<RecurringPattern>(
    value || { frequency: "weekly", days_of_week: [] }
  );
  const [endType, setEndType] = useState<"never" | "date" | "occurrences">(
    value?.end_date ? "date" : value?.occurrences ? "occurrences" : "never"
  );

  const handleRecurringToggle = (checked: boolean) => {
    setIsRecurring(checked);
    if (!checked) {
      onChange(null);
    } else {
      onChange(pattern);
    }
  };

  const updatePattern = (updates: Partial<RecurringPattern>) => {
    const newPattern = { ...pattern, ...updates };
    setPattern(newPattern);
    if (isRecurring) {
      onChange(newPattern);
    }
  };

  const toggleDay = (day: number) => {
    const currentDays = pattern.days_of_week || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    updatePattern({ days_of_week: newDays });
  };

  const handleEndTypeChange = (type: "never" | "date" | "occurrences") => {
    setEndType(type);
    if (type === "never") {
      updatePattern({ end_date: undefined, occurrences: undefined });
    } else if (type === "date") {
      updatePattern({ occurrences: undefined });
    } else {
      updatePattern({ end_date: undefined });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Recurring Class</CardTitle>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={handleRecurringToggle}
            disabled={disabled}
          />
        </div>
        <CardDescription>
          Automatically create class instances on a schedule
        </CardDescription>
      </CardHeader>

      {isRecurring && (
        <CardContent className="space-y-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={pattern.frequency}
              onValueChange={(v) => updatePattern({ frequency: v as RecurringPattern["frequency"] })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Days of week (for weekly/biweekly) */}
          {(pattern.frequency === "weekly" || pattern.frequency === "biweekly") && (
            <div className="space-y-2">
              <Label>On these days</Label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={pattern.days_of_week?.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => toggleDay(day.value)}
                    disabled={disabled}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* End condition */}
          <div className="space-y-3">
            <Label>Ends</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={endType === "never"}
                  onCheckedChange={() => handleEndTypeChange("never")}
                  disabled={disabled}
                />
                <span className="text-sm">Never</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={endType === "date"}
                  onCheckedChange={() => handleEndTypeChange("date")}
                  disabled={disabled}
                />
                <span className="text-sm">On date</span>
                {endType === "date" && (
                  <Input
                    type="date"
                    value={pattern.end_date || ""}
                    onChange={(e) => updatePattern({ end_date: e.target.value })}
                    className="w-auto ml-2"
                    disabled={disabled}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={endType === "occurrences"}
                  onCheckedChange={() => handleEndTypeChange("occurrences")}
                  disabled={disabled}
                />
                <span className="text-sm">After</span>
                {endType === "occurrences" && (
                  <>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={pattern.occurrences || 10}
                      onChange={(e) => updatePattern({ occurrences: parseInt(e.target.value) || 10 })}
                      className="w-20 ml-2"
                      disabled={disabled}
                    />
                    <span className="text-sm text-muted-foreground">occurrences</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {pattern.days_of_week && pattern.days_of_week.length > 0 && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Repeats {pattern.frequency === "biweekly" ? "every 2 weeks" : pattern.frequency} on{" "}
                  {pattern.days_of_week
                    .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
                    .join(", ")}
                  {endType === "date" && pattern.end_date && ` until ${pattern.end_date}`}
                  {endType === "occurrences" && pattern.occurrences && ` for ${pattern.occurrences} times`}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
