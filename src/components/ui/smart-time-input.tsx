/**
 * SmartTimeInput - Platform-aware time input component
 * 
 * On iOS (Despia environment): Uses Select dropdown with time slots
 * On Web/Android: Uses native time input with showPicker()
 */

import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDespiaIOS } from "@/lib/despia";
import { NativeTimeInput } from "./native-time-input";

// Generate time slots from 05:00 to 22:00 in 30-minute increments
const TIME_SLOTS = Array.from({ length: 35 }, (_, i) => {
  const hours = Math.floor(i / 2) + 5;
  const minutes = (i % 2) * 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

interface SmartTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export function SmartTimeInput({
  value,
  onChange,
  className,
  placeholder = "Select time",
  required,
  id,
}: SmartTimeInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Format time for display (12-hour format)
  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // On iOS Despia, use Select dropdown instead of native picker
  if (isDespiaIOS()) {
    return (
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger
          id={inputId}
          className={cn(
            "w-full",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {value ? formatTimeDisplay(value) : placeholder}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {TIME_SLOTS.map((slot) => (
            <SelectItem key={slot} value={slot}>
              {formatTimeDisplay(slot)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // On Web/Android, use the native time input with showPicker()
  return (
    <NativeTimeInput
      id={inputId}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
}
