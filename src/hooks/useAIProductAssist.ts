import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DescriptionResult {
  short_description: string;
  full_description: string;
}

export function useAIProductAssist() {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const { toast } = useToast();

  const generateDescription = async (
    title: string,
    contentType: string,
    category: string
  ): Promise<DescriptionResult | null> => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a product title first",
        variant: "destructive",
      });
      return null;
    }

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-product-assist", {
        body: {
          title,
          content_type: contentType,
          category,
          type: "description",
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      return {
        short_description: data.short_description || "",
        full_description: data.full_description || "",
      };
    } catch (error: any) {
      toast({
        title: "Failed to generate description",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateTags = async (
    title: string,
    contentType: string,
    category: string
  ): Promise<string[] | null> => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a product title first",
        variant: "destructive",
      });
      return null;
    }

    setIsGeneratingTags(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-product-assist", {
        body: {
          title,
          content_type: contentType,
          category,
          type: "tags",
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      // Handle various response formats
      if (Array.isArray(data)) {
        return data;
      }
      if (data.tags && Array.isArray(data.tags)) {
        return data.tags;
      }
      
      return null;
    } catch (error: any) {
      toast({
        title: "Failed to generate tags",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return {
    generateDescription,
    generateTags,
    isGeneratingDescription,
    isGeneratingTags,
  };
}
