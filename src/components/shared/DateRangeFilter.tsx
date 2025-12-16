import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DatePreset,
  CompareMode,
  DATE_PRESETS,
  COMPARE_OPTIONS,
} from "@/hooks/useDateRangeAnalytics";

interface DateRangeFilterProps {
  preset: DatePreset;
  startDate: Date;
  endDate: Date;
  compareMode: CompareMode;
  dateRangeLabel: string;
  comparisonLabel: string | null;
  onPresetChange: (preset: DatePreset) => void;
  onCustomRangeChange: (start: Date, end: Date) => void;
  onCompareModeChange: (mode: CompareMode) => void;
  showComparison?: boolean;
  className?: string;
}

export function DateRangeFilter({
  preset,
  startDate,
  endDate,
  compareMode,
  dateRangeLabel,
  comparisonLabel,
  onPresetChange,
  onCustomRangeChange,
  onCompareModeChange,
  showComparison = true,
  className,
}: DateRangeFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);
  const [selectingStart, setSelectingStart] = useState(true);

  const handlePresetChange = (value: string) => {
    const newPreset = value as DatePreset;
    if (newPreset === 'custom') {
      setIsCalendarOpen(true);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectingStart(true);
    } else {
      onPresetChange(newPreset);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selectingStart) {
      setTempStartDate(date);
      setTempEndDate(undefined);
      setSelectingStart(false);
    } else {
      if (tempStartDate && date < tempStartDate) {
        // If end date is before start, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
    }
  };

  const handleApplyCustomRange = () => {
    if (tempStartDate && tempEndDate) {
      onCustomRangeChange(tempStartDate, tempEndDate);
      setIsCalendarOpen(false);
    }
  };

  const handleCalendarOpenChange = (open: boolean) => {
    setIsCalendarOpen(open);
    if (open) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectingStart(true);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Preset / Date Range Selector */}
      <Popover open={isCalendarOpen} onOpenChange={handleCalendarOpenChange}>
        <div className="flex items-center gap-2">
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[200px]",
                !startDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRangeLabel}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <p className="text-sm font-medium">
              {selectingStart ? "Select start date" : "Select end date"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {tempStartDate && (
                <>
                  Start: {format(tempStartDate, "d MMM yyyy")}
                  {tempEndDate && ` → End: ${format(tempEndDate, "d MMM yyyy")}`}
                </>
              )}
            </p>
          </div>
          <CalendarComponent
            mode="single"
            selected={selectingStart ? tempStartDate : tempEndDate}
            onSelect={handleDateSelect}
            disabled={(date) => date > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          <div className="p-3 border-t flex justify-between items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectingStart(true);
                setTempStartDate(undefined);
                setTempEndDate(undefined);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApplyCustomRange}
              disabled={!tempStartDate || !tempEndDate}
            >
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Comparison Selector */}
      {showComparison && (
        <Select value={compareMode} onValueChange={(v) => onCompareModeChange(v as CompareMode)}>
          <SelectTrigger className="w-[180px]">
            <GitCompare className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Compare to..." />
          </SelectTrigger>
          <SelectContent>
            {COMPARE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Comparison Label */}
      {comparisonLabel && compareMode !== 'none' && (
        <span className="text-xs text-muted-foreground">
          vs {comparisonLabel}
        </span>
      )}
    </div>
  );
}
