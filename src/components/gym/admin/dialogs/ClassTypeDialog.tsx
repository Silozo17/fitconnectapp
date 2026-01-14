import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGym } from "@/contexts/GymContext";
import { GymClassType } from "@/hooks/gym/useGymClasses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const classTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  short_description: z.string().optional(),
  color: z.string().default("#FF6B35"),
  default_duration_minutes: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  default_capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  requires_booking: z.boolean().default(true),
  allow_drop_in: z.boolean().default(true),
  cancellation_deadline_hours: z.coerce.number().min(0).default(2),
  credits_required: z.coerce.number().min(0).default(1),
  difficulty_level: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ClassTypeFormValues = z.infer<typeof classTypeFormSchema>;

interface ClassTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classTypeToEdit?: GymClassType | null;
}

const COLOR_OPTIONS = [
  { value: "#FF6B35", label: "Orange" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#06B6D4", label: "Cyan" },
];

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
];

export function ClassTypeDialog({ 
  open, 
  onOpenChange, 
  classTypeToEdit 
}: ClassTypeDialogProps) {
  const { gym } = useGym();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");

  const isEditing = !!classTypeToEdit;

  const form = useForm<ClassTypeFormValues>({
    resolver: zodResolver(classTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      short_description: "",
      color: "#FF6B35",
      default_duration_minutes: 60,
      default_capacity: 20,
      requires_booking: true,
      allow_drop_in: true,
      cancellation_deadline_hours: 2,
      credits_required: 1,
      difficulty_level: "",
      is_active: true,
    },
  });

  // Reset form when editing
  useEffect(() => {
    if (classTypeToEdit) {
      form.reset({
        name: classTypeToEdit.name,
        description: classTypeToEdit.description || "",
        short_description: classTypeToEdit.short_description || "",
        color: classTypeToEdit.color || "#FF6B35",
        default_duration_minutes: classTypeToEdit.default_duration_minutes,
        default_capacity: classTypeToEdit.default_capacity,
        requires_booking: classTypeToEdit.requires_booking,
        allow_drop_in: classTypeToEdit.allow_drop_in,
        cancellation_deadline_hours: classTypeToEdit.cancellation_deadline_hours,
        credits_required: classTypeToEdit.credits_required,
        difficulty_level: classTypeToEdit.difficulty_level || "",
        is_active: classTypeToEdit.is_active,
      });
      setEquipment(classTypeToEdit.equipment_needed || []);
    } else {
      form.reset({
        name: "",
        description: "",
        short_description: "",
        color: "#FF6B35",
        default_duration_minutes: 60,
        default_capacity: 20,
        requires_booking: true,
        allow_drop_in: true,
        cancellation_deadline_hours: 2,
        credits_required: 1,
        difficulty_level: "",
        is_active: true,
      });
      setEquipment([]);
    }
  }, [classTypeToEdit, form, open]);

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter(e => e !== item));
  };

  const onSubmit = async (values: ClassTypeFormValues) => {
    if (!gym?.id) {
      toast.error("No gym selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const classTypeData = {
        name: values.name,
        gym_id: gym.id,
        description: values.description || null,
        short_description: values.short_description || null,
        color: values.color,
        default_duration_minutes: values.default_duration_minutes,
        default_capacity: values.default_capacity,
        requires_booking: values.requires_booking,
        allow_drop_in: values.allow_drop_in,
        cancellation_deadline_hours: values.cancellation_deadline_hours,
        credits_required: values.credits_required,
        difficulty_level: values.difficulty_level || null,
        equipment_needed: equipment.length > 0 ? equipment : null,
        is_active: values.is_active,
      };

      if (isEditing && classTypeToEdit) {
        const { error } = await supabase
          .from("gym_class_types")
          .update(classTypeData)
          .eq("id", classTypeToEdit.id);

        if (error) throw error;
        toast.success("Class type updated successfully");
      } else {
        const { error } = await supabase
          .from("gym_class_types")
          .insert([classTypeData]);

        if (error) throw error;
        toast.success("Class type created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["gym-class-types", gym.id] });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save class type:", error);
      toast.error(isEditing ? "Failed to update class type" : "Failed to create class type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Class Type" : "Add Class Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the class type details below."
              : "Create a new class type for your gym."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HIIT Training" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief one-liner for class listings" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the class..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visual Settings */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-4 w-4 rounded-full" 
                                style={{ backgroundColor: field.value }} 
                              />
                              {COLOR_OPTIONS.find(c => c.value === field.value)?.label || "Select"}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-4 w-4 rounded-full" 
                                style={{ backgroundColor: color.value }} 
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Class Settings */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="default_duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credits_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits Required</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of credits to book
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancellation_deadline_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Deadline</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormDescription>
                      Hours before class
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <FormLabel>Equipment Needed</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add equipment..."
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEquipment();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addEquipment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {equipment.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(item)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requires_booking"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Requires Booking</FormLabel>
                      <FormDescription>
                        Members must book in advance
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_drop_in"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Drop-in</FormLabel>
                      <FormDescription>
                        Members can attend without booking
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Class type is available for scheduling
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Class Type
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
