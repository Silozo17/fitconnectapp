import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateProduct, CONTENT_CATEGORIES, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { useAIProductAssist } from "@/hooks/useAIProductAssist";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload, Link, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  short_description: z.string().max(150).optional(),
  description: z.string().optional(),
  content_type: z.enum(["ebook", "video_course", "single_video", "template", "audio", "other"]),
  category: z.string(),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.coerce.number().min(0),
  compare_at_price: z.coerce.number().min(0).optional().or(z.literal("")),
  currency: z.string(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  preview_url: z.string().url().optional().or(z.literal("")),
  content_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  duration_minutes: z.coerce.number().optional(),
  page_count: z.coerce.number().optional(),
  is_downloadable: z.boolean(),
  is_streamable: z.boolean(),
  is_published: z.boolean(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function CreateProductModal({ open, onOpenChange }: CreateProductModalProps) {
  const createProduct = useCreateProduct();
  const { generateDescription, generateTags, isGeneratingDescription, isGeneratingTags } = useAIProductAssist();
  const { toast } = useToast();
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      short_description: "",
      description: "",
      content_type: "ebook",
      category: "other",
      difficulty_level: "intermediate",
      price: 0,
      compare_at_price: "",
      currency: "GBP",
      cover_image_url: "",
      preview_url: "",
      content_url: "",
      video_url: "",
      duration_minutes: undefined,
      page_count: undefined,
      is_downloadable: false,
      is_streamable: false,
      is_published: false,
      tags: "",
    },
  });

  const contentType = form.watch("content_type");
  const title = form.watch("title");
  const category = form.watch("category");

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    form.setValue("title", newTitle);
    // Only auto-generate if slug is empty or matches the old auto-generated slug
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === generateSlug(form.getValues("title"))) {
      form.setValue("slug", generateSlug(newTitle));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setUploadedImageUrl(publicUrl);
      form.setValue("cover_image_url", publicUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIDescription = async () => {
    const result = await generateDescription(title, contentType, category);
    if (result) {
      form.setValue("short_description", result.short_description);
      form.setValue("description", result.full_description);
      toast({ title: "Description generated!" });
    }
  };

  const handleAITags = async () => {
    const result = await generateTags(title, contentType, category);
    if (result) {
      form.setValue("tags", result.join(", "));
      toast({ title: "Tags generated!" });
    }
  };

  const onSubmit = async (values: FormValues) => {
    const tags = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    
    // Use uploaded image if available and tab is upload
    const coverImageUrl = imageTab === "upload" && uploadedImageUrl 
      ? uploadedImageUrl 
      : values.cover_image_url;

    await createProduct.mutateAsync({
      ...values,
      tags,
      slug: values.slug || undefined,
      compare_at_price: values.compare_at_price ? Number(values.compare_at_price) : null,
      cover_image_url: coverImageUrl || null,
      preview_url: values.preview_url || null,
      content_url: values.content_url || null,
      video_url: values.video_url || null,
    });
    
    form.reset();
    setUploadedImageUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Digital Product</DialogTitle>
          <DialogDescription>
            Add a new e-book, video course, template, or other digital content
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Ultimate 12-Week Workout Program" 
                        {...field}
                        onChange={handleTitleChange}
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
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ultimate-12-week-workout-program" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-generated from title. Customize for SEO-friendly URLs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Short Description</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAIDescription}
                        disabled={isGeneratingDescription || !title}
                        className="h-8 text-xs gap-1"
                      >
                        {isGeneratingDescription ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        AI Assist
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="Brief summary for cards (max 150 chars)" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Full Description</FormLabel>
                      {!isGeneratingDescription && (
                        <span className="text-xs text-muted-foreground">
                          Use AI Assist above to generate both
                        </span>
                      )}
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of your product..." 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tags</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAITags}
                        disabled={isGeneratingTags || !title}
                        className="h-6 text-xs gap-1 px-2"
                      >
                        {isGeneratingTags ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Suggest
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="weight loss, strength, HIIT" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Set to 0 for free</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compare_at_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare at Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="Original price" {...field} />
                    </FormControl>
                    <FormDescription>For discounts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <FormLabel>Cover Image</FormLabel>
              <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as "upload" | "url")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="h-4 w-4" />
                    Paste URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImageUrl ? (
                    <div className="relative">
                      <img 
                        src={uploadedImageUrl} 
                        alt="Cover preview" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-5 w-5 mr-2" />
                      )}
                      {isUploading ? "Uploading..." : "Click to upload cover image"}
                    </Button>
                  )}
                </TabsContent>
                <TabsContent value="url">
                  <FormField
                    control={form.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Other URLs */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="preview_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial/Preview Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormDescription>Free preview so buyers can see what they're getting</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(contentType === "video_course" || contentType === "single_video" || contentType === "audio") && (
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Video/audio streaming URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="content_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Download URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Downloadable file URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {(contentType === "video_course" || contentType === "single_video" || contentType === "audio") && (
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {contentType === "ebook" && (
                <FormField
                  control={form.control}
                  name="page_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="is_downloadable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Downloadable</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_streamable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Streamable</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Publish Now</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
