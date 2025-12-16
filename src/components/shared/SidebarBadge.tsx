import { cn } from "@/lib/utils";

interface SidebarBadgeProps {
  count: number;
  collapsed?: boolean;
  variant?: "default" | "warning" | "urgent";
}

const variantClasses = {
  default: "bg-green-500",
  warning: "bg-amber-500",
  urgent: "bg-red-500",
};

export const SidebarBadge = ({ count, collapsed, variant = "default" }: SidebarBadgeProps) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : count;
  const bgClass = variantClasses[variant];

  if (collapsed) {
    return (
      <span
        className={cn(
          "absolute -top-1 -right-1 min-w-[16px] h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1",
          bgClass
        )}
      >
        {displayCount}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "min-w-[20px] h-5 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5",
        bgClass
      )}
    >
      {displayCount}
    </span>
  );
};
