/**
 * Dropdown Input - Generic dropdown for discipline fields
 */

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropdownInputProps {
  value: string | null;
  onChange: (value: string) => void;
  choices: string[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DropdownInput({
  value,
  onChange,
  choices,
  label,
  placeholder = "Select...",
  className,
}: DropdownInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {choices.map(choice => (
            <SelectItem key={choice} value={choice}>
              {choice}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
