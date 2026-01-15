import { useState, useEffect } from "react";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  RotateCcw,
  Users,
  UserCheck,
  Megaphone,
  Briefcase,
  AlertTriangle,
  Crown,
  Building2,
} from "lucide-react";
import {
  GymStaffPermissions,
  DEFAULT_PERMISSIONS_BY_ROLE,
  PERMISSION_GROUPS,
} from "@/hooks/gym/useGymStaffPermissions";

// Staff roles that can be configured (excluding owner)
const CONFIGURABLE_ROLES = [
  { id: "area_manager", label: "Area Manager", icon: Building2, description: "Multi-location access" },
  { id: "manager", label: "Manager", icon: Briefcase, description: "Full operational access" },
  { id: "coach", label: "Coach/Instructor", icon: UserCheck, description: "Class management" },
  { id: "staff", label: "Front Desk", icon: Users, description: "Check-ins and sales" },
  { id: "marketing", label: "Marketing", icon: Megaphone, description: "Campaigns and leads" },
] as const;

interface RolePermissionConfig {
  [role: string]: Partial<GymStaffPermissions>;
}

export function RolePermissionsEditor() {
  const { gym, isOwner, refetch } = useGym();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("manager");
  const [permissions, setPermissions] = useState<RolePermissionConfig>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["membership", "members"]));
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize permissions from gym settings or defaults
  useEffect(() => {
    const gymSettings = gym?.settings as { role_permissions?: RolePermissionConfig } | null;
    const savedPermissions = gymSettings?.role_permissions || {};
    
    // Merge saved with defaults for each role
    const mergedPermissions: RolePermissionConfig = {};
    CONFIGURABLE_ROLES.forEach(role => {
      mergedPermissions[role.id] = {
        ...DEFAULT_PERMISSIONS_BY_ROLE[role.id],
        ...savedPermissions[role.id],
      };
    });
    
    setPermissions(mergedPermissions);
  }, [gym?.settings]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const handlePermissionToggle = (permKey: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [permKey]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: { ...DEFAULT_PERMISSIONS_BY_ROLE[selectedRole] },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!gym?.id) return;
    setIsSaving(true);

    try {
      const currentSettings = (gym.settings as object) || {};
      const updatedSettings = {
        ...currentSettings,
        role_permissions: permissions,
      };

      const { error } = await supabase
        .from("gym_profiles")
        .update({ settings: updatedSettings })
        .eq("id", gym.id);

      if (error) throw error;

      toast.success("Role permissions saved successfully");
      setHasChanges(false);
      refetch?.();
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staff Role Permissions
          </CardTitle>
          <CardDescription>
            Only gym owners can configure role permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Contact your gym owner to modify role permissions.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRolePermissions = permissions[selectedRole] || {};
  const currentRole = CONFIGURABLE_ROLES.find(r => r.id === selectedRole);
  const RoleIcon = currentRole?.icon || Users;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Staff Role Permissions
            </CardTitle>
            <CardDescription>
              Configure default permissions for each staff role. Individual staff members can have custom overrides.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Role
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasChanges} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Badge */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Crown className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-sm">Owner</p>
            <p className="text-xs text-muted-foreground">
              Full access to all features. Cannot be modified.
            </p>
          </div>
          <Badge variant="default">Full Access</Badge>
        </div>

        {/* Role Tabs */}
        <Tabs value={selectedRole} onValueChange={setSelectedRole}>
          <TabsList className="grid w-full grid-cols-5">
            {CONFIGURABLE_ROLES.map(role => {
              const Icon = role.icon;
              return (
                <TabsTrigger key={role.id} value={role.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{role.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CONFIGURABLE_ROLES.map(role => (
            <TabsContent key={role.id} value={role.id} className="mt-4">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted">
                <RoleIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{role.label}</p>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                    const isExpanded = expandedGroups.has(groupKey);
                    
                    return (
                      <Collapsible
                        key={groupKey}
                        open={isExpanded}
                        onOpenChange={() => toggleGroup(groupKey)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <span className="font-medium text-sm">{group.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 pl-3">
                          <div className="space-y-2">
                            {group.permissions.map(perm => {
                              const permKey = perm.key as keyof GymStaffPermissions;
                              const isEnabled = currentRolePermissions[permKey] ?? false;

                              return (
                                <div
                                  key={perm.key}
                                  className="flex items-center justify-between py-2 px-3 rounded-lg border"
                                >
                                  <div className="flex items-center gap-2">
                                    {perm.requiresReview && (
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    )}
                                    <Label
                                      htmlFor={`${role.id}-${perm.key}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {perm.label}
                                    </Label>
                                  </div>
                                  <Switch
                                    id={`${role.id}-${perm.key}`}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) =>
                                      handlePermissionToggle(permKey, checked)
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Permissions marked with ⚠️ should be reviewed carefully
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              These actions can affect billing, delete data, or override user bookings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
