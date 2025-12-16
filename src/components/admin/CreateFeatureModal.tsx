import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface CreateFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURE_CATEGORIES = [
  "general",
  "clients",
  "content",
  "marketing",
  "ai",
  "integrations",
  "support",
];

const VALUE_TYPES = [
  { value: "boolean", label: "Boolean (true/false)" },
  { value: "number", label: "Number (limit)" },
  { value: "string", label: "Text" },
];

export function CreateFeatureModal({ open, onOpenChange }: CreateFeatureModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    value_type: "boolean",
    default_value: "false",
  });
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Feature name is required");
      return;
    }

    setSaving(true);

    try {
      // Parse default value based on type
      let parsedValue: any;
      if (formData.value_type === "boolean") {
        parsedValue = formData.default_value === "true";
      } else if (formData.value_type === "number") {
        parsedValue = Number(formData.default_value) || 0;
      } else {
        parsedValue = formData.default_value;
      }

      const { error } = await supabase
        .from("platform_features")
        .insert({
          feature_key: formData.name.toLowerCase().replace(/\s+/g, "_"),
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          default_value: parsedValue,
        } as any);

      if (error) throw error;

      toast.success("Feature created successfully");
      queryClient.invalidateQueries({ queryKey: ["platform-features"] });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        category: "general",
        value_type: "boolean",
        default_value: "false",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create feature");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Platform Feature</DialogTitle>
          <DialogDescription>
            Add a new feature that can be controlled per subscription tier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Feature Name</Label>
            <Input
              placeholder="e.g., max_clients"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What does this feature control?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Value Type</Label>
              <Select
                value={formData.value_type}
                onValueChange={(value) => setFormData({ ...formData, value_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default Value</Label>
            {formData.value_type === "boolean" ? (
              <Select
                value={formData.default_value}
                onValueChange={(value) => setFormData({ ...formData, default_value: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True (Enabled)</SelectItem>
                  <SelectItem value="false">False (Disabled)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={formData.value_type === "number" ? "number" : "text"}
                value={formData.default_value}
                onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Feature"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
