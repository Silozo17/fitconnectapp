/**
 * Race Time Input - For Running, Swimming, Cycling race times
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RaceTimeValue } from "@/config/disciplines/types";

interface RaceTimeInputProps {
  value: RaceTimeValue | null;
  onChange: (value: RaceTimeValue) => void;
  format?: 'mm:ss' | 'hh:mm:ss' | 'mm:ss.ms';
  label?: string;
  className?: string;
}

export function RaceTimeInput({
  value,
  onChange,
  format: timeFormat = 'mm:ss',
  label,
  className,
}: RaceTimeInputProps) {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [ms, setMs] = useState('00');
  const [date, setDate] = useState<Date>(
    value?.achievedAt ? new Date(value.achievedAt) : new Date()
  );

  // Parse initial value
  useEffect(() => {
    if (value?.time) {
      const parts = value.time.split(':');
      if (timeFormat === 'hh:mm:ss' && parts.length === 3) {
        setHours(parts[0]);
        setMinutes(parts[1]);
        setSeconds(parts[2]);
      } else if (timeFormat === 'mm:ss.ms' && parts.length >= 2) {
        setMinutes(parts[0]);
        const secMs = parts[1].split('.');
        setSeconds(secMs[0]);
        setMs(secMs[1] || '00');
      } else if (parts.length >= 2) {
        setMinutes(parts[0]);
        setSeconds(parts[1]);
      }
    }
  }, []);

  useEffect(() => {
    let formattedTime = '';
    if (timeFormat === 'hh:mm:ss') {
      formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } else if (timeFormat === 'mm:ss.ms') {
      formattedTime = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${ms.padStart(2, '0')}`;
    } else {
      formattedTime = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }

    onChange({
      time: formattedTime,
      achievedAt: date.toISOString(),
    });
  }, [hours, minutes, seconds, ms, date]);

  const handleInput = (
    setter: (val: string) => void,
    max: number
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(val) || 0;
    setter(String(Math.min(num, max)).padStart(2, '0'));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}

      {/* Time Input */}
      <div className="flex items-center gap-1 justify-center">
        <Clock className="w-4 h-4 text-muted-foreground mr-2" />
        
        {timeFormat === 'hh:mm:ss' && (
          <>
            <Input
              type="text"
              value={hours}
              onChange={handleInput(setHours, 99)}
              className="w-14 text-center text-lg font-mono"
              placeholder="HH"
            />
            <span className="text-xl font-bold">:</span>
          </>
        )}
        
        <Input
          type="text"
          value={minutes}
          onChange={handleInput(setMinutes, 59)}
          className="w-14 text-center text-lg font-mono"
          placeholder="MM"
        />
        <span className="text-xl font-bold">:</span>
        <Input
          type="text"
          value={seconds}
          onChange={handleInput(setSeconds, 59)}
          className="w-14 text-center text-lg font-mono"
          placeholder="SS"
        />
        
        {timeFormat === 'mm:ss.ms' && (
          <>
            <span className="text-xl font-bold">.</span>
            <Input
              type="text"
              value={ms}
              onChange={handleInput(setMs, 99)}
              className="w-14 text-center text-lg font-mono"
              placeholder="MS"
            />
          </>
        )}
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
