import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { MoreHorizontal, Eye, Pencil, KeyRound, Pause, Ban, CheckCircle, Trash2 } from "lucide-react";

interface ClientUser {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  status?: string | null;
}

interface AdminUserCardProps {
  user: ClientUser;
  email?: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onChangeStatus: () => void;
  onDelete: () => void;
  isResettingPassword?: boolean;
}

export const AdminUserCard = ({
  user,
  email,
  selected,
  onSelect,
  onClick,
  onEdit,
  onResetPassword,
  onChangeStatus,
  onDelete,
  isResettingPassword,
}: AdminUserCardProps) => {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed User";
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";

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
        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={fullName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-sm leading-tight">{fullName}</p>
        <p className="text-xs text-muted-foreground truncate">{email || "No email"}</p>
      </div>

      <StatusBadge status={user.status || "active"} />

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
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetPassword} disabled={isResettingPassword}>
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
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
