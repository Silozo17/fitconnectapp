import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSignupWizard } from "../SignupWizardContext";

interface EmailVerificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function EmailVerificationStep({ onNext, onBack }: EmailVerificationStepProps) {
  const { formData, updateFormData } = useSignupWizard();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [hasSentInitial, setHasSentInitial] = useState(false);

  // Send OTP on mount
  useEffect(() => {
    if (!hasSentInitial && formData.email) {
      sendOtp();
      setHasSentInitial(true);
    }
  }, [formData.email, hasSentInitial]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      handleVerify();
    }
  }, [code]);

  const sendOtp = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email: formData.email, purpose: "gym_signup" },
      });

      if (error) throw error;
      toast.success("Verification code sent to your email");
      setCountdown(60);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email: formData.email, code },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Email verified successfully!");
        updateFormData({ emailVerified: true });
        onNext();
      } else {
        toast.error(data.error || "Invalid verification code");
        setCode("");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify code");
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      await sendOtp();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-muted-foreground">
          We need to verify your email address to continue
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Check Your Inbox</CardTitle>
          <CardDescription>
            {isSending ? (
              "Sending verification code..."
            ) : (
              <>
                We've sent a 6-digit code to<br />
                <span className="font-medium text-foreground">{formData.email}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={isVerifying || isSending}
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
            disabled={isVerifying || code.length !== 6 || isSending}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Email
              </>
            )}
          </Button>

          {/* Resend */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || countdown > 0 || isSending}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {isResending ? (
                "Sending..."
              ) : countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                "Resend verification code"
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            The code will expire in 5 minutes. Check your spam folder if you don't see it.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
