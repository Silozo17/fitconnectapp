import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CustomField {
  id: string;
  coach_id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "number" | "date";
  default_value: string | null;
  description: string | null;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFieldValue {
  id: string;
  field_id: string;
  client_id: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export function useCoachCustomFields() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get coach profile
  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch all custom fields for this coach
  const { data: fields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ["coach-custom-fields", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("coach_message_fields")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .eq("is_active", true)
        .order("field_label");
      
      if (error) {
        console.error("Error fetching custom fields:", error);
        return [];
      }
      return data as CustomField[];
    },
    enabled: !!coachProfile,
  });

  // Create a new custom field
  const createFieldMutation = useMutation({
    mutationFn: async (field: {
      field_name: string;
      field_label: string;
      field_type?: "text" | "number" | "date";
      default_value?: string;
      description?: string;
      is_global?: boolean;
    }) => {
      if (!coachProfile) throw new Error("Coach profile not found");
      
      // Validate field name
      const validPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if (!validPattern.test(field.field_name)) {
        throw new Error("Field name must start with a letter and contain only letters, numbers, and underscores");
      }
      
      const { data, error } = await supabase
        .from("coach_message_fields")
        .insert({
          coach_id: coachProfile.id,
          field_name: field.field_name.toLowerCase(),
          field_label: field.field_label,
          field_type: field.field_type || "text",
          default_value: field.default_value || null,
          description: field.description || null,
          is_global: field.is_global || false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-custom-fields"] });
      toast({ title: "Custom field created" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update a custom field
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomField> & { id: string }) => {
      const { data, error } = await supabase
        .from("coach_message_fields")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-custom-fields"] });
      toast({ title: "Field updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete (soft) a custom field
  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_message_fields")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-custom-fields"] });
      toast({ title: "Field deleted" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    fields,
    isLoading: fieldsLoading,
    coachId: coachProfile?.id,
    createField: createFieldMutation.mutate,
    updateField: updateFieldMutation.mutate,
    deleteField: deleteFieldMutation.mutate,
    isCreating: createFieldMutation.isPending,
    isUpdating: updateFieldMutation.isPending,
    isDeleting: deleteFieldMutation.isPending,
  };
}

// Hook to get and set client-specific field values
export function useClientFieldValues(clientId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch client field values
  const { data: values = [], isLoading } = useQuery({
    queryKey: ["client-field-values", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("client_custom_field_values")
        .select(`
          *,
          field:coach_message_fields(field_name, field_label, default_value, is_global)
        `)
        .eq("client_id", clientId);
      
      if (error) {
        console.error("Error fetching client field values:", error);
        return [];
      }
      return data;
    },
    enabled: !!clientId,
  });

  // Set a field value for a client
  const setValueMutation = useMutation({
    mutationFn: async ({
      fieldId,
      value,
    }: {
      fieldId: string;
      value: string | null;
    }) => {
      if (!clientId) throw new Error("Client ID required");
      
      const { data, error } = await supabase
        .from("client_custom_field_values")
        .upsert(
          {
            field_id: fieldId,
            client_id: clientId,
            value,
          },
          { onConflict: "field_id,client_id" }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-field-values", clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save value",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Build a map of field_name -> value for variable resolution
  const getFieldValuesMap = (): Record<string, string | null> => {
    const map: Record<string, string | null> = {};
    for (const v of values) {
      const fieldName = (v.field as any)?.field_name;
      if (fieldName) {
        map[fieldName] = v.value || (v.field as any)?.default_value || null;
      }
    }
    return map;
  };

  return {
    values,
    isLoading,
    setValue: setValueMutation.mutate,
    isSaving: setValueMutation.isPending,
    getFieldValuesMap,
  };
}
