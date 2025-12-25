/**
 * Dialog shown when a user tries to access a web-only feature
 * from a native app or PWA
 */

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface WebOnlyFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const WebOnlyFeatureDialog = ({
  open,
  onOpenChange,
  featureName = "This feature",
}: WebOnlyFeatureDialogProps) => {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">
            {t("platform.webOnly.title", "Only available on website")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t(
              "platform.webOnly.description",
              "Please visit getfitconnect.co.uk in your browser to access {{feature}}.",
              { feature: featureName.toLowerCase() }
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row">
          <AlertDialogCancel className="w-full rounded-xl">
            {t("common.gotIt", "Got it")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WebOnlyFeatureDialog;
