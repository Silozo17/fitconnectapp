import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { User, Clock, Monitor, ArrowRight } from "lucide-react";
import type { AuditLog } from "@/hooks/useAuditLog";

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getActionBadgeVariant = (action: string) => {
  if (action.includes("DELETE")) return "destructive";
  if (action.includes("CREATE")) return "default";
  if (action.includes("UPDATE") || action.includes("STATUS")) return "secondary";
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "outline";
  return "secondary";
};

const parseUserAgent = (ua: string | null) => {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  
  let browser = "Unknown";
  let os = "Unknown";
  
  // Browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  
  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";
  
  return { browser, os };
};

// Human-readable labels for settings and fields
const FIELD_LABELS: Record<string, string> = {
  // Platform settings
  maintenance_mode: "Maintenance Mode",
  auto_approve_coaches: "Auto-Approve Coaches",
  require_coach_verification: "Require Coach Verification",
  commission_rate: "Commission Rate",
  default_currency: "Default Currency",
  default_language: "Default Language",
  allow_anonymous_reviews: "Allow Anonymous Reviews",
  platform_name: "Platform Name",
  support_email: "Support Email",
  contact_email: "Contact Email",
  contact_phone: "Contact Phone",
  twitter_url: "Twitter URL",
  instagram_url: "Instagram URL",
  facebook_url: "Facebook URL",
  linkedin_url: "LinkedIn URL",
  youtube_url: "YouTube URL",
  
  // Tier features
  max_clients: "Max Clients",
  ai_features: "AI Features",
  custom_branding: "Custom Branding",
  analytics_access: "Analytics Access",
  priority_support: "Priority Support",
  api_access: "API Access",
  
  // Common fields
  tier: "Tier",
  feature: "Feature",
  value: "Value",
  reason: "Reason",
  coach: "Coach",
  client: "Client",
  rating: "Rating",
  status: "Status",
  admin_notes: "Admin Notes",
  expires_at: "Expires At",
};

const getFieldLabel = (key: string): string => {
  return FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const JsonDiff = ({ oldValues, newValues }: { oldValues: Record<string, unknown> | null; newValues: Record<string, unknown> | null }) => {
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  if (allKeys.size === 0) {
    return <p className="text-muted-foreground text-sm">No changes recorded</p>;
  }

  return (
    <div className="space-y-2">
      {Array.from(allKeys).map((key) => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];
        const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        const label = getFieldLabel(key);
        
        if (!hasChanged && oldVal === undefined) {
          // New value added
          return (
            <div key={key} className="flex items-start gap-2 text-sm">
              <Badge variant="default" className="text-xs shrink-0">+</Badge>
              <span className="font-medium text-foreground">{label}:</span>
              <span className="text-green-500">{formatValue(newVal)}</span>
            </div>
          );
        }
        
        if (!hasChanged && newVal === undefined) {
          // Value removed
          return (
            <div key={key} className="flex items-start gap-2 text-sm">
              <Badge variant="destructive" className="text-xs shrink-0">-</Badge>
              <span className="font-medium text-foreground">{label}:</span>
              <span className="text-red-500 line-through">{formatValue(oldVal)}</span>
            </div>
          );
        }
        
        if (hasChanged) {
          // Value changed
          return (
            <div key={key} className="flex items-start gap-2 text-sm flex-wrap">
              <Badge variant="secondary" className="text-xs shrink-0">~</Badge>
              <span className="font-medium text-foreground">{label}:</span>
              <span className="text-red-400">{formatValue(oldVal) || "∅"}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-green-400">{formatValue(newVal)}</span>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const AuditLogDetailModal = ({ log, open, onOpenChange }: AuditLogDetailModalProps) => {
  if (!log) return null;
  
  const { browser, os } = parseUserAgent(log.user_agent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Audit Log Details
            <Badge variant={getActionBadgeVariant(log.action)}>
              {log.action.replace(/_/g, " ")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View full details of this administrative action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                Timestamp
              </div>
              <p className="font-medium">
                {format(new Date(log.created_at), "PPpp")}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <User className="h-4 w-4" />
                Performed By
              </div>
              <p className="font-medium">
                {log.admin?.display_name || log.admin?.first_name || "System"}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Monitor className="h-4 w-4" />
                Device
              </div>
              <p className="font-medium">
                {browser} on {os}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Entity</p>
              <p className="font-medium capitalize">
                {log.entity_type.replace(/_/g, " ")}
                {log.entity_id && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    ({log.entity_id.slice(0, 8)}...)
                  </span>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Changes */}
          <div className="space-y-3">
            <h4 className="font-semibold">Changes</h4>
            <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-4">
              <JsonDiff oldValues={log.old_values} newValues={log.new_values} />
            </ScrollArea>
          </div>

          {/* Raw Data (Collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Raw JSON Data
            </summary>
            <ScrollArea className="mt-2 h-[150px] rounded-lg border bg-muted/30 p-4">
              <pre className="text-xs font-mono">
                {JSON.stringify({
                  id: log.id,
                  admin_id: log.admin_id,
                  action: log.action,
                  entity_type: log.entity_type,
                  entity_id: log.entity_id,
                  old_values: log.old_values,
                  new_values: log.new_values,
                  ip_address: log.ip_address,
                  user_agent: log.user_agent,
                  created_at: log.created_at,
                }, null, 2)}
              </pre>
            </ScrollArea>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDetailModal;
