import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage, logError } from "@/lib/error-utils";
import { useTranslation } from "react-i18next";

interface OTPVerificationProps {
  email: string;
  purpose?: "signup" | "2fa";
  onVerified: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, purpose = "signup", onVerified, onBack }: OTPVerificationProps) {
  const { t } = useTranslation('common');
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error(t('otp.enter6Digit'));
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(t('otp.emailVerified'));
        onVerified();
      } else {
        toast.error(data.error || t('otp.invalidCode'));
        setCode("");
      }
    } catch (error: unknown) {
      logError("OTPVerification", error);
      toast.error(getErrorMessage(error, t('otp.failedVerify')));
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email, purpose },
      });

      if (error) throw error;

      toast.success(t('otp.newCodeSent'));
      setCountdown(60); // 60 second cooldown
      setCode("");
    } catch (error: unknown) {
      logError("OTPVerification", error);
      toast.error(getErrorMessage(error, t('otp.failedResend')));
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t('otp.checkEmail')}
        </h2>
        <p className="text-muted-foreground">
          {t('otp.sentCode')}<br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={isVerifying || code.length !== 6}
        className="w-full h-12"
      >
        {isVerifying ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t('otp.verifyEmail')
        )}
      </Button>

      {/* Resend / Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('otp.back')}
        </button>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || countdown > 0}
          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {isResending ? (
            t('otp.sending')
          ) : countdown > 0 ? (
            t('otp.resendIn', { seconds: countdown })
          ) : (
            t('otp.resendCode')
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t('otp.codeExpires')}
      </p>
    </div>
  );
}
