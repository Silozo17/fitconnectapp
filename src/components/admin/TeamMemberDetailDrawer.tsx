import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, KeyRound, Pause, Shield, UserCog, Clock, Loader2, X } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FeaturePermissionsSection } from "./FeaturePermissionsSection";
import { useUserLastLogin } from "@/hooks/useUserLastLogin";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  created_at: string;
  status: string | null;
  status_reason: string | null;
  role: string;
}

interface TeamMemberDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onEdit: () => void;
  onChangeRole: () => void;
  onChangeStatus: () => void;
  onResetPassword: () => void;
}

export const TeamMemberDetailDrawer = ({
  isOpen,
  onClose,
  member,
  onEdit,
  onChangeRole,
  onChangeStatus,
  onResetPassword,
}: TeamMemberDetailDrawerProps) => {
  const { data: lastLogin, isLoading: lastLoginLoading } = useUserLastLogin(member?.user_id);
  const { data: permissions = {}, isLoading: permissionsLoading } = useTeamPermissions(member?.id);

  if (!member) return null;

  const fullName = member.display_name || 
    [member.first_name, member.last_name].filter(Boolean).join(" ") || 
    "Unnamed";

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "manager":
        return "bg-primary text-primary-foreground";
      case "staff":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to all features and settings";
      case "manager":
        return "Can manage users, coaches, and view analytics";
      case "staff":
        return "Limited access for support tasks";
      default:
        return "Unknown role";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" showCloseButton={false}>
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <SheetTitle>Team Member Details</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {member.first_name?.[0] || member.display_name?.[0] || "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role}
                </Badge>
                <StatusBadge status={member.status || "active"} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs for Details and Permissions */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Details Section */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="font-medium">{member.display_name || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{member.first_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{member.last_name || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{member.department || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(member.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    {lastLoginLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-medium flex items-center gap-1 cursor-help">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {lastLogin?.relativeTime || "Never"}
                            </p>
                          </TooltipTrigger>
                          {lastLogin?.absoluteTime && (
                            <TooltipContent>
                              <p>{lastLogin.absoluteTime}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role & Permissions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Role & Permissions</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium capitalize">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRoleDescription(member.role)}
                  </p>
                </div>
              </div>

              {/* Status Reason */}
              {member.status_reason && member.status !== "active" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status Reason</p>
                    <p className="p-3 bg-destructive/10 rounded-lg text-sm">
                      {member.status_reason}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <p className="font-medium">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={onChangeRole}>
                    <UserCog className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                  <Button variant="outline" size="sm" onClick={onResetPassword}>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline" size="sm" onClick={onChangeStatus}>
                    <Pause className="h-4 w-4 mr-2" />
                    Change Status
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FeaturePermissionsSection
                  adminProfileId={member.id}
                  role={member.role}
                  permissions={permissions}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
