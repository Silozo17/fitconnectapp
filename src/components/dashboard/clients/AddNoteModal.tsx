import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Pin, Tag } from "lucide-react";
import { useAddNote } from "@/hooks/useCoachClients";
import { useTranslation } from "@/hooks/useTranslation";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

export function AddNoteModal({ open, onOpenChange, clientName, clientId }: AddNoteModalProps) {
  const { t } = useTranslation("coach");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [isPinned, setIsPinned] = useState(false);
  
  const addNoteMutation = useAddNote();

  const noteCategories = [
    { value: "general", label: t('addNoteModal.categories.general'), color: "bg-gray-500" },
    { value: "progress", label: t('addNoteModal.categories.progress'), color: "bg-green-500" },
    { value: "injury", label: t('addNoteModal.categories.injury'), color: "bg-red-500" },
    { value: "feedback", label: t('addNoteModal.categories.feedback'), color: "bg-blue-500" },
    { value: "goal", label: t('addNoteModal.categories.goal'), color: "bg-purple-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) return;
    
    addNoteMutation.mutate({
      clientId,
      content,
      category,
      isPinned,
    }, {
      onSuccess: () => {
        setContent("");
        setCategory("general");
        setIsPinned(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            {clientName ? t('addNoteModal.titleWithClient', { clientName }) : t('addNoteModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('addNoteModal.category')}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('addNoteModal.noteContent')}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('addNoteModal.notePlaceholder')}
              className="bg-background border-border resize-none min-h-[150px]"
              required
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="isPinned" className="cursor-pointer">{t('addNoteModal.pinNote')}</Label>
            </div>
            <Switch id="isPinned" checked={isPinned} onCheckedChange={setIsPinned} />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('addNoteModal.cancel')}
            </Button>
            <Button type="submit" disabled={addNoteMutation.isPending || !content.trim() || !clientId}>
              {addNoteMutation.isPending ? t('addNoteModal.saving') : t('addNoteModal.addNote')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
