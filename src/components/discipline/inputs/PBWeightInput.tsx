/**
 * PB Weight Input - For Powerlifting, CrossFit lifts, reps, watts
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PBWeightInputProps {
  value: { value: number; achievedAt: string } | null;
  onChange: (value: { value: number; achievedAt: string }) => void;
  unit?: string;
  label?: string;
  className?: string;
}

export function PBWeightInput({
  value,
  onChange,
  unit = 'kg',
  label,
  className,
}: PBWeightInputProps) {
  const [pbValue, setPbValue] = useState(value?.value?.toString() || '');
  const [date, setDate] = useState<Date>(
    value?.achievedAt ? new Date(value.achievedAt) : new Date()
  );

  useEffect(() => {
    const numValue = parseFloat(pbValue) || 0;
    onChange({
      value: numValue,
      achievedAt: date.toISOString(),
    });
  }, [pbValue, date]);

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}

      {/* Value Input */}
      <div className="space-y-2">
        <Label className="text-xs">Personal Best</Label>
        <div className="relative">
          <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            value={pbValue}
            onChange={(e) => setPbValue(e.target.value)}
            className="pl-10 pr-16 text-lg font-bold"
            placeholder="0"
            step={unit === 'kg' || unit === 'lbs' ? 2.5 : 1}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        </div>
      </div>

      {/* Date Achieved */}
      <div className="space-y-2">
        <Label className="text-xs">Date Achieved</Label>
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
    </div>
  );
}
