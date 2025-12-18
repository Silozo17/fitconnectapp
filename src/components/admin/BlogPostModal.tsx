import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Image, Settings, X, Loader2, Eye, EyeOff, Sparkles, Upload, Trash2 } from "lucide-react";
import { BlogPost, useCreateBlogPost, useUpdateBlogPost, useBlogCategories } from "@/hooks/useBlogPosts";
import { useAIBlogFormatter } from "@/hooks/useAIBlogFormatter";
import { useBlogImage } from "@/hooks/useBlogImage";
import { AIBlogSuggestions } from "./AIBlogSuggestions";

interface BlogPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: BlogPost | null;
}

const BLOG_CATEGORIES = [
  "Training Tips",
  "Nutrition",
  "Fitness",
  "Mental Health",
  "Success Stories",
  "Industry News",
  "Coach Spotlight",
  "Beginner Guides",
];

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const BlogPostModal = ({ open, onOpenChange, post }: BlogPostModalProps) => {
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const { data: existingCategories } = useBlogCategories();
  const { formatContent, isFormatting, suggestions, clearSuggestions } = useAIBlogFormatter();
  const { uploadImage, deleteImage, isUploading, uploadProgress } = useBlogImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Training Tips",
    author: "FitConnect Team",
    featured_image: "",
    meta_title: "",
    meta_description: "",
    keywords: [] as string[],
    is_published: false,
  });
  
  const [keywordInput, setKeywordInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        author: post.author || "FitConnect Team",
        featured_image: post.featured_image || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        keywords: post.keywords || [],
        is_published: post.is_published || false,
      });
      setAutoSlug(false);
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "Training Tips",
        author: "FitConnect Team",
        featured_image: "",
        meta_title: "",
        meta_description: "",
        keywords: [],
        is_published: false,
      });
      setAutoSlug(true);
    }
    clearSuggestions();
  }, [post, open]);

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleAIFormat = async () => {
    await formatContent(formData.content, formData.title, formData.category);
  };

  const handleApplySuggestions = (selected: {
    content?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  }) => {
    setFormData(prev => ({
      ...prev,
      content: selected.content ?? prev.content,
      excerpt: selected.excerpt ?? prev.excerpt,
      meta_title: selected.metaTitle ?? prev.meta_title,
      meta_description: selected.metaDescription ?? prev.meta_description,
      keywords: selected.keywords ?? prev.keywords,
    }));
    clearSuggestions();
  };

  const handleSubmit = async () => {
    const readingTime = calculateReadingTime(formData.content);
    
    const postData = {
      ...formData,
      reading_time_minutes: readingTime,
      published_at: formData.is_published ? new Date().toISOString() : null,
    };

    if (post) {
      await updatePost.mutateAsync({ id: post.id, ...postData });
    } else {
      await createPost.mutateAsync(postData);
    }
    
    onOpenChange(false);
  };

  const isLoading = createPost.isPending || updatePost.isPending;
  const allCategories = [...new Set([...BLOG_CATEGORIES, ...(existingCategories || [])])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={suggestions ? "lg:col-span-2" : "lg:col-span-3"}>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-slug" className="text-xs text-muted-foreground">Auto-generate</Label>
                      <Switch
                        id="auto-slug"
                        checked={autoSlug}
                        onCheckedChange={setAutoSlug}
                      />
                    </div>
                  </div>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug"
                    disabled={autoSlug}
                  />
                  <p className="text-xs text-muted-foreground">/blog/{formData.slug || "your-slug"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary for blog cards..."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">{formData.excerpt.length} characters</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIFormat}
                        disabled={isFormatting || !formData.content.trim()}
                        className="gap-1"
                      >
                        {isFormatting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                        Format with AI
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                        {showPreview ? "Edit" : "Preview"}
                      </Button>
                    </div>
                  </div>
                  {showPreview ? (
                    <div 
                      className="border rounded-md p-4 min-h-[300px] prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content, {
                        ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'br', 'span', 'div'],
                        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
                      }) }}
                    />
                  ) : (
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your blog post content (plain text or HTML)..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.content.split(/\s+/).filter(w => w).length} words · ~{calculateReadingTime(formData.content)} min read
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title (defaults to post title)"
                    maxLength={60}
                  />
                  <p className={`text-xs ${formData.meta_title.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (defaults to excerpt)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className={`text-xs ${formData.meta_description.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                    />
                    <Button type="button" onClick={handleAddKeyword} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Search Preview</h4>
                  <div className="space-y-1">
                    <p className="text-primary text-lg truncate">
                      {formData.meta_title || formData.title || "Post Title"}
                    </p>
                    <p className="text-xs text-green-600">
                      fitconnect.co.uk/blog/{formData.slug || "post-slug"}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.meta_description || formData.excerpt || "Post description will appear here..."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Cover Image</Label>
                  
                  {/* Drag & Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary/50 ${
                      isUploading ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const url = await uploadImage(file);
                        if (url) setFormData(prev => ({ ...prev, featured_image: url }));
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) setFormData(prev => ({ ...prev, featured_image: url }));
                        }
                        e.target.value = '';
                      }}
                    />
                    
                    {isUploading ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                        <Progress value={uploadProgress} className="w-48 mx-auto" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop an image or <span className="text-primary">click to browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP or GIF · Max 5MB · Recommended: 1200×630px
                        </p>
                      </>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-border" />
                    <span>OR paste URL</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  {/* URL Input */}
                  <Input
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Preview */}
                {formData.featured_image && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Preview</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (formData.featured_image.includes('blog-images')) {
                            await deleteImage(formData.featured_image);
                          }
                          setFormData(prev => ({ ...prev, featured_image: '' }));
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={formData.featured_image}
                        alt="Featured"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <Label htmlFor="is_published" className="text-base">Publish Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_published ? "Post is live and visible to everyone" : "Post is saved as draft"}
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-2">Post Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Word Count:</dt>
                      <dd>{formData.content.split(/\s+/).filter(w => w).length} words</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Reading Time:</dt>
                      <dd>~{calculateReadingTime(formData.content)} min</dd>
                    </div>
                    {post && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Created:</dt>
                          <dd>{new Date(post.created_at || "").toLocaleDateString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Last Updated:</dt>
                          <dd>{new Date(post.updated_at || "").toLocaleDateString()}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Suggestions Panel */}
          {suggestions && (
            <div className="lg:col-span-1">
              <AIBlogSuggestions
                suggestions={suggestions}
                onApply={handleApplySuggestions}
                onClose={clearSuggestions}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.slug || !formData.excerpt || !formData.content || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {post ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
