import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: "warning" | "info" | "destructive";
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: () => void;
  confirmLoading?: boolean;
}

/**
 * Bottom sheet overlay for warnings and confirmations in onboarding.
 * Using overlays instead of inline conditional content prevents layout shifts.
 */
export function OnboardingConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  icon,
  variant = "warning",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmLoading = false,
}: OnboardingConfirmSheetProps) {
  const variantStyles = {
    warning: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      confirmVariant: "default" as const,
    },
    info: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      confirmVariant: "default" as const,
    },
    destructive: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      confirmVariant: "destructive" as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left">
          {icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                styles.iconBg
              )}
            >
              <span className={styles.iconColor}>{icon}</span>
            </div>
          )}
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription className="text-base">
            {description}
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="flex-col gap-2 mt-6 sm:flex-col">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm(e);
            }}
            variant={styles.confirmVariant}
            className="w-full"
            disabled={confirmLoading}
          >
            {confirmLoading ? "Please wait..." : confirmLabel}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            {cancelLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
