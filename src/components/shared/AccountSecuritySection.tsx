import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorMessage } from "@/lib/error-utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, Lock, Shield, Trash2, AlertTriangle, Settings } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { isDespia, openNativeSettings } from "@/lib/despia";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface AccountSecuritySectionProps {
  role?: "client" | "coach";
}

export const AccountSecuritySection = ({ role = "client" }: AccountSecuritySectionProps) => {
  const { user } = useAuth();
  const { t } = useTranslation('settings');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleUpdateEmail = async (data: EmailFormData) => {
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: data.email });
      if (error) throw error;
      
      toast.success(t('security.confirmationEmailSent'), {
        description: t('security.checkBothEmails'),
      });
      setShowEmailDialog(false);
      emailForm.reset();
    } catch (error: unknown) {
      toast.error("Failed to update email", {
        description: getErrorMessage(error, "Please try again later"),
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;
      
      toast.success(t('security.passwordUpdated'));
      setShowPasswordDialog(false);
      passwordForm.reset();
    } catch (error: unknown) {
      toast.error("Failed to update password", {
        description: getErrorMessage(error, "Please try again later"),
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('security.accountSecurity')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('security.manageEmailPassword')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Email Row - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base">{t('security.emailAddress')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => setShowEmailDialog(true)}>
              {t('security.updateEmail')}
            </Button>
          </div>

          {/* Password Row - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base">{t('security.password')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('security.changePasswordDesc')}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => setShowPasswordDialog(true)}>
              {t('security.changePassword')}
            </Button>
          </div>

          {/* Native App Settings Row - Only visible in Despia environment */}
          {isDespia() && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm sm:text-base">{t('nativeSettings.title')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('nativeSettings.description')}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => openNativeSettings()}>
                {t('nativeSettings.button')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('account.dangerZone')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('account.dangerZoneDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-full bg-destructive/20 shrink-0">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base">{t('account.deleteAccount')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {t('account.deleteAccountDescription')}
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => setShowDeleteDialog(true)}>
              {t('account.deleteAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Update Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('security.updateEmail')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('security.checkBothEmails')}
            </DialogDescription>
          </DialogHeader>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleUpdateEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('security.newEmailAddress')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('security.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowEmailDialog(false)}
                >
                  {t('forms.cancel')}
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingEmail}>
                  {isUpdatingEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('security.updateEmail')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('security.changePassword')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('security.passwordMinLength')}
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('security.newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('security.passwordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('security.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('security.confirmPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  {t('forms.cancel')}
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingPassword}>
                  {isUpdatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('security.changePassword')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        role={role}
      />
    </>
  );
};