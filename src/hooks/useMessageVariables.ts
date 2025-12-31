import { useMemo } from "react";
import { useCoachCustomFields, CustomField } from "./useCoachCustomFields";

export interface SystemVariable {
  name: string;
  category: "client" | "coach" | "context" | "milestone" | "relationship";
  description: string;
}

// System variables available in all message templates
export const SYSTEM_VARIABLES: SystemVariable[] = [
  // Client
  { name: "client_name", category: "client", description: "Full name (John Smith)" },
  { name: "client_first_name", category: "client", description: "First name only (John)" },
  { name: "client_last_name", category: "client", description: "Last name only (Smith)" },
  { name: "client_full_name", category: "client", description: "Full name (alias for client_name)" },
  { name: "client_display_name", category: "client", description: "First name or username" },
  
  // Coach
  { name: "coach_name", category: "coach", description: "Coach display name" },
  { name: "coach_first_name", category: "coach", description: "Coach first name" },
  { name: "coach_display_name", category: "coach", description: "Coach display name" },
  
  // Context
  { name: "current_date", category: "context", description: "Today's date (1 January 2025)" },
  { name: "current_time", category: "context", description: "Current time (14:30)" },
  { name: "today", category: "context", description: "Today's date (alias)" },
  { name: "days_since_last_login", category: "context", description: "Days since client last logged in" },
  { name: "days_since_last_session", category: "context", description: "Days since last session" },
  { name: "days_since_activity", category: "context", description: "Days since any activity" },
  
  // Milestone (for milestone automations only)
  { name: "value", category: "milestone", description: "Milestone value (e.g., 30 for 30-day streak)" },
  { name: "unit", category: "milestone", description: "Milestone unit (e.g., days, kg)" },
  
  // Relationship
  { name: "coaching_start_date", category: "relationship", description: "When coaching relationship started" },
];

// Category labels for grouping
export const CATEGORY_LABELS: Record<string, string> = {
  client: "Client",
  coach: "Coach",
  context: "Context",
  milestone: "Milestone",
  relationship: "Relationship",
  custom: "Custom Fields",
};

export interface VariableOption {
  name: string;
  label: string;
  description: string;
  category: string;
  isCustom: boolean;
}

/**
 * Hook providing all available message variables (system + custom)
 */
export function useMessageVariables() {
  const { fields: customFields, isLoading } = useCoachCustomFields();

  // Combine system variables with custom fields
  const allVariables = useMemo((): VariableOption[] => {
    const systemVars = SYSTEM_VARIABLES.map((v) => ({
      name: v.name,
      label: `{${v.name}}`,
      description: v.description,
      category: v.category,
      isCustom: false,
    }));

    const customVars = customFields.map((f: CustomField) => ({
      name: f.field_name,
      label: `{${f.field_name}}`,
      description: f.description || f.field_label,
      category: "custom",
      isCustom: true,
    }));

    return [...systemVars, ...customVars];
  }, [customFields]);

  // Group variables by category
  const variablesByCategory = useMemo(() => {
    const grouped: Record<string, VariableOption[]> = {};
    for (const v of allVariables) {
      if (!grouped[v.category]) {
        grouped[v.category] = [];
      }
      grouped[v.category].push(v);
    }
    return grouped;
  }, [allVariables]);

  // Check if a variable name is valid for a custom field
  const isValidCustomFieldName = (name: string): boolean => {
    const validPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!validPattern.test(name)) return false;
    
    // Cannot be a reserved system variable
    if (SYSTEM_VARIABLES.some((v) => v.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    
    // Must be reasonable length
    if (name.length < 2 || name.length > 50) return false;
    
    return true;
  };

  // Extract all variable names from a template
  const extractVariables = (template: string): string[] => {
    if (!template) return [];
    
    // Normalize double braces first
    const normalized = template.replace(/\{\{(\w+)\}\}/g, "{$1}");
    
    // Extract all variable names
    const matches = normalized.match(/\{(\w+)\}/g) || [];
    
    // Remove duplicates and braces
    const variables = [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
    
    return variables;
  };

  // Check which variables in a template are unresolved/unknown
  const findUnknownVariables = (template: string): string[] => {
    const usedVars = extractVariables(template);
    const knownVars = new Set(allVariables.map((v) => v.name.toLowerCase()));
    
    return usedVars.filter((v) => !knownVars.has(v.toLowerCase()));
  };

  // Preview a message with sample data
  const previewMessage = (
    template: string,
    sampleData?: {
      clientName?: string;
      coachName?: string;
    }
  ): string => {
    if (!template) return "";
    
    let result = template;
    
    // Normalize both {var} and {{var}} syntax
    result = result.replace(/\{\{(\w+)\}\}/g, "{$1}");
    
    // Sample replacements
    const samples: Record<string, string> = {
      client_name: sampleData?.clientName || "John Smith",
      client_first_name: sampleData?.clientName?.split(" ")[0] || "John",
      client_last_name: sampleData?.clientName?.split(" ")[1] || "Smith",
      client_full_name: sampleData?.clientName || "John Smith",
      client_display_name: sampleData?.clientName?.split(" ")[0] || "John",
      coach_name: sampleData?.coachName || "Coach Sarah",
      coach_first_name: sampleData?.coachName?.split(" ")[0] || "Sarah",
      coach_display_name: sampleData?.coachName || "Coach Sarah",
      current_date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      current_time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      today: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      days_since_last_login: "3",
      days_since_last_session: "5",
      days_since_activity: "2",
      value: "30",
      unit: "days",
      coaching_start_date: "15 June 2025",
    };
    
    // Replace system variables
    for (const [key, value] of Object.entries(samples)) {
      const pattern = new RegExp(`\\{${key}\\}`, "gi");
      result = result.replace(pattern, value);
    }
    
    // Replace custom fields with sample values
    for (const field of customFields) {
      const pattern = new RegExp(`\\{${field.field_name}\\}`, "gi");
      result = result.replace(pattern, field.default_value || `[${field.field_label}]`);
    }
    
    return result;
  };

  return {
    allVariables,
    variablesByCategory,
    customFields,
    isLoading,
    isValidCustomFieldName,
    extractVariables,
    findUnknownVariables,
    previewMessage,
    CATEGORY_LABELS,
  };
}
