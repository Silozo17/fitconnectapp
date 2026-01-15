import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionRowProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionRow({ actions, className }: QuickActionRowProps) {
  return (
    <div className={cn("gym-quick-actions", className)}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "gym-quick-action",
            action.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <action.icon className="gym-quick-action-icon" />
          <span className="gym-quick-action-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
