import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIBlogSuggestions {
  formattedContent: string;
  suggestedExcerpt: string;
  suggestedMetaTitle: string;
  suggestedMetaDescription: string;
  suggestedKeywords: string[];
}

export const useAIBlogFormatter = () => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [suggestions, setSuggestions] = useState<AIBlogSuggestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatContent = async (content: string, title?: string, category?: string) => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return null;
    }

    setIsFormatting(true);
    setError(null);
    setSuggestions(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-blog-formatter', {
        body: { content, title, category }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions(data);
      toast.success("Content formatted successfully!");
      return data as AIBlogSuggestions;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to format content";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsFormatting(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
    setError(null);
  };

  return {
    formatContent,
    isFormatting,
    suggestions,
    error,
    clearSuggestions,
  };
};
