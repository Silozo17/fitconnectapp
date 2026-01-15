import * as React from "react";
import { cn } from "@/lib/utils";

interface GymTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function GymTabs({ tabs, activeTab, onTabChange, className }: GymTabsProps) {
  return (
    <div className={cn("gym-tabs", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn("gym-tab", activeTab === tab.id && "active")}
        >
          <span className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--gym-primary)/0.15)] text-[hsl(var(--gym-primary))]">
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
