/**
 * SmartDateInput - Reliable date input component using Calendar popover
 * 
 * Uses Calendar popover for all environments (works in iframes, iOS, Android, web)
 */

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface SmartDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  id?: string;
}

export function SmartDateInput({
  value,
  onChange,
  className,
  placeholder = "Select date",
  min,
  max,
  id,
}: SmartDateInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [open, setOpen] = useState(false);

  const selectedDate = value ? parseISO(value) : undefined;
  const displayValue = value ? format(parseISO(value), "dd MMM yyyy") : "";

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={inputId}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (min && date < parseISO(min)) return true;
            if (max && date > parseISO(max)) return true;
            return false;
          }}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
