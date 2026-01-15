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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RecurringClassConfig, RecurringConfig } from "./RecurringClassConfig";
import { format } from "date-fns";
import { Loader2, Calendar, Repeat, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const classFormSchema = z.object({
  class_type_id: z.string().min(1, "Class type is required"),
  location_id: z.string().optional(),
  class_schedule_type: z.enum(["one_off", "recurring"]).default("one_off"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  instructor_id: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  waitlist_capacity: z.coerce.number().min(0).default(0),
  room: z.string().optional(),
  description: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classToEdit?: GymClass | null;
  defaultDate?: Date;
  defaultLocationId?: string;
}

export function ClassFormDialog({ 
  open, 
  onOpenChange, 
  classToEdit,
  defaultDate = new Date(),
  defaultLocationId,
}: ClassFormDialogProps) {
  const { gym } = useGym();
  const { data: classTypes, isLoading: classTypesLoading } = useGymClassTypes();
  const { data: staff, isLoading: staffLoading } = useGymStaff();
  const { data: locations, isLoading: locationsLoading } = useGymLocations();
  const createClass = useCreateGymClass();
  const updateClass = useUpdateGymClass();
  const [isGenerating, setIsGenerating] = useState(false);

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
      location_id: defaultLocationId || "",
      class_schedule_type: "one_off",
      start_time: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      instructor_id: "none",
      capacity: 20,
      waitlist_capacity: 5,
      room: "",
      description: "",
    },
  });

  // Reset form when editing a class or when dialog opens
  useEffect(() => {
    if (classToEdit) {
      form.reset({
        class_type_id: classToEdit.class_type_id,
        location_id: classToEdit.location_id || "",
        class_schedule_type: classToEdit.is_recurring ? "recurring" : "one_off",
        start_time: format(new Date(classToEdit.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(classToEdit.end_time), "yyyy-MM-dd'T'HH:mm"),
        instructor_id: classToEdit.instructor_id || "none",
        capacity: classToEdit.capacity,
        waitlist_capacity: classToEdit.waitlist_capacity,
        room: classToEdit.room || "",
        description: classToEdit.description || "",
      });
    } else if (open) {
      form.reset({
        class_type_id: "",
        location_id: defaultLocationId || "",
        class_schedule_type: "one_off",
        start_time: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        instructor_id: "none",
        capacity: 20,
        waitlist_capacity: 5,
        room: "",
        description: "",
      });
    }
  }, [classToEdit, defaultDate, form, open, defaultLocationId]);

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
      const isRecurring = values.class_schedule_type === "recurring";
      
      // Build recurring pattern if needed
      const recurringPattern = isRecurring ? {
        frequency: recurringConfig.frequency,
        daysOfWeek: recurringConfig.daysOfWeek,
        endType: recurringConfig.endType,
        endDate: recurringConfig.endDate,
        occurrences: recurringConfig.occurrences,
      } : null;

      const classData = {
        class_type_id: values.class_type_id,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        instructor_id: values.instructor_id === "none" ? null : values.instructor_id || null,
        location_id: values.location_id || null,
        capacity: values.capacity,
        waitlist_capacity: values.waitlist_capacity,
        room: values.room || null,
        description: values.description || null,
        is_recurring: isRecurring,
        is_recurring_template: isRecurring,
        recurring_pattern: recurringPattern,
        status: "scheduled",
      };

      if (isEditing && classToEdit) {
        await updateClass.mutateAsync({
          classId: classToEdit.id,
          updates: classData,
        });
      } else {
        const result = await createClass.mutateAsync(classData);
        
        // If recurring, generate class instances
        if (isRecurring && result?.id) {
          setIsGenerating(true);
          try {
            const { data: session } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke(
              "gym-generate-recurring-classes",
              {
                body: {
                  templateClassId: result.id,
                  weeksAhead: 8,
                },
                headers: {
                  Authorization: `Bearer ${session.session?.access_token}`,
                },
              }
            );

            if (error) {
              console.error("Failed to generate recurring classes:", error);
              toast.error("Class template created, but failed to generate instances");
            } else {
              toast.success(`Generated ${data?.created || 0} class instances`);
            }
          } catch (err) {
            console.error("Error generating recurring classes:", err);
          } finally {
            setIsGenerating(false);
          }
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to save class:", error);
    }
  };

  const isLoading = classTypesLoading || staffLoading || locationsLoading;
  const isSubmitting = createClass.isPending || updateClass.isPending || isGenerating;

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

            {/* Location - Moved up for prominence */}
            {locations && locations.length > 0 && (
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </FormLabel>
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
            )}

            {/* Class Schedule Type - Moved up for prominence */}
            <FormField
              control={form.control}
              name="class_schedule_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Class Schedule *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="one_off"
                          id="one_off"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="one_off"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Calendar className="mb-2 h-5 w-5" />
                          <span className="font-medium text-sm">One-off Class</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            Single occurrence
                          </span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="recurring"
                          id="recurring"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="recurring"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Repeat className="mb-2 h-5 w-5" />
                          <span className="font-medium text-sm">Recurring Class</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            Repeats on schedule
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Configuration - Shows when recurring is selected */}
            {form.watch("class_schedule_type") === "recurring" && (
              <RecurringClassConfig
                config={recurringConfig}
                onChange={setRecurringConfig}
              />
            )}

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("class_schedule_type") === "recurring" ? "First Class Date/Time *" : "Start Time *"}
                    </FormLabel>
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
                      <SelectItem value="none">No instructor assigned</SelectItem>
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
