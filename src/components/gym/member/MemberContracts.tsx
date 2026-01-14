import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface SignedContract {
  id: string;
  signed_at: string;
  ip_address: string | null;
  template_id: string;
  template_version: number;
  contract: {
    id: string;
    name: string;
    version: number;
    is_waiver: boolean;
  } | null;
}

export function MemberContracts() {
  const { user } = useAuth();
  const { gym } = useGym();

  // Fetch member's signed contracts
  const { data: signedContracts, isLoading } = useQuery({
    queryKey: ["member-contracts", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return [];

      // First get member ID
      const { data: member } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .single();

      if (!member) return [];

      const { data, error } = await supabase
        .from("gym_signed_contracts")
        .select(`
          id,
          signed_at,
          ip_address,
          template_id,
          template_version
        `)
        .eq("member_id", member.id)
        .order("signed_at", { ascending: false });

      if (error) throw error;
      
      // Fetch contract template details separately
      const templateIds = [...new Set((data || []).map(c => c.template_id))];
      
      if (templateIds.length === 0) {
        return (data || []).map(d => ({ ...d, contract: null })) as SignedContract[];
      }

      const { data: templates } = await supabase
        .from("gym_contract_templates")
        .select("id, name, version, is_waiver")
        .in("id", templateIds);

      const templateMap = new Map((templates || []).map(t => [t.id, t]));

      return (data || []).map(d => ({
        ...d,
        contract: templateMap.get(d.template_id) || null,
      })) as SignedContract[];
    },
    enabled: !!gym?.id && !!user?.id,
  });

  // Fetch required contracts that haven't been signed
  const { data: pendingContracts, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-contracts", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return [];

      const { data: member } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .single();

      if (!member) return [];

      // Get all required contracts
      const { data: allContracts } = await supabase
        .from("gym_contract_templates")
        .select("id, name, version, is_waiver, is_required")
        .eq("gym_id", gym.id)
        .eq("is_required", true)
        .eq("is_active", true);

      if (!allContracts) return [];

      // Get signed contract IDs
      const { data: signed } = await supabase
        .from("gym_signed_contracts")
        .select("template_id")
        .eq("member_id", member.id);

      const signedIds = new Set(signed?.map(s => s.template_id) || []);

      // Return contracts that haven't been signed
      return allContracts.filter(c => !signedIds.has(c.id));
    },
    enabled: !!gym?.id && !!user?.id,
  });

  const waivers = signedContracts?.filter(c => c.contract?.is_waiver) || [];
  const contracts = signedContracts?.filter(c => !c.contract?.is_waiver) || [];

  return (
    <div className="space-y-6">
      {/* Pending Contracts Alert */}
      {pendingContracts && pendingContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400">
              You have {pendingContracts.length} document{pendingContracts.length !== 1 ? "s" : ""} that need{pendingContracts.length === 1 ? "s" : ""} to be signed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.is_waiver ? "Waiver" : "Contract"} • v{contract.version}
                      </p>
                    </div>
                  </div>
                  <Button size="sm">
                    Sign Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waivers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Waivers
          </CardTitle>
          <CardDescription>
            Liability waivers and safety agreements you've signed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : waivers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No waivers signed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waivers.map((signed) => (
                <ContractCard key={signed.id} signed={signed} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Contracts
          </CardTitle>
          <CardDescription>
            Membership contracts and agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No contracts signed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((signed) => (
                <ContractCard key={signed.id} signed={signed} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContractCard({ signed }: { signed: SignedContract }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{signed.contract?.name || "Document"}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Signed {format(new Date(signed.signed_at), "MMM d, yyyy")}
            <span className="text-muted-foreground">•</span>
            <span>v{signed.contract?.version || signed.template_version}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Signed
        </Badge>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
