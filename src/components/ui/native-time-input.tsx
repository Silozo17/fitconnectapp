import { useRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface NativeTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export function NativeTimeInput({
  value,
  onChange,
  className,
  placeholder = "Select time",
  required,
  id,
}: NativeTimeInputProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  const handleClick = () => {
    if (hiddenInputRef.current?.showPicker) {
      hiddenInputRef.current.showPicker();
    } else {
      hiddenInputRef.current?.focus();
    }
  };

  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="relative">
      <Input
        type="text"
        readOnly
        value={formatTimeDisplay(value)}
        placeholder={placeholder}
        onClick={handleClick}
        className={cn("cursor-pointer pr-10", className)}
        aria-describedby={`${inputId}-hidden`}
      />
      <Clock 
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
      />
      <input
        ref={hiddenInputRef}
        id={`${inputId}-hidden`}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
