import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CheckInResult {
  success: boolean;
  memberName: string;
  reason?: string;
  memberId?: string;
  membershipStatus?: string;
  creditsRemaining?: number;
}

interface UseCheckInFeedbackOptions {
  gymId: string;
  onCheckInSuccess?: (result: CheckInResult) => void;
  onCheckInError?: (result: CheckInResult) => void;
}

export function useCheckInFeedback({
  gymId,
  onCheckInSuccess,
  onCheckInError,
}: UseCheckInFeedbackOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);
  
  // Audio references
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements with fallback
    successSoundRef.current = new Audio();
    successSoundRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1NOjsyMj07QkpZboyluNHl+v////Xn3NfUz8e+tKihko+GfHNqY1xWUU5LSEdGRkdISUpNUFRZX2dxfYmWpLTD0+Dp9P///////+zm3c/Cvq6ilYV4bmZgWlNORkI+Ozk4ODg5Oz1AREhOVFtlcH2Kl6W0xNPg6fT//////+7o38/CvK6jloZ6b2dfWlRORkI+Ozg3Nzg4OTxAREhNVFtlcH2LmKW1xNPg6fT//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    
    errorSoundRef.current = new Audio();
    errorSoundRef.current.src = "data:audio/wav;base64,UklGRl9vT19teleW0teleW0teleW0teleW0teleW0teleW0vT19teleW0teleW0teleW0teleW0teleW0teleW0teleW0teleW0=";
    
    return () => {
      successSoundRef.current = null;
      errorSoundRef.current = null;
    };
  }, []);

  const playSuccessSound = useCallback(() => {
    try {
      // Use Web Audio API for more reliable playback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }, []);

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 200;
      oscillator.type = "sawtooth";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }, []);

  const triggerFlash = useCallback((color: "green" | "red") => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 1000);
  }, []);

  const createErrorNotification = useCallback(
    async (result: CheckInResult) => {
      try {
        // Get gym staff to notify
        const { data: staff } = await supabase
          .from("gym_staff")
          .select("id, user_id, role")
          .eq("gym_id", gymId)
          .in("role", ["owner", "manager", "staff"])
          .eq("status", "active");

        if (staff && staff.length > 0) {
          const notifications = staff.map((s) => ({
            gym_id: gymId,
            staff_id: s.id,
            type: "check_in_failed",
            title: `Check-in Failed: ${result.memberName}`,
            message: result.reason || "Unknown error",
            data: {
              memberId: result.memberId,
              reason: result.reason,
              membershipStatus: result.membershipStatus,
              creditsRemaining: result.creditsRemaining,
            },
            is_urgent: true,
          }));

          await supabase.from("gym_staff_notifications").insert(notifications);
        }
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    },
    [gymId]
  );

  const validateAndCheckIn = useCallback(
    async (memberId: string): Promise<CheckInResult> => {
      setIsProcessing(true);

      try {
        // Get member details with memberships
        const { data: member, error: memberError } = await (supabase as any)
          .from("gym_members")
          .select(`
            id,
            user_id,
            status,
            first_name,
            last_name,
            gym_memberships(id, status, end_date, credits_remaining, plan:membership_plans(name, unlimited_classes))
          `)
          .eq("id", memberId)
          .eq("gym_id", gymId)
          .single();

        if (memberError || !member) {
          const result: CheckInResult = {
            success: false,
            memberName: "Unknown",
            reason: "Member not found",
          };
          playErrorSound();
          triggerFlash("red");
          await createErrorNotification(result);
          setLastResult(result);
          onCheckInError?.(result);
          return result;
        }

        const memberName = `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Member";

        // Check if member is active
        if (member.status !== "active") {
          const result: CheckInResult = {
            success: false,
            memberName,
            reason: `Member status: ${member.status}`,
            memberId: member.id,
            membershipStatus: member.status,
          };
          playErrorSound();
          triggerFlash("red");
          await createErrorNotification(result);
          setLastResult(result);
          onCheckInError?.(result);
          return result;
        }

        // Check membership status
        const activeMembership = (member.gym_memberships as any[])?.find(
          (m) => m.status === "active"
        );

        if (!activeMembership) {
          const result: CheckInResult = {
            success: false,
            memberName,
            reason: "No active membership",
            memberId: member.id,
            membershipStatus: "no_membership",
          };
          playErrorSound();
          triggerFlash("red");
          await createErrorNotification(result);
          setLastResult(result);
          onCheckInError?.(result);
          return result;
        }

        // Check if membership has expired
        if (activeMembership.end_date && new Date(activeMembership.end_date) < new Date()) {
          const result: CheckInResult = {
            success: false,
            memberName,
            reason: "Membership expired",
            memberId: member.id,
            membershipStatus: "expired",
          };
          playErrorSound();
          triggerFlash("red");
          await createErrorNotification(result);
          setLastResult(result);
          onCheckInError?.(result);
          return result;
        }

        // Check credits (unless unlimited)
        const hasUnlimitedClasses = activeMembership.plan?.unlimited_classes;
        const creditsRemaining = activeMembership.credits_remaining || 0;
        if (!hasUnlimitedClasses && creditsRemaining <= 0) {
          const result: CheckInResult = {
            success: false,
            memberName,
            reason: "No credits remaining",
            memberId: member.id,
            membershipStatus: "active",
            creditsRemaining: 0,
          };
          playErrorSound();
          triggerFlash("red");
          await createErrorNotification(result);
          setLastResult(result);
          onCheckInError?.(result);
          return result;
        }

        // All checks passed - create check-in
        const { error: checkInError } = await supabase.from("gym_check_ins").insert({
          gym_id: gymId,
          member_id: memberId,
          check_in_method: "qr_code",
        });

        if (checkInError) throw checkInError;

        const result: CheckInResult = {
          success: true,
          memberName,
          memberId: member.id,
          membershipStatus: "active",
          creditsRemaining: activeMembership.credits_remaining || 0,
        };

        playSuccessSound();
        triggerFlash("green");
        setLastResult(result);
        onCheckInSuccess?.(result);
        
        toast.success(`Welcome, ${memberName}!`);
        return result;
      } catch (error: any) {
        console.error("Check-in error:", error);
        const result: CheckInResult = {
          success: false,
          memberName: "Unknown",
          reason: error.message || "Check-in failed",
        };
        playErrorSound();
        triggerFlash("red");
        setLastResult(result);
        onCheckInError?.(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [gymId, playSuccessSound, playErrorSound, triggerFlash, createErrorNotification, onCheckInSuccess, onCheckInError]
  );

  return {
    validateAndCheckIn,
    isProcessing,
    lastResult,
    flashColor,
  };
}
