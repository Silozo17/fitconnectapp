/**
 * Belt With Stripes Input - For BJJ, Karate belt selection
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BeltConfig, BeltValue } from "@/config/disciplines/types";

interface BeltWithStripesInputProps {
  value: BeltValue | null;
  onChange: (value: BeltValue) => void;
  config: BeltConfig;
  className?: string;
}

export function BeltWithStripesInput({
  value,
  onChange,
  config,
  className,
}: BeltWithStripesInputProps) {
  const [beltId, setBeltId] = useState(value?.beltId || config.belts[0].id);
  const [stripes, setStripes] = useState(value?.stripes || 0);
  const [date, setDate] = useState<Date>(
    value?.achievedAt ? new Date(value.achievedAt) : new Date()
  );

  const selectedBelt = config.belts.find(b => b.id === beltId) || config.belts[0];

  useEffect(() => {
    onChange({
      beltId,
      stripes: Math.min(stripes, selectedBelt.maxStripes),
      achievedAt: date.toISOString(),
    });
  }, [beltId, stripes, date]);

  // Reset stripes when belt changes if current stripes exceed max
  useEffect(() => {
    if (stripes > selectedBelt.maxStripes) {
      setStripes(selectedBelt.maxStripes);
    }
  }, [beltId]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Belt Color Selection */}
      <div className="space-y-2">
        <Label>Belt Color</Label>
        <Select value={beltId} onValueChange={setBeltId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.belts.map(belt => (
              <SelectItem key={belt.id} value={belt.id}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-3 rounded-sm", belt.color)} />
                  <span>{belt.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stripes Selection (only if belt has stripes) */}
      {selectedBelt.maxStripes > 0 && (
        <div className="space-y-2">
          <Label>Stripes ({stripes} of {selectedBelt.maxStripes})</Label>
          <div className="flex items-center gap-2">
            {Array.from({ length: selectedBelt.maxStripes }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStripes(i + 1)}
                className={cn(
                  "w-4 h-8 rounded-sm border-2 transition-all",
                  i < stripes
                    ? config.stripeColor === 'white'
                      ? "bg-white border-white"
                      : config.stripeColor === 'black'
                      ? "bg-black border-black"
                      : "bg-red-500 border-red-500"
                    : "bg-transparent border-muted-foreground/30"
                )}
              />
            ))}
            {stripes > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStripes(0)}
                className="text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Visual Belt Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className={cn(
          "relative h-10 rounded-md flex items-center justify-center overflow-hidden",
          selectedBelt.color
        )}>
          {/* Stripes */}
          {selectedBelt.maxStripes > 0 && (
            <div className="absolute right-4 flex items-center gap-1">
              {Array.from({ length: stripes }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-6 rounded-sm",
                    config.stripeColor === 'white'
                      ? "bg-white"
                      : config.stripeColor === 'black'
                      ? "bg-black"
                      : "bg-red-500"
                  )}
                />
              ))}
            </div>
          )}
          <span className={cn("text-sm font-medium", selectedBelt.textColor)}>
            {selectedBelt.name} {stripes > 0 && `(${stripes} stripe${stripes > 1 ? 's' : ''})`}
          </span>
        </div>
      </div>

      {/* Date Achieved */}
      <div className="space-y-2">
        <Label>Date Achieved</Label>
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
