import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePercentageChange } from "@/hooks/useDateRangeAnalytics";

interface ComparisonStatCardProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  icon?: LucideIcon;
  iconClassName?: string;
  format?: "number" | "currency" | "percentage" | "string";
  currency?: string;
  description?: string;
  showComparison?: boolean;
  invertColors?: boolean; // For metrics where down is good (e.g., churn rate)
  className?: string;
}

export function ComparisonStatCard({
  title,
  value,
  previousValue,
  icon: Icon,
  iconClassName,
  format = "number",
  currency = "£",
  description,
  showComparison = true,
  invertColors = false,
  className,
}: ComparisonStatCardProps) {
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  const numericPrevious = typeof previousValue === "string" ? parseFloat(previousValue) || 0 : previousValue;
  
  const hasComparison = showComparison && numericPrevious !== undefined;
  const percentChange = hasComparison ? calculatePercentageChange(numericValue, numericPrevious) : 0;
  
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const isNeutral = percentChange === 0;
  
  // Determine if change is "good" or "bad"
  const isGood = invertColors ? isNegative : isPositive;
  const isBad = invertColors ? isPositive : isNegative;

  const formatValue = (val: number | string): string => {
    if (typeof val === "string" && format === "string") return val;
    
    const num = typeof val === "string" ? parseFloat(val) || 0 : val;
    
    switch (format) {
      case "currency":
        return `${currency}${num.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case "percentage":
        return `${num.toFixed(1)}%`;
      case "number":
      default:
        return num.toLocaleString("en-GB");
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">{title}</CardDescription>
          {Icon && (
            <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
          )}
        </div>
        <CardTitle className="text-3xl font-bold">
          {typeof value === "string" && format === "string" ? value : formatValue(value)}
        </CardTitle>
      </CardHeader>
      
      {hasComparison && (
        <CardContent className="pt-0">
          <div className={cn(
            "flex items-center gap-1 text-sm",
            isGood && "text-primary",
            isBad && "text-destructive",
            isNeutral && "text-muted-foreground"
          )}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {isNeutral && <Minus className="h-4 w-4" />}
            
            <span className="font-medium">
              {isPositive && "+"}
              {percentChange.toFixed(1)}%
            </span>
            
            <span className="text-muted-foreground">
              vs {formatValue(numericPrevious)}
            </span>
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      )}
      
      {!hasComparison && description && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}
