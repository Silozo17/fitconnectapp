import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGym } from '@/contexts/GymContext';
import { 
  useGymWebsiteSettings, 
  useUpsertWebsiteSettings,
  useGymGallery,
  useAddGalleryImage,
  useDeleteGalleryImage,
  useGymTestimonials,
  useAddTestimonial,
  useUpdateTestimonial,
  useGymSocialLinks,
  useUpsertSocialLink,
  useGymOpeningHours,
  useUpsertOpeningHours,
  useGymFeaturedTrainers,
  useAddFeaturedTrainer,
  useUpdateFeaturedTrainer,
} from '@/hooks/gym/useGymWebsite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Palette, 
  Image, 
  MessageSquare, 
  Clock, 
  Users, 
  Share2, 
  Settings,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Star,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

export default function GymAdminWebsite() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const [activeTab, setActiveTab] = useState('general');

  const { data: settings, isLoading: loadingSettings } = useGymWebsiteSettings(gymId);
  const { data: gallery = [] } = useGymGallery(gymId);
  const { data: testimonials = [] } = useGymTestimonials(gymId);
  const { data: socialLinks = [] } = useGymSocialLinks(gymId);
  const { data: openingHours = [] } = useGymOpeningHours(gymId);
  const { data: trainers = [] } = useGymFeaturedTrainers(gymId);

  const upsertSettings = useUpsertWebsiteSettings();
  const addGalleryImage = useAddGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();
  const addTestimonial = useAddTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const upsertSocialLink = useUpsertSocialLink();
  const upsertOpeningHours = useUpsertOpeningHours();
  const addTrainer = useAddFeaturedTrainer();
  const updateTrainer = useUpdateFeaturedTrainer();

  // Form states
  const [generalForm, setGeneralForm] = useState({
    hero_title: settings?.hero_title || '',
    hero_subtitle: settings?.hero_subtitle || '',
    about_title: settings?.about_title || '',
    about_content: settings?.about_content || '',
    mission_statement: settings?.mission_statement || '',
  });

  const [seoForm, setSeoForm] = useState({
    meta_title: settings?.meta_title || '',
    meta_description: settings?.meta_description || '',
    og_image_url: settings?.og_image_url || '',
    google_analytics_id: settings?.google_analytics_id || '',
    facebook_pixel_id: settings?.facebook_pixel_id || '',
  });

  const [themeForm, setThemeForm] = useState({
    theme_color: settings?.theme_color || '#3B82F6',
    secondary_color: settings?.secondary_color || '#10B981',
  });

  const handleSaveGeneral = async () => {
    if (!gymId) return;
    try {
      await upsertSettings.mutateAsync({
        gym_id: gymId,
        ...generalForm,
      });
      toast.success('Website content saved');
    } catch (error) {
      toast.error('Failed to save website content');
    }
  };

  const handleSaveSEO = async () => {
    if (!gymId) return;
    try {
      await upsertSettings.mutateAsync({
        gym_id: gymId,
        ...seoForm,
      });
      toast.success('SEO settings saved');
    } catch (error) {
      toast.error('Failed to save SEO settings');
    }
  };

  const handleSaveTheme = async () => {
    if (!gymId) return;
    try {
      await upsertSettings.mutateAsync({
        gym_id: gymId,
        ...themeForm,
      });
      toast.success('Theme settings saved');
    } catch (error) {
      toast.error('Failed to save theme settings');
    }
  };

  const handleToggleSection = async (section: string, enabled: boolean) => {
    if (!gymId) return;
    try {
      await upsertSettings.mutateAsync({
        gym_id: gymId,
        [`${section}_enabled`]: enabled,
      });
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const handleApproveTestimonial = async (id: string, approved: boolean) => {
    if (!gymId) return;
    try {
      await updateTestimonial.mutateAsync({
        id,
        gymId,
        is_approved: approved,
      });
      toast.success(approved ? 'Testimonial approved' : 'Testimonial hidden');
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  if (loadingSettings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Builder</h1>
          <p className="text-muted-foreground">Customize your public gym website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/club/${gym?.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Site
            </a>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <Image className="h-4 w-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Settings className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* General Content Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The first thing visitors see on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input
                  value={generalForm.hero_title}
                  onChange={(e) => setGeneralForm({ ...generalForm, hero_title: e.target.value })}
                  placeholder="Welcome to Our Gym"
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Textarea
                  value={generalForm.hero_subtitle}
                  onChange={(e) => setGeneralForm({ ...generalForm, hero_subtitle: e.target.value })}
                  placeholder="Transform your body and mind with our expert trainers"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>Tell visitors about your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>About Title</Label>
                <Input
                  value={generalForm.about_title}
                  onChange={(e) => setGeneralForm({ ...generalForm, about_title: e.target.value })}
                  placeholder="About Us"
                />
              </div>
              <div className="space-y-2">
                <Label>About Content</Label>
                <Textarea
                  value={generalForm.about_content}
                  onChange={(e) => setGeneralForm({ ...generalForm, about_content: e.target.value })}
                  placeholder="Tell your story..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={generalForm.mission_statement}
                  onChange={(e) => setGeneralForm({ ...generalForm, mission_statement: e.target.value })}
                  placeholder="Our mission is to..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website Sections</CardTitle>
              <CardDescription>Enable or disable sections on your public website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'features', label: 'Features & Amenities' },
                { key: 'testimonials', label: 'Testimonials' },
                { key: 'classes', label: 'Classes Schedule' },
                { key: 'trainers', label: 'Our Trainers' },
                { key: 'pricing', label: 'Pricing Plans' },
                { key: 'contact', label: 'Contact Form' },
                { key: 'gallery', label: 'Photo Gallery' },
              ].map((section) => (
                <div key={section.key} className="flex items-center justify-between">
                  <Label>{section.label}</Label>
                  <Switch
                    checked={settings?.[`${section.key}_enabled` as keyof typeof settings] as boolean ?? true}
                    onCheckedChange={(checked) => handleToggleSection(section.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} disabled={upsertSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </Button>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your website appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={themeForm.theme_color}
                      onChange={(e) => setThemeForm({ ...themeForm, theme_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={themeForm.theme_color}
                      onChange={(e) => setThemeForm({ ...themeForm, theme_color: e.target.value })}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={themeForm.secondary_color}
                      onChange={(e) => setThemeForm({ ...themeForm, secondary_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={themeForm.secondary_color}
                      onChange={(e) => setThemeForm({ ...themeForm, secondary_color: e.target.value })}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-6 rounded-lg border" style={{ backgroundColor: themeForm.theme_color + '10' }}>
                <h3 className="font-semibold mb-2" style={{ color: themeForm.theme_color }}>Preview</h3>
                <p className="text-sm text-muted-foreground mb-4">This is how your brand colors will look</p>
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: themeForm.theme_color }}>Primary Button</Button>
                  <Button style={{ backgroundColor: themeForm.secondary_color }}>Secondary</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const existing = socialLinks.find((l) => l.platform === platform.id);
                return (
                  <div key={platform.id} className="flex items-center gap-4">
                    <span className="text-2xl">{platform.icon}</span>
                    <Label className="w-24">{platform.name}</Label>
                    <Input
                      defaultValue={existing?.url || ''}
                      placeholder={`https://${platform.id}.com/yourgym`}
                      onBlur={(e) => {
                        if (e.target.value && gymId) {
                          upsertSocialLink.mutate({
                            gym_id: gymId,
                            platform: platform.id,
                            url: e.target.value,
                            display_order: SOCIAL_PLATFORMS.indexOf(platform),
                          });
                        }
                      }}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveTheme} disabled={upsertSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>Showcase your gym facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((image) => (
                  <div key={image.id} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Gallery image'}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => gymId && deleteGalleryImage.mutate({ id: image.id, gymId })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {image.is_featured && (
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                ))}
                <button
                  className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg hover:border-primary transition-colors"
                  onClick={() => {
                    // TODO: Implement image upload
                    toast.info('Image upload coming soon');
                  }}
                >
                  <div className="text-center text-muted-foreground">
                    <Plus className="h-8 w-8 mx-auto mb-2" />
                    <span>Add Photo</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Testimonials</CardTitle>
              <CardDescription>Manage reviews and testimonials from members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testimonials.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No testimonials yet. Testimonials from members will appear here.
                  </p>
                ) : (
                  testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {testimonial.author_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{testimonial.author_name}</p>
                            {testimonial.author_role && (
                              <p className="text-sm text-muted-foreground">{testimonial.author_role}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {testimonial.is_approved ? (
                            <Badge variant="default">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          <Button
                            size="sm"
                            variant={testimonial.is_approved ? 'outline' : 'default'}
                            onClick={() => handleApproveTestimonial(testimonial.id, !testimonial.is_approved)}
                          >
                            {testimonial.is_approved ? (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 text-muted-foreground">{testimonial.content}</p>
                      {testimonial.rating && (
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opening Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
              <CardDescription>Set your gym's operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, index) => {
                  const hours = openingHours.find((h) => h.day_of_week === index);
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <Label className="w-28">{day}</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!hours?.is_closed}
                          onCheckedChange={(open) => {
                            if (!gymId) return;
                            const existing = openingHours.filter((h) => h.day_of_week !== index);
                            upsertOpeningHours.mutate([
                              ...existing.map((h) => ({
                                gym_id: h.gym_id,
                                location_id: h.location_id,
                                day_of_week: h.day_of_week,
                                open_time: h.open_time,
                                close_time: h.close_time,
                                is_closed: h.is_closed,
                                special_note: h.special_note,
                              })),
                              {
                                gym_id: gymId,
                                location_id: null,
                                day_of_week: index,
                                open_time: hours?.open_time || '06:00',
                                close_time: hours?.close_time || '22:00',
                                is_closed: !open,
                                special_note: null,
                              },
                            ]);
                          }}
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {hours?.is_closed ? 'Closed' : 'Open'}
                        </span>
                      </div>
                      {!hours?.is_closed && (
                        <>
                          <Input
                            type="time"
                            className="w-32"
                            defaultValue={hours?.open_time || '06:00'}
                            onBlur={(e) => {
                              if (!gymId) return;
                              upsertOpeningHours.mutate([
                                {
                                  gym_id: gymId,
                                  location_id: null,
                                  day_of_week: index,
                                  open_time: e.target.value,
                                  close_time: hours?.close_time || '22:00',
                                  is_closed: false,
                                  special_note: null,
                                },
                              ]);
                            }}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            className="w-32"
                            defaultValue={hours?.close_time || '22:00'}
                            onBlur={(e) => {
                              if (!gymId) return;
                              upsertOpeningHours.mutate([
                                {
                                  gym_id: gymId,
                                  location_id: null,
                                  day_of_week: index,
                                  open_time: hours?.open_time || '06:00',
                                  close_time: e.target.value,
                                  is_closed: false,
                                  special_note: null,
                                },
                              ]);
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>Improve your visibility in search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title (max 60 characters)</Label>
                <Input
                  value={seoForm.meta_title}
                  onChange={(e) => setSeoForm({ ...seoForm, meta_title: e.target.value })}
                  placeholder={`${gym?.name} | Fitness Center`}
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground">
                  {seoForm.meta_title.length}/60 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description (max 160 characters)</Label>
                <Textarea
                  value={seoForm.meta_description}
                  onChange={(e) => setSeoForm({ ...seoForm, meta_description: e.target.value })}
                  placeholder="Join our fitness community and transform your life..."
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {seoForm.meta_description.length}/160 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label>Social Share Image URL</Label>
                <Input
                  value={seoForm.og_image_url}
                  onChange={(e) => setSeoForm({ ...seoForm, og_image_url: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630 pixels
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Connect your analytics tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={seoForm.google_analytics_id}
                  onChange={(e) => setSeoForm({ ...seoForm, google_analytics_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input
                  value={seoForm.facebook_pixel_id}
                  onChange={(e) => setSeoForm({ ...seoForm, facebook_pixel_id: e.target.value })}
                  placeholder="XXXXXXXXXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSEO} disabled={upsertSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save SEO Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
