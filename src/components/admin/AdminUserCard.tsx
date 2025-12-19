import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";

interface ClientUser {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  status?: string | null;
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
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

      <div className="pt-3">
        <UserAvatar
          src={user.avatar_url}
          avatarSlug={user.selected_avatar_slug}
          avatarRarity={user.selected_avatar_rarity as Rarity | undefined}
          name={fullName}
          variant="squircle"
          size="xs"
        />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-sm leading-tight">{fullName}</p>
        <p className="text-xs text-muted-foreground truncate">{email || "No email"}</p>
      </div>

      <StatusBadge status={user.status || "active"} />
    </div>
  );
};
