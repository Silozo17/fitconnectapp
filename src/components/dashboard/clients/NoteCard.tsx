import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pin, MoreVertical, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  content: string;
  category: "general" | "progress" | "injury" | "feedback" | "goal";
  isPinned: boolean;
  createdAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

const categoryConfig = {
  general: { label: "General", color: "bg-gray-500/20 text-gray-400" },
  progress: { label: "Progress", color: "bg-green-500/20 text-green-400" },
  injury: { label: "Injury", color: "bg-red-500/20 text-red-400" },
  feedback: { label: "Feedback", color: "bg-blue-500/20 text-blue-400" },
  goal: { label: "Goal", color: "bg-purple-500/20 text-purple-400" },
};

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const config = categoryConfig[note.category];

  return (
    <Card className={`glass-card ${note.isPinned ? 'border-primary/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <Pin className="h-4 w-4 text-primary fill-primary" />
            )}
            <Badge variant="secondary" className={config.color}>
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => onEdit(note.id)}>
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(note.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  );
}
