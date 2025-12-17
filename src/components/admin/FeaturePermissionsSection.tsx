import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, Settings, Shield, FileText, 
  Award, Image, TrendingUp, UserCog, ClipboardCheck 
} from "lucide-react";
import { AVAILABLE_FEATURES, DEFAULT_PERMISSIONS, useTogglePermission } from "@/hooks/useTeamPermissions";
import { cn } from "@/lib/utils";

interface FeaturePermissionsSectionProps {
  adminProfileId: string;
  role: string;
  permissions: Record<string, boolean>;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: any }> = {
  data: { label: "Data & Analytics", icon: BarChart3 },
  management: { label: "User Management", icon: Users },
  settings: { label: "Platform Settings", icon: Settings },
};

const FEATURE_ICONS: Record<string, any> = {
  view_revenue: TrendingUp,
  view_analytics: BarChart3,
  view_audit_logs: FileText,
  manage_users: Users,
  manage_coaches: UserCog,
  manage_team: Shield,
  manage_verifications: ClipboardCheck,
  manage_settings: Settings,
  manage_challenges: Award,
  manage_avatars: Image,
};

export function FeaturePermissionsSection({
  adminProfileId,
  role,
  permissions,
}: FeaturePermissionsSectionProps) {
  const togglePermission = useTogglePermission();
  const defaultPerms = DEFAULT_PERMISSIONS[role] || [];

  const getPermissionState = (featureKey: string): boolean => {
    // If explicitly set, use that value
    if (permissions[featureKey] !== undefined) {
      return permissions[featureKey];
    }
    // Otherwise use role default
    return defaultPerms.includes(featureKey);
  };

  const handleToggle = (featureKey: string, currentState: boolean) => {
    togglePermission.mutate({
      adminProfileId,
      featureKey,
      isEnabled: !currentState,
    });
  };

  // Group features by category
  const featuresByCategory = AVAILABLE_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FEATURES>);

  return (
    <div className="space-y-6">
      {Object.entries(featuresByCategory).map(([category, features]) => {
        const categoryConfig = CATEGORY_LABELS[category];
        const CategoryIcon = categoryConfig.icon;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{categoryConfig.label}</span>
            </div>

            <div className="space-y-2 pl-6">
              {features.map((feature) => {
                const isEnabled = getPermissionState(feature.key);
                const FeatureIcon = FEATURE_ICONS[feature.key] || Settings;
                const isDefault = permissions[feature.key] === undefined;

                return (
                  <div
                    key={feature.key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      isEnabled ? "bg-muted/50" : "bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FeatureIcon className={cn(
                        "h-4 w-4",
                        isEnabled ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={feature.key} className="text-sm font-medium cursor-pointer">
                            {feature.label}
                          </Label>
                          {isDefault && (
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={feature.key}
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(feature.key, isEnabled)}
                      disabled={togglePermission.isPending}
                    />
                  </div>
                );
              })}
            </div>

            {category !== "settings" && <Separator className="mt-4" />}
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground mt-4">
        Permissions marked as "Default" are based on the team member's role. Toggle to override.
      </p>
    </div>
  );
}
