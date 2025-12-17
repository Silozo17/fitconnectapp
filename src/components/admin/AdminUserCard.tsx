import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";

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
}

export const AdminUserCard = ({
  user,
  email,
  selected,
  onSelect,
  onClick,
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
    </div>
  );
};
