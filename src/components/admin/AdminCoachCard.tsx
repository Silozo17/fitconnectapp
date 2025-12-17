import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { EyeOff } from "lucide-react";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  profile_image_url: string | null;
  status?: string | null;
  marketplace_visible?: boolean | null;
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
  const initials = displayName.slice(0, 2).toUpperCase();

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

      <Avatar className="h-10 w-10 flex-shrink-0">
        {coach.profile_image_url && <AvatarImage src={coach.profile_image_url} alt={displayName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

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
