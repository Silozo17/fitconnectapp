import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGym } from '@/contexts/GymContext';
import { 
  useGymAnnouncements, 
  useAddAnnouncement, 
  useUpdateAnnouncement 
} from '@/hooks/gym/useGymWebsite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Eye, 
  EyeOff, 
  Pencil,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'events', label: 'Events' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'updates', label: 'Updates' },
  { value: 'tips', label: 'Tips & Advice' },
];

export default function GymAdminAnnouncements() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: announcements = [], isLoading } = useGymAnnouncements(gymId);
  const addAnnouncement = useAddAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'news',
    is_published: false,
    meta_title: '',
    meta_description: '',
  });

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'news',
      is_published: false,
      meta_title: '',
      meta_description: '',
    });
    setEditingId(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    if (!gymId || !form.title || !form.content) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      const slug = form.slug || generateSlug(form.title);
      
      if (editingId) {
        await updateAnnouncement.mutateAsync({
          id: editingId,
          gymId,
          ...form,
          slug,
          published_at: form.is_published ? new Date().toISOString() : null,
        });
        toast.success('Announcement updated');
      } else {
        await addAnnouncement.mutateAsync({
          gym_id: gymId,
          ...form,
          slug,
          published_at: form.is_published ? new Date().toISOString() : null,
          tags: null,
          featured_image_url: null,
          author_name: null,
        });
        toast.success('Announcement created');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (announcement: typeof announcements[0]) => {
    setForm({
      title: announcement.title,
      slug: announcement.slug,
      content: announcement.content,
      excerpt: announcement.excerpt || '',
      category: announcement.category,
      is_published: announcement.is_published,
      meta_title: announcement.meta_title || '',
      meta_description: announcement.meta_description || '',
    });
    setEditingId(announcement.id);
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    if (!gymId) return;
    try {
      await updateAnnouncement.mutateAsync({
        id,
        gymId,
        is_published: published,
        published_at: published ? new Date().toISOString() : null,
      });
      toast.success(published ? 'Published' : 'Unpublished');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements & Blog</h1>
          <p className="text-muted-foreground">Create news, events, and updates for your members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>
                Write an announcement, news article, or blog post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder={generateSlug(form.title) || 'auto-generated'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary (shown in previews)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your content here..."
                  rows={8}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">SEO Settings</h4>
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder={form.title || 'Enter SEO title'}
                    maxLength={70}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder={form.excerpt || 'Enter SEO description'}
                    maxLength={160}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_published}
                    onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                  />
                  <Label>Publish immediately</Label>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={addAnnouncement.isPending || updateAnnouncement.isPending}
                >
                  {editingId ? 'Update' : 'Create'} Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first announcement to engage with your members
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                        {announcement.is_published ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {CATEGORIES.find((c) => c.value === announcement.category)?.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{announcement.title}</h3>
                    {announcement.excerpt && (
                      <p className="text-muted-foreground text-sm mb-2">{announcement.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                      </span>
                      <span>{announcement.views_count} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.is_published}
                      onCheckedChange={(checked) => handleTogglePublish(announcement.id, checked)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(announcement)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {announcement.is_published && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`/club/${gym?.slug}/news/${announcement.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
