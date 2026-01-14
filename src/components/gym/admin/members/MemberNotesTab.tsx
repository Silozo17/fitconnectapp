import { useState } from "react";
import { useGymMemberNotes, useCreateMemberNote, useDeleteMemberNote } from "@/hooks/gym/useGymMemberNotes";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";

interface MemberNotesTabProps {
  memberId: string;
  currentStaffId?: string;
}

const NOTE_CATEGORIES = [
  { value: "general", label: "General", color: "bg-blue-100 text-blue-800" },
  { value: "medical", label: "Medical", color: "bg-red-100 text-red-800" },
  { value: "payment", label: "Payment", color: "bg-green-100 text-green-800" },
  { value: "behavioral", label: "Behavioral", color: "bg-yellow-100 text-yellow-800" },
];

export function MemberNotesTab({ memberId, currentStaffId }: MemberNotesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [category, setCategory] = useState("general");

  const { data: notes = [], isLoading } = useGymMemberNotes(memberId);
  const { data: staffData } = useGymStaff();
  const createNote = useCreateMemberNote();
  const deleteNote = useDeleteMemberNote();

  // Get the current staff member from staff list
  const currentStaff = staffData?.find(s => s.user_id === currentStaffId) || staffData?.[0];

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentStaff?.id) return;

    await createNote.mutateAsync({
      memberId,
      staffId: currentStaff.id,
      content: newNote.trim(),
      category,
    });

    setNewNote("");
    setCategory("general");
    setIsAdding(false);
  };

  const getCategoryBadge = (cat: string) => {
    const categoryInfo = NOTE_CATEGORIES.find(c => c.value === cat) || NOTE_CATEGORIES[0];
    return (
      <Badge className={categoryInfo.color}>
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Staff notes and observations</CardDescription>
          </div>
          {!isAdding && currentStaff && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="flex gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Write your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleAddNote} 
                disabled={!newNote.trim() || createNote.isPending}
                size="sm"
              >
                {createNote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Note
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                  setCategory("general");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm">Add notes to track member progress and observations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={note.staff?.avatar_url || undefined} />
                      <AvatarFallback>
                        {note.staff?.display_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{note.staff?.display_name || "Staff"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(note.category)}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteNote.mutate({ noteId: note.id, memberId })}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
