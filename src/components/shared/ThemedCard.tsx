import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";

export type ThemedCardColor = "blue" | "green" | "orange" | "purple" | "rose" | "teal" | "neutral";

interface ThemedCardProps {
  children: ReactNode;
  colorTheme?: ThemedCardColor;
  className?: string;
  onClick?: () => void;
  withAccent?: boolean;
}

const colorStyles: Record<ThemedCardColor, { bg: string; border: string; accent: string }> = {
  blue: {
    bg: "bg-gradient-to-br from-blue-500/5 via-background to-blue-600/5",
    border: "border-blue-500/20",
    accent: "from-blue-400/60 via-blue-500/40",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-500/5 via-background to-emerald-600/5",
    border: "border-emerald-500/20",
    accent: "from-emerald-400/60 via-emerald-500/40",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-500/5 via-background to-amber-500/5",
    border: "border-orange-500/20",
    accent: "from-orange-400/60 via-amber-400/40",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-500/5 via-background to-violet-500/5",
    border: "border-purple-500/20",
    accent: "from-purple-400/60 via-violet-400/40",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-500/5 via-background to-pink-500/5",
    border: "border-rose-500/20",
    accent: "from-rose-400/60 via-pink-400/40",
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-500/5 via-background to-cyan-500/5",
    border: "border-teal-500/20",
    accent: "from-teal-400/60 via-cyan-400/40",
  },
  neutral: {
    bg: "bg-gradient-to-br from-muted/50 via-background to-muted/30",
    border: "border-border/50",
    accent: "from-muted-foreground/50 via-muted-foreground/30",
  },
};

export const ThemedCard = memo(function ThemedCard({
  children,
  colorTheme = "neutral",
  className,
  onClick,
  withAccent = true,
}: ThemedCardProps) {
  const styles = colorStyles[colorTheme];

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 overflow-hidden transition-all duration-300",
        styles.bg,
        styles.border,
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.01]",
        className
      )}
      onClick={onClick}
    >
      {/* Top accent line */}
      {withAccent && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent",
            styles.accent
          )}
        />
      )}
      {children}
    </div>
  );
});
