import { useState } from "react";
import { useMessageTemplates, MessageTemplate } from "@/hooks/useMessageTemplates";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Pencil, 
  Loader2,
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const TEMPLATE_CATEGORIES = [
  { value: "welcome", label: "Welcome" },
  { value: "followup", label: "Follow-up" },
  { value: "pricing", label: "Pricing" },
  { value: "plans", label: "Plans" },
  { value: "motivation", label: "Motivation" },
  { value: "general", label: "General" },
];

interface TemplateManagerProps {
  onSelectTemplate?: (content: string) => void;
  showSelectMode?: boolean;
}

const TemplateManager = ({ onSelectTemplate, showSelectMode = false }: TemplateManagerProps) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "general",
  });

  const resetForm = () => {
    setFormData({ name: "", content: "", category: "general" });
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) return;
    
    setSaving(true);
    const success = await createTemplate(formData);
    setSaving(false);
    
    if (success) {
      setShowCreateDialog(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!selectedTemplate || !formData.name.trim() || !formData.content.trim()) return;
    
    setSaving(true);
    const success = await updateTemplate(selectedTemplate.id, formData);
    setSaving(false);
    
    if (success) {
      setShowEditDialog(false);
      setSelectedTemplate(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    const success = await deleteTemplate(selectedTemplate.id);
    setSaving(false);
    
    if (success) {
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    }
  };

  const openEditDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Message Templates</h3>
        </div>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Template
        </Button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No templates yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create templates for quick responses
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {TEMPLATE_CATEGORIES.find(c => c.value === category)?.label || category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categoryTemplates.length} template{categoryTemplates.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => showSelectMode && onSelectTemplate?.(template.content)}
                      >
                        <p className="font-medium text-foreground">{template.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {template.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {showSelectMode && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onSelectTemplate?.(template.content)}
                          >
                            Use
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Save a message template for quick use in conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Message"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                placeholder="Type your template message..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={saving || !formData.name.trim() || !formData.content.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your message template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Message Content</Label>
              <Textarea
                id="edit-content"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={saving || !formData.name.trim() || !formData.content.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateManager;
