/**
 * Shared Message Variable Resolver
 * 
 * Provides centralized variable resolution for all automation messages.
 * Supports both {var} and {{var}} syntax for backward compatibility.
 * 
 * System Variables:
 * - Client: client_name, client_first_name, client_last_name, client_full_name, client_display_name
 * - Coach: coach_name, coach_first_name, coach_display_name
 * - Context: current_date, current_time, days_since_last_login, days_since_last_session
 * - Milestone: value, unit
 * - Relationship: coaching_start_date
 * 
 * Custom fields from coach_message_fields table are also supported.
 */

export interface VariableContext {
  client?: {
    first_name?: string | null;
    last_name?: string | null;
    age?: number | null;
    gender?: string | null;
    city?: string | null;
    username?: string | null;
  };
  coach?: {
    display_name?: string | null;
    first_name?: string | null;
    gym_affiliation?: string | null;
  };
  relationship?: {
    start_date?: string | null;
  };
  milestone?: {
    value?: number | string | null;
    unit?: string | null;
    type?: string | null;
  };
  computed?: {
    daysSinceLogin?: number | null;
    daysSinceSession?: number | null;
    daysSinceActivity?: number | null;
  };
}

// Helper to safely get a string value with fallback
const safe = (value: string | null | undefined, fallback: string): string => {
  return value?.trim() || fallback;
};

// Format date for display (UK format)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format time for display (24-hour)
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Build full name from parts
const buildFullName = (firstName?: string | null, lastName?: string | null): string => {
  return [firstName, lastName].filter(Boolean).join(' ');
};

// System variable resolvers
type VariableResolver = (ctx: VariableContext) => string;

const SYSTEM_VARIABLES: Record<string, VariableResolver> = {
  // Client identity (backward compatible)
  'client_name': (ctx) => safe(
    buildFullName(ctx.client?.first_name, ctx.client?.last_name),
    'there'
  ),
  'client_first_name': (ctx) => safe(ctx.client?.first_name, 'there'),
  'client_last_name': (ctx) => safe(ctx.client?.last_name, ''),
  'client_full_name': (ctx) => safe(
    buildFullName(ctx.client?.first_name, ctx.client?.last_name),
    'there'
  ),
  'client_display_name': (ctx) => safe(
    ctx.client?.first_name || ctx.client?.username,
    'there'
  ),
  
  // Coach identity
  'coach_name': (ctx) => safe(ctx.coach?.display_name, 'your coach'),
  'coach_first_name': (ctx) => safe(
    ctx.coach?.first_name || ctx.coach?.display_name?.split(' ')[0],
    'your coach'
  ),
  'coach_display_name': (ctx) => safe(ctx.coach?.display_name, 'your coach'),
  
  // Contextual - dates and times
  'current_date': () => formatDate(new Date()),
  'current_time': () => formatTime(new Date()),
  'today': () => formatDate(new Date()),
  
  // Contextual - activity tracking
  'days_since_last_login': (ctx) => {
    if (ctx.computed?.daysSinceLogin !== undefined && ctx.computed.daysSinceLogin !== null) {
      return ctx.computed.daysSinceLogin.toString();
    }
    return 'recently';
  },
  'days_since_last_session': (ctx) => {
    if (ctx.computed?.daysSinceSession !== undefined && ctx.computed.daysSinceSession !== null) {
      return ctx.computed.daysSinceSession.toString();
    }
    return 'recently';
  },
  'days_since_activity': (ctx) => {
    if (ctx.computed?.daysSinceActivity !== undefined && ctx.computed.daysSinceActivity !== null) {
      return ctx.computed.daysSinceActivity.toString();
    }
    return 'recently';
  },
  
  // Milestone-specific (for milestone celebrations)
  'value': (ctx) => {
    if (ctx.milestone?.value !== undefined && ctx.milestone.value !== null) {
      return String(ctx.milestone.value);
    }
    return '';
  },
  'unit': (ctx) => safe(ctx.milestone?.unit, ''),
  'milestone_type': (ctx) => safe(ctx.milestone?.type, ''),
  
  // Relationship
  'coaching_start_date': (ctx) => {
    if (ctx.relationship?.start_date) {
      try {
        return formatDate(new Date(ctx.relationship.start_date));
      } catch {
        return '';
      }
    }
    return '';
  },
};

/**
 * Get list of all available system variables
 */
export function getSystemVariables(): Array<{
  name: string;
  category: 'client' | 'coach' | 'context' | 'milestone' | 'relationship';
  description: string;
}> {
  return [
    // Client
    { name: 'client_name', category: 'client', description: 'Full name (John Smith)' },
    { name: 'client_first_name', category: 'client', description: 'First name only (John)' },
    { name: 'client_last_name', category: 'client', description: 'Last name only (Smith)' },
    { name: 'client_full_name', category: 'client', description: 'Full name (alias for client_name)' },
    { name: 'client_display_name', category: 'client', description: 'First name or username' },
    
    // Coach
    { name: 'coach_name', category: 'coach', description: 'Coach display name' },
    { name: 'coach_first_name', category: 'coach', description: 'Coach first name' },
    { name: 'coach_display_name', category: 'coach', description: 'Coach display name' },
    
    // Context
    { name: 'current_date', category: 'context', description: 'Today\'s date (1 January 2025)' },
    { name: 'current_time', category: 'context', description: 'Current time (14:30)' },
    { name: 'today', category: 'context', description: 'Today\'s date (alias)' },
    { name: 'days_since_last_login', category: 'context', description: 'Days since client last logged in' },
    { name: 'days_since_last_session', category: 'context', description: 'Days since last session' },
    { name: 'days_since_activity', category: 'context', description: 'Days since any activity' },
    
    // Milestone (for milestone automations only)
    { name: 'value', category: 'milestone', description: 'Milestone value (e.g., 30 for 30-day streak)' },
    { name: 'unit', category: 'milestone', description: 'Milestone unit (e.g., days, kg)' },
    
    // Relationship
    { name: 'coaching_start_date', category: 'relationship', description: 'When coaching relationship started' },
  ];
}

/**
 * Resolve all variables in a message template
 * 
 * @param template - The message template with variables like {client_name}
 * @param context - The variable context containing client, coach, etc. data
 * @param customFields - Optional custom fields defined by the coach
 * @returns The resolved message with all variables replaced
 */
export function resolveMessageVariables(
  template: string,
  context: VariableContext,
  customFields?: Record<string, string | null>
): string {
  if (!template) return '';
  
  let result = template;
  
  // Normalize both {var} and {{var}} syntax to single braces
  // This ensures backward compatibility with templates using double braces
  result = result.replace(/\{\{(\w+)\}\}/g, '{$1}');
  
  // Resolve system variables (case-insensitive matching)
  for (const [key, resolver] of Object.entries(SYSTEM_VARIABLES)) {
    const pattern = new RegExp(`\\{${key}\\}`, 'gi');
    try {
      const value = resolver(context);
      result = result.replace(pattern, value);
    } catch (error) {
      console.warn(`Error resolving variable {${key}}:`, error);
      result = result.replace(pattern, '');
    }
  }
  
  // Resolve custom fields (case-insensitive matching)
  if (customFields) {
    for (const [key, value] of Object.entries(customFields)) {
      // Skip if key matches a system variable (system takes precedence)
      if (key.toLowerCase() in SYSTEM_VARIABLES) {
        console.warn(`Custom field "${key}" shadows system variable - skipping`);
        continue;
      }
      
      const pattern = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(pattern, value || '');
    }
  }
  
  // Remove any unresolved variables (fallback to empty string)
  // This prevents broken templates from showing raw variable names
  result = result.replace(/\{[\w_]+\}/g, '');
  
  // Clean up any extra whitespace created by empty replacements
  result = result.replace(/\s{2,}/g, ' ').trim();
  
  return result;
}

/**
 * Validate a variable name
 * Returns true if the name is valid, false otherwise
 */
export function isValidVariableName(name: string): boolean {
  // Must be alphanumeric with underscores, start with letter
  const validPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!validPattern.test(name)) return false;
  
  // Cannot be a reserved system variable
  if (name.toLowerCase() in SYSTEM_VARIABLES) return false;
  
  // Must be reasonable length
  if (name.length < 2 || name.length > 50) return false;
  
  return true;
}

/**
 * Extract all variable names from a template
 */
export function extractVariables(template: string): string[] {
  if (!template) return [];
  
  // Normalize double braces first
  const normalized = template.replace(/\{\{(\w+)\}\}/g, '{$1}');
  
  // Extract all variable names
  const matches = normalized.match(/\{(\w+)\}/g) || [];
  
  // Remove duplicates and braces
  const variables = [...new Set(
    matches.map(m => m.replace(/[{}]/g, ''))
  )];
  
  return variables;
}

/**
 * Check which variables in a template are unresolved given the available data
 */
export function findUnresolvedVariables(
  template: string,
  context: VariableContext,
  customFields?: Record<string, string | null>
): string[] {
  const variables = extractVariables(template);
  const unresolved: string[] = [];
  
  for (const variable of variables) {
    const lowerVar = variable.toLowerCase();
    
    // Check if it's a system variable
    if (lowerVar in SYSTEM_VARIABLES) {
      continue; // System variables always have fallbacks
    }
    
    // Check if it's a custom field
    if (customFields && variable in customFields) {
      if (!customFields[variable]) {
        unresolved.push(variable); // Custom field exists but has no value
      }
      continue;
    }
    
    // Variable not found
    unresolved.push(variable);
  }
  
  return unresolved;
}

/**
 * Fetch custom field values for a specific coach/client pair
 */
export async function fetchCustomFieldValues(
  supabase: any,
  coachId: string,
  clientId: string
): Promise<Record<string, string>> {
  try {
    const { data: customFieldValues } = await supabase
      .from("client_custom_field_values")
      .select(`
        value,
        field:coach_message_fields(field_name, default_value)
      `)
      .eq("client_id", clientId);

    const customFields: Record<string, string> = {};
    
    if (customFieldValues) {
      for (const cfv of customFieldValues) {
        const fieldName = (cfv.field as any)?.field_name;
        if (fieldName) {
          customFields[fieldName] = cfv.value || (cfv.field as any)?.default_value || '';
        }
      }
    }

    // Also fetch global fields for this coach
    const { data: globalFields } = await supabase
      .from("coach_message_fields")
      .select("field_name, default_value")
      .eq("coach_id", coachId)
      .eq("is_global", true);

    if (globalFields) {
      for (const field of globalFields) {
        if (!customFields[field.field_name]) {
          customFields[field.field_name] = field.default_value || '';
        }
      }
    }

    return customFields;
  } catch (error) {
    console.error("Error fetching custom field values:", error);
    return {};
  }
}
