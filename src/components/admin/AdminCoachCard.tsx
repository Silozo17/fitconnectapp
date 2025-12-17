import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { MoreHorizontal, Eye, Pencil, KeyRound, Gift, Pause, Ban, CheckCircle, Trash2 } from "lucide-react";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  profile_image_url: string | null;
  status?: string | null;
}

interface AdminCoachCardProps {
  coach: CoachUser;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
  onAssignPlan: () => void;
  onResetPassword: () => void;
  onChangeStatus: () => void;
  onDelete: () => void;
  isResettingPassword?: boolean;
}

export const AdminCoachCard = ({
  coach,
  selected,
  onSelect,
  onClick,
  onEdit,
  onAssignPlan,
  onResetPassword,
  onChangeStatus,
  onDelete,
  isResettingPassword,
}: AdminCoachCardProps) => {
  const displayName = coach.display_name || "Unnamed Coach";
  const initials = displayName.slice(0, 2).toUpperCase();

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
        {coach.profile_image_url && <AvatarImage src={coach.profile_image_url} alt={displayName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {coach.coach_types?.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className="text-xs py-0 h-5">
              {type}
            </Badge>
          ))}
          {(coach.coach_types?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs py-0 h-5">
              +{(coach.coach_types?.length || 0) - 2}
            </Badge>
          )}
        </div>
      </div>

      <StatusBadge status={coach.status || "active"} />

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
              Edit Coach
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAssignPlan}>
              <Gift className="h-4 w-4 mr-2" />
              Assign Free Plan
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
              Delete Coach
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
