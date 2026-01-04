import { useRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface NativeDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  id?: string;
}

export function NativeDateInput({
  value,
  onChange,
  className,
  placeholder = "Select date",
  required,
  min,
  max,
  id,
}: NativeDateInputProps) {
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

  const displayValue = value 
    ? format(parseISO(value), "dd MMM yyyy") 
    : "";

  return (
    <div className="relative">
      <Input
        type="text"
        readOnly
        value={displayValue}
        placeholder={placeholder}
        onClick={handleClick}
        className={cn("cursor-pointer pr-10", className)}
        aria-describedby={`${inputId}-hidden`}
      />
      <Calendar 
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
      />
      <input
        ref={hiddenInputRef}
        id={`${inputId}-hidden`}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
