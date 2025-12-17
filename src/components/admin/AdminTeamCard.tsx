import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { MoreHorizontal, Eye, Pencil, Shield, KeyRound, Pause, Trash2 } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  status: string | null;
  role: string;
}

interface AdminTeamCardProps {
  member: TeamMember;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
  onChangeRole: () => void;
  onResetPassword: () => void;
  onChangeStatus: () => void;
  onDelete: () => void;
}

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

export const AdminTeamCard = ({
  member,
  selected,
  onSelect,
  onClick,
  onEdit,
  onChangeRole,
  onResetPassword,
  onChangeStatus,
  onDelete,
}: AdminTeamCardProps) => {
  const displayName = member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Unnamed";
  const initials = member.first_name?.[0] || member.display_name?.[0] || "T";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors ${
        selected ? "border-primary ring-1 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </div>

      <Avatar className="h-10 w-10">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{member.department || "No department"}</p>
      </div>

      <Badge className={`${getRoleBadgeColor(member.role)} capitalize`}>
        {member.role}
      </Badge>

      <StatusBadge status={member.status || "active"} />

      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeRole}>
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetPassword}>
              <KeyRound className="h-4 w-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onChangeStatus}>
              <Pause className="h-4 w-4 mr-2" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
