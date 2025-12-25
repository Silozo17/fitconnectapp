import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Premium sizing with better min-height
        "flex min-h-[120px] w-full rounded-xl border border-input bg-background/50 px-4 py-3",
        // Typography
        "text-base ring-offset-background",
        // Placeholder
        "placeholder:text-muted-foreground/60",
        // Focus states with glow
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 focus-visible:border-primary/50",
        "focus-visible:bg-background transition-all duration-200",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Backdrop effect
        "backdrop-blur-sm",
        // Resize
        "resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
