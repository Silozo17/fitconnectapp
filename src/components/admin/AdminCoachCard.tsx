import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import { EyeOff } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  profile_image_url: string | null;
  status?: string | null;
  marketplace_visible?: boolean | null;
  selected_avatar_slug?: string | null;
  selected_avatar_rarity?: string | null;
}

interface AdminCoachCardProps {
  coach: CoachUser;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

export const AdminCoachCard = ({
  coach,
  selected,
  onSelect,
  onClick,
}: AdminCoachCardProps) => {
  const displayName = coach.display_name || "Unnamed Coach";

  return (
    <div
      className={`flex items-center gap-2 py-3 px-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-all duration-200 ${
        selected ? "bg-primary/5 ring-1 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </div>

      <div className="pt-3 flex-shrink-0">
        <UserAvatar
          src={coach.profile_image_url}
          avatarSlug={coach.selected_avatar_slug}
          avatarRarity={coach.selected_avatar_rarity as Rarity | undefined}
          name={displayName}
          variant="squircle"
          size="xs"
        />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1">
          <p className="font-medium text-sm leading-tight truncate">{displayName}</p>
          {coach.marketplace_visible === false && (
            <EyeOff className="h-3 w-3 text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {coach.coach_types?.slice(0, 2).join(", ") || "No specialty"}
          {(coach.coach_types?.length || 0) > 2 && ` +${(coach.coach_types?.length || 0) - 2}`}
        </p>
      </div>

      <StatusBadge status={coach.status || "active"} />
    </div>
  );
};
