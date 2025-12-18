import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, onVerified, onBack }: OTPVerificationProps) {
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
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Email verified!");
        onVerified();
      } else {
        toast.error(data.error || "Invalid verification code");
        setCode("");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Failed to verify code");
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email },
      });

      if (error) throw error;

      toast.success("New code sent!");
      setCountdown(60); // 60 second cooldown
      setCode("");
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend code");
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
          Check your email
        </h2>
        <p className="text-muted-foreground">
          We sent a 6-digit code to<br />
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
          "Verify Email"
        )}
      </Button>

      {/* Resend / Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || countdown > 0}
          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {isResending ? (
            "Sending..."
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            "Resend code"
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Code expires in 5 minutes. Didn't receive it? Check your spam folder.
      </p>
    </div>
  );
}
