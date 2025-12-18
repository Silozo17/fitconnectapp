import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-config";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  status: string | null;
  role: string;
  avatar_url?: string | null;
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
}

interface AdminTeamCardProps {
  member: TeamMember;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
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
}: AdminTeamCardProps) => {
  const displayName = member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Unnamed";

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors ${
        selected ? "border-primary ring-1 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </div>

      <div className="pt-3 flex-shrink-0">
        <UserAvatar
          src={member.avatar_url}
          avatarSlug={member.selected_avatar_slug}
          avatarRarity={member.selected_avatar_rarity as Rarity | undefined}
          name={displayName}
          variant="squircle"
          size="xs"
        />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-sm leading-tight">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge className={`${getRoleBadgeColor(member.role)} capitalize text-[10px] h-4 px-1.5`}>
            {member.role}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">{member.department || ""}</span>
        </div>
      </div>

      <StatusBadge status={member.status || "active"} />
    </div>
  );
};
