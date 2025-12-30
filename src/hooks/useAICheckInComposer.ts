import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type MessageTone = "motivational" | "supportive" | "professional";

export interface ClientContext {
  clientId: string;
  clientName: string;
  goal?: string;
  recentProgress?: string;
  lastContactDays?: number;
  reason: string;
  reasonContext?: string;
  achievements?: string[];
}

export interface GeneratedMessage {
  message: string;
  tone: MessageTone;
  clientName: string;
}

export function useAICheckInComposer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateMessage = async (
    context: ClientContext,
    tone: MessageTone = "supportive"
  ): Promise<GeneratedMessage | null> => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to use AI features.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Get coach's display name for personalization
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("generate-checkin-message", {
        body: {
          context: {
            clientName: context.clientName,
            goal: context.goal,
            recentProgress: context.recentProgress,
            lastContactDays: context.lastContactDays,
            reason: context.reason,
            reasonContext: context.reasonContext,
            achievements: context.achievements,
          },
          tone,
          coachName: coachProfile?.display_name,
        },
      });

      if (error) {
        console.error("[useAICheckInComposer] Error:", error);
        
        // Handle specific error codes
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          toast({
            title: "Rate limit reached",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402") || error.message?.includes("credits")) {
          toast({
            title: "AI credits exhausted",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation failed",
            description: "Could not generate message. Please try again.",
            variant: "destructive",
          });
        }
        return null;
      }

      const result: GeneratedMessage = {
        message: data.message,
        tone: data.tone,
        clientName: data.clientName,
      };

      setGeneratedMessage(result);
      return result;
    } catch (err) {
      console.error("[useAICheckInComposer] Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateWithTone = async (
    context: ClientContext,
    newTone: MessageTone
  ): Promise<GeneratedMessage | null> => {
    return generateMessage(context, newTone);
  };

  const clearMessage = () => {
    setGeneratedMessage(null);
  };

  return {
    generateMessage,
    regenerateWithTone,
    clearMessage,
    isGenerating,
    generatedMessage,
  };
}
