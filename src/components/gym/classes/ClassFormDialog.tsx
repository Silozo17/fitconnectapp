import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGym } from "@/contexts/GymContext";
import { useGymClassTypes, useCreateGymClass, useUpdateGymClass, GymClass } from "@/hooks/gym/useGymClasses";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RecurringClassConfig, RecurringConfig } from "./RecurringClassConfig";
import { format, addDays, addWeeks, addMonths, setHours, setMinutes } from "date-fns";
import { Loader2, ChevronDown } from "lucide-react";

const classFormSchema = z.object({
  class_type_id: z.string().min(1, "Class type is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  instructor_id: z.string().optional(),
  location_id: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  waitlist_capacity: z.coerce.number().min(0).default(0),
  room: z.string().optional(),
  description: z.string().optional(),
  is_recurring: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classToEdit?: GymClass | null;
  defaultDate?: Date;
}

export function ClassFormDialog({ 
  open, 
  onOpenChange, 
  classToEdit,
  defaultDate = new Date()
}: ClassFormDialogProps) {
  const { gym } = useGym();
  const { data: classTypes, isLoading: classTypesLoading } = useGymClassTypes();
  const { data: staff, isLoading: staffLoading } = useGymStaff();
  const { data: locations, isLoading: locationsLoading } = useGymLocations();
  const createClass = useCreateGymClass();
  const updateClass = useUpdateGymClass();

  const isEditing = !!classToEdit;

  // Recurring config state
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    frequency: "weekly",
    daysOfWeek: [new Date().getDay()],
    endType: "occurrences",
    occurrences: 12,
    timeOfDay: format(defaultDate, "HH:mm"),
  });

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_type_id: "",
      start_time: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      instructor_id: "",
      location_id: "",
      capacity: 20,
      waitlist_capacity: 5,
      room: "",
      description: "",
      is_recurring: false,
    },
  });

  // Reset form when editing a class
  useEffect(() => {
    if (classToEdit) {
      form.reset({
        class_type_id: classToEdit.class_type_id,
        start_time: format(new Date(classToEdit.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(classToEdit.end_time), "yyyy-MM-dd'T'HH:mm"),
        instructor_id: classToEdit.instructor_id || "",
        location_id: classToEdit.location_id || "",
        capacity: classToEdit.capacity,
        waitlist_capacity: classToEdit.waitlist_capacity,
        room: classToEdit.room || "",
        description: classToEdit.description || "",
        is_recurring: classToEdit.is_recurring,
      });
    } else {
      form.reset({
        class_type_id: "",
        start_time: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        instructor_id: "",
        location_id: "",
        capacity: 20,
        waitlist_capacity: 5,
        room: "",
        description: "",
        is_recurring: false,
      });
    }
  }, [classToEdit, defaultDate, form]);

  // Auto-fill duration based on class type
  const handleClassTypeChange = (classTypeId: string) => {
    const classType = classTypes?.find(ct => ct.id === classTypeId);
    if (classType) {
      const startTime = form.getValues("start_time");
      if (startTime) {
        const startDate = new Date(startTime);
        const endDate = new Date(startDate.getTime() + classType.default_duration_minutes * 60 * 1000);
        form.setValue("end_time", format(endDate, "yyyy-MM-dd'T'HH:mm"));
        form.setValue("capacity", classType.default_capacity);
      }
    }
    form.setValue("class_type_id", classTypeId);
  };

  const onSubmit = async (values: ClassFormValues) => {
    try {
      const classData = {
        class_type_id: values.class_type_id,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        instructor_id: values.instructor_id || null,
        location_id: values.location_id || null,
        capacity: values.capacity,
        waitlist_capacity: values.waitlist_capacity,
        room: values.room || null,
        description: values.description || null,
        is_recurring: values.is_recurring,
        status: "scheduled",
      };

      if (isEditing && classToEdit) {
        await updateClass.mutateAsync({
          classId: classToEdit.id,
          updates: classData,
        });
      } else {
        await createClass.mutateAsync(classData);
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to save class:", error);
    }
  };

  const isLoading = classTypesLoading || staffLoading || locationsLoading;
  const isSubmitting = createClass.isPending || updateClass.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Class" : "Add New Class"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the class details below" 
              : "Fill in the details to create a new class"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Class Type */}
            <FormField
              control={form.control}
              name="class_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Type *</FormLabel>
                  <Select 
                    onValueChange={handleClassTypeChange} 
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instructor */}
            <FormField
              control={form.control}
              name="instructor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an instructor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No instructor assigned</SelectItem>
                      {staff?.filter(s => s.can_teach_classes)?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.display_name || member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No specific location</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room */}
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room / Studio</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Studio A, Main Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waitlist_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waitlist Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional notes about this specific class..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring */}
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Class</FormLabel>
                    <FormDescription>
                      Create this class on a weekly schedule
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

            {/* Recurring Configuration */}
            {form.watch("is_recurring") && (
              <RecurringClassConfig
                config={recurringConfig}
                onChange={setRecurringConfig}
              />
            )}

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
                {isEditing ? "Save Changes" : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
