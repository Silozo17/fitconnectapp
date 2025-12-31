import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Loader2, Plus, Pencil, Trash2, Variable, AlertTriangle } from "lucide-react";
import { useCoachCustomFields, CustomField } from "@/hooks/useCoachCustomFields";
import { useMessageVariables } from "@/hooks/useMessageVariables";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

interface FieldFormData {
  field_name: string;
  field_label: string;
  field_type: "text" | "number" | "date";
  default_value: string;
  description: string;
  is_global: boolean;
}

const defaultFormData: FieldFormData = {
  field_name: "",
  field_label: "",
  field_type: "text",
  default_value: "",
  description: "",
  is_global: false,
};

export function CustomFieldsManager() {
  const { t } = useTranslation("coach");
  const { fields, isLoading, createField, updateField, deleteField, isCreating, isUpdating } =
    useCoachCustomFields();
  const { isValidCustomFieldName } = useMessageVariables();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState<FieldFormData>(defaultFormData);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingField(null);
    setFormData(defaultFormData);
    setNameError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type as "text" | "number" | "date",
      default_value: field.default_value || "",
      description: field.description || "",
      is_global: field.is_global,
    });
    setNameError(null);
    setDialogOpen(true);
  };

  const handleOpenDelete = (field: CustomField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const handleLabelChange = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      field_label: label,
      // Auto-generate field name from label if not editing
      field_name: editingField
        ? prev.field_name
        : label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "")
            .substring(0, 30),
    }));
    setNameError(null);
  };

  const handleNameChange = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setFormData((prev) => ({ ...prev, field_name: cleanName }));

    if (cleanName && !isValidCustomFieldName(cleanName)) {
      setNameError("Invalid name or conflicts with system variable");
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.field_name || !formData.field_label) return;

    if (!isValidCustomFieldName(formData.field_name)) {
      setNameError("Invalid name or conflicts with system variable");
      return;
    }

    if (editingField) {
      updateField({
        id: editingField.id,
        field_label: formData.field_label,
        field_type: formData.field_type,
        default_value: formData.default_value || null,
        description: formData.description || null,
        is_global: formData.is_global,
      });
    } else {
      createField({
        field_name: formData.field_name,
        field_label: formData.field_label,
        field_type: formData.field_type,
        default_value: formData.default_value || undefined,
        description: formData.description || undefined,
        is_global: formData.is_global,
      });
    }

    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (fieldToDelete) {
      deleteField(fieldToDelete.id);
    }
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Variable className="h-5 w-5" />
                Custom Message Fields
              </CardTitle>
              <CardDescription>
                Create custom variables to personalize your automated messages
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Variable className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-2">No custom fields yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create fields like goal_weight, competition_date, or injury_focus
              </p>
              <Button variant="outline" size="sm" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Create your first field
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {`{${field.field_name}}`}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{field.field_label}</p>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {field.is_global && (
                        <Badge variant="secondary" className="text-xs">
                          Global
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {field.field_type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleOpenDelete(field)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Custom Field" : "Create Custom Field"}
            </DialogTitle>
            <DialogDescription>
              Custom fields can be used in your message templates like{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{goal_weight}"}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Label *</Label>
              <Input
                placeholder="e.g., Goal Weight"
                value={formData.field_label}
                onChange={(e) => handleLabelChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Variable Name *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{"{"}</span>
                <Input
                  placeholder="goal_weight"
                  value={formData.field_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={cn("font-mono", nameError && "border-destructive")}
                  disabled={!!editingField}
                />
                <span className="text-muted-foreground">{"}"}</span>
              </div>
              {nameError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {nameError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={formData.field_type}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, field_type: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Value</Label>
                <Input
                  placeholder="Optional default"
                  value={formData.default_value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, default_value: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Help text for this field..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Global Field</p>
                <p className="text-xs text-muted-foreground">
                  Same value applies to all clients
                </p>
              </div>
              <Switch
                checked={formData.is_global}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_global: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.field_name ||
                !formData.field_label ||
                !!nameError ||
                isCreating ||
                isUpdating
              }
            >
              {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingField ? "Save Changes" : "Create Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the field{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {`{${fieldToDelete?.field_name}}`}
              </code>
              . Any templates using this field will show empty values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
