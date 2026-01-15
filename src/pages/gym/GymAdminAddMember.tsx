import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const memberFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address_line_1: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().default("GB"),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  medical_conditions: z.string().optional(),
  injuries: z.string().optional(),
  allergies: z.string().optional(),
  marketing_source: z.string().optional(),
  marketing_source_other: z.string().optional(),
  marketing_consent: z.boolean().default(false),
  photo_consent: z.boolean().default(false),
  home_location_id: z.string().optional(),
  notes: z.string().optional(),
  send_welcome_email: z.boolean().default(true),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const MARKETING_SOURCES = [
  { value: "google", label: "Google Search" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Friend/Family Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "flyer", label: "Flyer/Poster" },
  { value: "event", label: "Event/Open Day" },
  { value: "other", label: "Other" },
];

export default function GymAdminAddMember() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const { gym } = useGym();
  const { data: locations } = useGymLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      address_line_1: "",
      city: "",
      postcode: "",
      country: "GB",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      medical_conditions: "",
      injuries: "",
      allergies: "",
      marketing_source: "",
      marketing_source_other: "",
      marketing_consent: false,
      photo_consent: false,
      home_location_id: "",
      notes: "",
      send_welcome_email: true,
    },
  });

  const marketingSource = form.watch("marketing_source");

  const onSubmit = async (values: MemberFormValues) => {
    if (!gym?.id) {
      toast.error("No gym selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a temporary user for the member
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        email_confirm: true,
        user_metadata: {
          first_name: values.first_name,
          last_name: values.last_name,
        },
      });

      // If user already exists, try to find them
      let userId: string;
      if (authError?.message?.includes("already been registered")) {
        const { data: existingUser } = await supabase
          .from("gym_members")
          .select("user_id")
          .eq("gym_id", gym.id)
          .eq("email", values.email)
          .single();
        
        if (existingUser) {
          toast.error("A member with this email already exists");
          setIsSubmitting(false);
          return;
        }
        
        // Get user ID from auth.users via RPC or edge function
        // For now, we'll create member without user_id link
        userId = crypto.randomUUID();
      } else if (authError) {
        throw authError;
      } else {
        userId = authData.user.id;
      }

      // Prepare member data
      const memberData = {
        gym_id: gym.id,
        user_id: userId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        address_line_1: values.address_line_1 || null,
        city: values.city || null,
        postcode: values.postcode || null,
        country: values.country || "GB",
        emergency_contact_name: values.emergency_contact_name || null,
        emergency_contact_phone: values.emergency_contact_phone || null,
        emergency_contact_relationship: values.emergency_contact_relationship || null,
        medical_conditions: values.medical_conditions 
          ? values.medical_conditions.split(",").map(s => s.trim()).filter(Boolean)
          : null,
        injuries: values.injuries
          ? values.injuries.split(",").map(s => s.trim()).filter(Boolean)
          : null,
        allergies: values.allergies
          ? values.allergies.split(",").map(s => s.trim()).filter(Boolean)
          : null,
        marketing_source: values.marketing_source || null,
        marketing_source_other: values.marketing_source_other || null,
        marketing_consent: values.marketing_consent,
        photo_consent: values.photo_consent,
        home_location_id: values.home_location_id || null,
        notes: values.notes || null,
        status: "active",
        joined_at: new Date().toISOString(),
      };

      const { data: newMember, error } = await supabase
        .from("gym_members")
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;

      // Send welcome email if enabled
      if (values.send_welcome_email && newMember?.id) {
        supabase.functions.invoke("gym-send-welcome-email", {
          body: { memberId: newMember.id, gymId: gym.id },
        }).catch((err) => {
          console.error("Failed to send welcome email:", err);
        });
      }

      toast.success("Member added successfully");
      navigate(`/gym-admin/${gymId}/members/${newMember.id}`);
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/gym-admin/${gymId}/members`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Member</h1>
          <p className="text-muted-foreground">
            Manually add a member to your gym
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Basic member information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+44 7123 456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Member's home address</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="SW1A 1AA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {locations && locations.length > 0 && (
                <FormField
                  control={form.control}
                  name="home_location_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select home location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
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
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Who to contact in an emergency</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+44 7123 456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Spouse, Parent, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Health and safety details (comma-separated)</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="medical_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Asthma, Diabetes"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter conditions separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="injuries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Injuries</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Lower back pain, Knee injury"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Latex, Peanuts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Marketing */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing & Consent</CardTitle>
              <CardDescription>How they found you and consent preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="marketing_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did they find you?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MARKETING_SOURCES.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {marketingSource === "other" && (
                <FormField
                  control={form.control}
                  name="marketing_source_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Source</FormLabel>
                      <FormControl>
                        <Input placeholder="Please specify" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="marketing_consent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Marketing Consent</FormLabel>
                      <FormDescription>
                        Receive marketing emails and promotions
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
                name="photo_consent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Photo Consent</FormLabel>
                      <FormDescription>
                        Photos may be used in promotional materials
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
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this member..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="send_welcome_email"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-4">
                    <div className="space-y-0.5">
                      <FormLabel>Send Welcome Email</FormLabel>
                      <FormDescription>
                        Send login details and welcome message
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
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to={`/gym-admin/${gymId}/members`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Member
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
