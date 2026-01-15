import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  "#FF6B35", "#3B82F6", "#10B981", "#F59E0B", 
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
  "#1A1A2E", "#00D9FF", "#22C55E", "#A855F7",
];

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-2"
              style={{ backgroundColor: value }}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              {/* Color wheel input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Color Picker</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 uppercase"
                  />
                </div>
              </div>

              {/* Preset colors */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Presets</Label>
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        onChange(color);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-md border-2 transition-all hover:scale-110",
                        value.toLowerCase() === color.toLowerCase()
                          ? "border-foreground ring-2 ring-primary ring-offset-2"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-2 flex-1">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 uppercase"
          />
        </div>
      </div>
    </div>
  );
}
