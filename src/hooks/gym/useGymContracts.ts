import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContractTemplate {
  id: string;
  gym_id: string;
  name: string;
  type: string;
  content: string;
  is_required: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface SignedContract {
  id: string;
  gym_id: string;
  member_id: string;
  template_id: string;
  signature_data: string | null;
  signature_type: string;
  signed_at: string;
  ip_address: string | null;
  template_version: number;
  template_content_snapshot: string;
  template?: ContractTemplate;
}

export function useContractTemplates(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-contract-templates", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_contract_templates")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContractTemplate[];
    },
    enabled: !!gymId,
  });
}

export function useActiveContractTemplates(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-contract-templates-active", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_contract_templates")
        .select("*")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .order("type", { ascending: true });

      if (error) throw error;
      return data as ContractTemplate[];
    },
    enabled: !!gymId,
  });
}

export function useSignedContracts(gymId: string | undefined, memberId?: string) {
  return useQuery({
    queryKey: ["gym-signed-contracts", gymId, memberId],
    queryFn: async () => {
      if (!gymId) return [];
      let query = supabase
        .from("gym_signed_contracts")
        .select(`
          *,
          template:gym_contract_templates(*)
        `)
        .eq("gym_id", gymId)
        .order("signed_at", { ascending: false });

      if (memberId) {
        query = query.eq("member_id", memberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SignedContract[];
    },
    enabled: !!gymId,
  });
}

export function useMemberUnsignedContracts(gymId: string | undefined, memberId: string | undefined) {
  return useQuery({
    queryKey: ["gym-unsigned-contracts", gymId, memberId],
    queryFn: async () => {
      if (!gymId || !memberId) return [];
      
      // Get all active required templates
      const { data: templates, error: templatesError } = await supabase
        .from("gym_contract_templates")
        .select("*")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .eq("is_required", true);

      if (templatesError) throw templatesError;

      // Get signed contracts for this member
      const { data: signed, error: signedError } = await supabase
        .from("gym_signed_contracts")
        .select("template_id, template_version")
        .eq("member_id", memberId);

      if (signedError) throw signedError;

      // Filter out templates that have been signed at current version
      const signedMap = new Map(signed?.map(s => [s.template_id, s.template_version]) || []);
      const unsigned = templates?.filter(t => {
        const signedVersion = signedMap.get(t.id);
        return signedVersion === undefined || signedVersion < t.version;
      }) || [];

      return unsigned as ContractTemplate[];
    },
    enabled: !!gymId && !!memberId,
  });
}

export function useContractTemplateMutations(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTemplate = useMutation({
    mutationFn: async (data: Omit<ContractTemplate, "id" | "created_at" | "updated_at" | "version">) => {
      const { data: result, error } = await supabase
        .from("gym_contract_templates")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-contract-templates", gymId] });
      toast({ title: "Contract template created" });
    },
    onError: (error) => {
      toast({ title: "Failed to create template", description: error.message, variant: "destructive" });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContractTemplate> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("gym_contract_templates")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-contract-templates", gymId] });
      toast({ title: "Contract template updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update template", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gym_contract_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-contract-templates", gymId] });
      toast({ title: "Contract template deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete template", description: error.message, variant: "destructive" });
    },
  });

  return { createTemplate, updateTemplate, deleteTemplate };
}

export function useSignContract(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      memberId,
      templateId,
      signatureData,
      signatureType,
    }: {
      memberId: string;
      templateId: string;
      signatureData: string;
      signatureType: "typed" | "drawn" | "checkbox";
    }) => {
      // Get template to snapshot content
      const { data: template, error: templateError } = await supabase
        .from("gym_contract_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      const { data, error } = await supabase
        .from("gym_signed_contracts")
        .insert({
          gym_id: gymId,
          member_id: memberId,
          template_id: templateId,
          signature_data: signatureData,
          signature_type: signatureType,
          template_version: template.version,
          template_content_snapshot: template.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-signed-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["gym-unsigned-contracts"] });
      toast({ title: "Contract signed successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to sign contract", description: error.message, variant: "destructive" });
    },
  });
}
