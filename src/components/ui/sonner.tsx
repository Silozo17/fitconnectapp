import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Safe area offset expression that works in both web/PWA and native iOS
const SAFE_AREA_TOP_OFFSET = "calc(max(env(safe-area-inset-top, 0px), var(--safe-area-top, 0px)) + 16px)";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      offset={SAFE_AREA_TOP_OFFSET}
      mobileOffset={SAFE_AREA_TOP_OFFSET}
      style={{ zIndex: 9999 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-float-md group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/10",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
