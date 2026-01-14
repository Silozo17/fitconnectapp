import { useState, useEffect } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import {
  useUpdateStaffPermissions,
  useUpdateStaffLocations,
  GymStaffPermissions,
  getEffectivePermissions,
  PERMISSION_GROUPS,
} from "@/hooks/gym/useGymStaffPermissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, MapPin, Loader2 } from "lucide-react";

interface StaffMember {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  permissions?: Partial<GymStaffPermissions>;
  assigned_location_ids?: string[];
}

interface StaffPermissionEditorProps {
  staff: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffPermissionEditor({
  staff,
  open,
  onOpenChange,
}: StaffPermissionEditorProps) {
  const { isOwner } = useGym();
  const { data: locations = [] } = useGymLocations();
  const updatePermissions = useUpdateStaffPermissions();
  const updateLocations = useUpdateStaffLocations();

  // Local state for permissions
  const [permissions, setPermissions] = useState<Partial<GymStaffPermissions>>({});
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("permissions");

  // Initialize from staff record
  useEffect(() => {
    if (staff) {
      setPermissions(staff.permissions || {});
      setSelectedLocationIds(staff.assigned_location_ids || []);
    }
  }, [staff]);

  // Get effective permissions (role defaults + custom overrides)
  const effectivePermissions = getEffectivePermissions(staff.role, permissions);

  const handlePermissionToggle = (key: keyof GymStaffPermissions, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLocationToggle = (locationId: string, checked: boolean) => {
    setSelectedLocationIds((prev) =>
      checked ? [...prev, locationId] : prev.filter((id) => id !== locationId)
    );
  };

  const handleSave = async () => {
    await Promise.all([
      updatePermissions.mutateAsync({ staffId: staff.id, permissions }),
      updateLocations.mutateAsync({ staffId: staff.id, locationIds: selectedLocationIds }),
    ]);
    onOpenChange(false);
  };

  const isSaving = updatePermissions.isPending || updateLocations.isPending;

  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configure Staff Access
          </DialogTitle>
          <DialogDescription>
            Customize permissions and location access for{" "}
            <strong>{staff.display_name || staff.email}</strong>
            <Badge variant="outline" className="ml-2 capitalize">
              {staff.role}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey} className="space-y-3">
                    <h4 className="font-semibold text-sm">{group.label}</h4>
                    <div className="space-y-2">
                      {group.permissions.map((perm) => {
                        const key = perm.key as keyof GymStaffPermissions;
                        const isEnabled = effectivePermissions[key];
                        const isCustomized = permissions[key] !== undefined;

                        return (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              {perm.requiresReview && (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              )}
                              <div>
                                <Label
                                  htmlFor={perm.key}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {perm.label}
                                </Label>
                                {perm.requiresReview && (
                                  <p className="text-xs text-muted-foreground">
                                    Actions logged for owner review
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCustomized && (
                                <Badge variant="outline" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                              <Switch
                                id={perm.key}
                                checked={isEnabled}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(key, checked)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="locations">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which locations this staff member can access. Leave all unchecked
                to grant access to all current and future locations.
              </p>

              {locations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No locations configured yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Checkbox
                        id={`loc-${location.id}`}
                        checked={selectedLocationIds.includes(location.id)}
                        onCheckedChange={(checked) =>
                          handleLocationToggle(location.id, !!checked)
                        }
                      />
                      <label
                        htmlFor={`loc-${location.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.name}</span>
                          {location.is_primary && (
                            <Badge variant="secondary" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        {location.city && (
                          <p className="text-sm text-muted-foreground ml-6">
                            {location.address_line1}, {location.city}
                          </p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {selectedLocationIds.length === 0 && locations.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">
                    Staff will have access to all locations
                  </span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StaffPermissionEditor;
