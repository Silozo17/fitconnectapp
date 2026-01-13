import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

const gymSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address_line1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type GymFormData = z.infer<typeof gymSchema>;

export default function GymRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GymFormData>({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      email: "",
      phone: "",
      website: "",
      address_line1: "",
      city: "",
      postal_code: "",
      country: "United Kingdom",
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.getValues("name").slice(0, -1))) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const onSubmit = async (data: GymFormData) => {
    if (!user) {
      toast.error("You must be logged in to register a gym");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if slug is already taken
      const { data: existing } = await supabase
        .from("gym_profiles")
        .select("id")
        .eq("slug", data.slug)
        .single();

      if (existing) {
        form.setError("slug", { message: "This slug is already taken" });
        setIsSubmitting(false);
        return;
      }

      // Create gym profile
      const { data: gym, error: gymError } = await supabase
        .from("gym_profiles")
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          email: data.email,
          phone: data.phone || null,
          website: data.website || null,
          address_line1: data.address_line1,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          owner_id: user.id,
        } as never)
        .select()
        .single();

      if (gymError) throw gymError;

      // Add current user as owner in gym_staff
      const { error: staffError } = await supabase
        .from("gym_staff")
        .insert({
          gym_id: gym.id,
          user_id: user.id,
          role: "owner",
          is_active: true,
        } as never);

      if (staffError) throw staffError;

      toast.success("Gym registered successfully!");
      navigate(`/gym/${data.slug}/admin`);
    } catch (error: any) {
      console.error("Error registering gym:", error);
      toast.error(error.message || "Failed to register gym");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to register your gym</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Register Your Gym</h1>
          <p className="text-muted-foreground mt-2">
            Set up your gym on FitConnect and start managing members, classes, and payments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gym Details</CardTitle>
            <CardDescription>
              Enter your gym's information. You can update these details later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Gym Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Iron Fitness" 
                            {...field} 
                            onChange={handleNameChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-1">fitconnect.app/gym/</span>
                            <Input placeholder="iron-fitness" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This will be your gym's unique URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell members about your gym..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
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
                        <FormLabel>Contact Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@ironfitness.com" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+44 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://ironfitness.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Address</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address_line1"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Fitness Street" {...field} />
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
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="London" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="SW1A 1AA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="United Kingdom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Gym"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
