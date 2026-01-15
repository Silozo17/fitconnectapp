import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularStatProps {
  value: number;
  max?: number;
  label: string;
  color?: "teal" | "orange" | "green" | "red" | "blue";
  type?: "number" | "currency" | "percentage";
  size?: "sm" | "md" | "lg";
  className?: string;
  currencySymbol?: string;
}

export const CircularStat = React.memo(function CircularStat({
  value,
  max = 100,
  label,
  color = "teal",
  type = "number",
  size = "md",
  className,
  currencySymbol = "£",
}: CircularStatProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeConfig = {
    sm: { size: 80, strokeWidth: 6, fontSize: "text-sm", labelSize: "text-[10px]" },
    md: { size: 100, strokeWidth: 8, fontSize: "text-lg", labelSize: "text-xs" },
    lg: { size: 140, strokeWidth: 10, fontSize: "text-2xl", labelSize: "text-sm" },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatValue = () => {
    if (type === "currency") {
      return `${currencySymbol}${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (type === "percentage") {
      return `${value.toFixed(0)}%`;
    }
    return value.toLocaleString();
  };

  const colorClasses = {
    teal: "gym-stat-ring-progress teal",
    orange: "gym-stat-ring-progress orange",
    green: "gym-stat-ring-progress green",
    red: "gym-stat-ring-progress red",
    blue: "stroke-[hsl(197,71%,45%)]",
  };

  return (
    <div className={cn("gym-stat-circular", className)}>
      <div className="gym-stat-ring" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
        >
          {/* Background ring */}
          <circle
            className="gym-stat-ring-bg"
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress ring */}
          <circle
            className={cn(colorClasses[color])}
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.6s ease-out",
            }}
          />
        </svg>
        <div className="gym-stat-value">
          <span className={cn("gym-stat-number", config.fontSize)}>{formatValue()}</span>
          <span className={cn("gym-stat-label", config.labelSize)}>{label}</span>
        </div>
      </div>
    </div>
  );
});

CircularStat.displayName = "CircularStat";
