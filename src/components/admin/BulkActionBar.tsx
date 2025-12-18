import { Button } from "@/components/ui/button";
import { CheckCircle, Pause, Ban, Trash2, X } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onActivate: () => void;
  onSuspend: () => void;
  onBan: () => void;
  onDelete: () => void;
  onClear: () => void;
  loading?: boolean;
}

export const BulkActionBar = ({
  count,
  onActivate,
  onSuspend,
  onBan,
  onDelete,
  onClear,
  loading,
}: BulkActionBarProps) => {
  if (count === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
      <span className="text-sm font-medium shrink-0">
        {count} {count === 1 ? "item" : "items"} selected
      </span>
      
      <div className="hidden sm:block flex-1" />
      
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onActivate}
          disabled={loading}
          className="gap-1.5"
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="hidden xs:inline">Activate</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onSuspend}
          disabled={loading}
          className="gap-1.5"
        >
          <Pause className="h-4 w-4 text-amber-500" />
          <span className="hidden xs:inline">Suspend</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onBan}
          disabled={loading}
          className="gap-1.5"
        >
          <Ban className="h-4 w-4 text-red-500" />
          <span className="hidden xs:inline">Ban</span>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={loading}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden xs:inline">Delete</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={loading}
          className="gap-1.5"
        >
          <X className="h-4 w-4" />
          <span className="hidden xs:inline">Clear</span>
        </Button>
      </div>
    </div>
  );
};
