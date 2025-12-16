import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MessageTemplate {
  id: string;
  coach_id: string;
  name: string;
  content: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessageTemplates = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);

  // Get coach profile ID
  useEffect(() => {
    const fetchCoachId = async () => {
      if (!user || role !== "coach") {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCoachId(data.id);
      }
      setLoading(false);
    };

    fetchCoachId();
  }, [user, role]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (!coachId) return;

    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .order("category")
      .order("name");

    if (error) {
      console.error("[useMessageTemplates] Error fetching templates:", error);
      return;
    }

    setTemplates(data || []);
  }, [coachId]);

  useEffect(() => {
    if (coachId) {
      fetchTemplates();
    }
  }, [coachId, fetchTemplates]);

  // Create template
  const createTemplate = async (template: {
    name: string;
    content: string;
    category?: string;
  }): Promise<boolean> => {
    if (!coachId) {
      toast({
        title: "Error",
        description: "Coach profile not found",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.from("message_templates").insert({
      coach_id: coachId,
      name: template.name,
      content: template.content,
      category: template.category || "general",
    });

    if (error) {
      console.error("[useMessageTemplates] Error creating template:", error);
      toast({
        title: "Failed to create template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Template created",
      description: "Your message template has been saved.",
    });
    
    await fetchTemplates();
    return true;
  };

  // Update template
  const updateTemplate = async (
    id: string,
    updates: Partial<{ name: string; content: string; category: string }>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("message_templates")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[useMessageTemplates] Error updating template:", error);
      toast({
        title: "Failed to update template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Template updated",
    });
    
    await fetchTemplates();
    return true;
  };

  // Delete template (soft delete by setting is_active to false)
  const deleteTemplate = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from("message_templates")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("[useMessageTemplates] Error deleting template:", error);
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Template deleted",
    });
    
    await fetchTemplates();
    return true;
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};
