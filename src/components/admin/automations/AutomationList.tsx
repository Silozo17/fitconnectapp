import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  History,
  Play,
  Users,
  Mail,
  Bell,
  MessageSquare,
} from "lucide-react";
import {
  AdminAutomationRule,
  TRIGGER_CATEGORIES,
  useToggleAdminAutomation,
  useDeleteAdminAutomation,
} from "@/hooks/useAdminAutomations";

interface AutomationListProps {
  automations: AdminAutomationRule[];
  onEdit: (automation: AdminAutomationRule) => void;
  onViewLogs: (automation: AdminAutomationRule) => void;
}

const getTriggerLabel = (triggerType: string): string => {
  for (const category of Object.values(TRIGGER_CATEGORIES)) {
    const trigger = category.triggers.find((t) => t.value === triggerType);
    if (trigger) return trigger.label;
  }
  return triggerType;
};

const getAudienceIcon = (audience: string) => {
  switch (audience) {
    case "clients":
      return <Users className="h-3 w-3" />;
    case "coaches":
      return <Users className="h-3 w-3" />;
    default:
      return <Users className="h-3 w-3" />;
  }
};

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail className="h-3 w-3" />;
    case "push":
      return <Bell className="h-3 w-3" />;
    case "in_app":
      return <MessageSquare className="h-3 w-3" />;
    case "all":
      return <Bell className="h-3 w-3" />;
    default:
      return <MessageSquare className="h-3 w-3" />;
  }
};

export function AutomationList({ automations, onEdit, onViewLogs }: AutomationListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toggleMutation = useToggleAdminAutomation();
  const deleteMutation = useDeleteAdminAutomation();

  const handleToggle = (id: string, currentState: boolean) => {
    toggleMutation.mutate({ id, is_enabled: !currentState });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (automations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No automations yet</p>
        <p className="text-sm">Create your first automation to start messaging users automatically.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Cooldown</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automations.map((automation) => (
              <TableRow key={automation.id}>
                <TableCell>
                  <Switch
                    checked={automation.is_enabled}
                    onCheckedChange={() => handleToggle(automation.id, automation.is_enabled)}
                    disabled={toggleMutation.isPending}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{automation.name}</p>
                    {automation.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {automation.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getTriggerLabel(automation.trigger_type)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {getAudienceIcon(automation.target_audience)}
                    <span className="capitalize text-sm">{automation.target_audience}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {getMessageTypeIcon(automation.message_type)}
                    <span className="capitalize text-sm">{automation.message_type.replace("_", " ")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {automation.cooldown_days ? `${automation.cooldown_days} days` : "None"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(automation.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(automation)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewLogs(automation)}>
                        <History className="h-4 w-4 mr-2" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(automation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this automation? This action cannot be undone.
              Existing logs will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
